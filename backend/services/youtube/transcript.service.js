const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { Innertube, UniversalCache } = require('youtubei.js');
const { YoutubeTranscript } = require('youtube-transcript');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in environment variables.");
    }
    return new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
};

// Build a PATH that includes common deno install locations
const getEnhancedPath = () => {
    const homeDir = os.homedir();
    const extraPaths = [
        path.join(homeDir, '.deno', 'bin'),           // deno default install
        path.resolve(__dirname, '..', '..', 'bin'),    // local bin folder
    ];
    return extraPaths.join(path.delimiter) + path.delimiter + process.env.PATH;
};

class TranscriptService {
    static extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    static async getTranscript(url) {
        let lastError = null;
        const errors = [];
        console.log(`[Transcript] Processing URL: ${url}`);
        const videoId = this.extractVideoId(url);
        if (!videoId) throw new Error('Invalid YouTube URL');

        // --- STRATEGY 1: InnerTube (simulates real client) ---
        try {
            console.log('[Transcript] Strategy 1: InnerTube (Android Client)...');
            const youtube = await Innertube.create({
                cache: new UniversalCache(false),
                generate_session_locally: true
            });

            const info = await youtube.getInfo(videoId);
            const transcriptData = await info.getTranscript();

            if (transcriptData?.transcript?.content?.body?.initial_segments) {
                const text = transcriptData.transcript.content.body.initial_segments
                    .map(seg => seg.snippet.text)
                    .join(' ');

                if (!text || text.length < 50) {
                    throw new Error('InnerTube returned empty/short transcript');
                }

                console.log('[Transcript] Strategy 1 Success!');
                return text;
            }
            throw new Error('InnerTube: No transcript segments found (video may have no captions)');
        } catch (err) {
            console.log(`[Transcript] Strategy 1 Failed: ${err.message}`);
            errors.push(`InnerTube: ${err.message}`);
            lastError = err;
        }

        // --- STRATEGY 2: Standard youtube-transcript (Web Scraping) ---
        try {
            console.log('[Transcript] Strategy 2: Standard Scraping...');
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
            const text = transcriptItems.map(item => item.text).join(' ');

            if (!text || text.length < 50) {
                throw new Error('Web scraping returned empty/short transcript (video may have no captions)');
            }

            console.log('[Transcript] Strategy 2 Success!');
            return text;
        } catch (err) {
            console.log(`[Transcript] Strategy 2 Failed: ${err.message}`);
            errors.push(`WebScrape: ${err.message}`);
            lastError = err;
        }

        // --- STRATEGY 3: yt-dlp Subtitles (Direct Fetch) ---
        try {
            console.log('[Transcript] Strategy 3: yt-dlp Subtitles...');
            return await this.fetchSubtitlesWithYtDlp(url, videoId);
        } catch (err) {
            console.log(`[Transcript] Strategy 3 Failed: ${err.message}`);
            errors.push(`yt-dlp-subs: ${err.message}`);
            lastError = err;
        }

        // --- STRATEGY 4: Whisper (Audio Download via yt-dlp) ---
        try {
            console.log('[Transcript] Strategy 4: Whisper AI Fallback (via yt-dlp)...');
            return await this.transcribeWithWhisper(url, videoId);
        } catch (err) {
            console.error(`[Transcript] Strategy 4 Failed: ${err.message}`);
            errors.push(`Whisper: ${err.message}`);
            lastError = err;
        }

        throw new Error(`All transcript strategies failed. Last error: ${lastError?.message}`);
    }

    static getBinaryPath(binary) {
        const binDir = path.resolve(__dirname, '..', '..', 'bin');
        const localPath = path.join(binDir, binary);
        const localPathExe = path.join(binDir, `${binary}.exe`);

        if (fs.existsSync(localPathExe)) {
            return localPathExe;
        }
        if (fs.existsSync(localPath)) {
            return localPath;
        }
        return binary;
    }

    static async execWithEnhancedPath(cmd) {
        const enhancedPath = getEnhancedPath();
        return execPromise(cmd, {
            env: { ...process.env, PATH: enhancedPath },
            maxBuffer: 10 * 1024 * 1024  // 10MB buffer for large outputs
        });
    }

    static async fetchSubtitlesWithYtDlp(url, videoId) {
        const tempBase = path.resolve(__dirname, `temp_subs_${videoId}`);

        try {
            console.log('[Transcript] Attempting yt-dlp subtitle fetch...');

            const ytDlpPath = this.getBinaryPath('yt-dlp');
            const cmd = `"${ytDlpPath}" --write-sub --write-auto-sub --sub-lang "en,en-US,en-GB,en-orig" --skip-download --convert-subs srt --output "${tempBase}" "${url}"`;

            await this.execWithEnhancedPath(cmd);

            const dir = path.dirname(tempBase);
            const files = fs.readdirSync(dir);
            const subFile = files.find(f => f.startsWith(`temp_subs_${videoId}`) && f.endsWith('.srt'));

            if (!subFile) {
                throw new Error('No subtitle file downloaded');
            }

            const content = fs.readFileSync(path.join(dir, subFile), 'utf-8');

            // Cleanup immediately
            files.filter(f => f.startsWith(`temp_subs_${videoId}`)).forEach(f => {
                try { fs.unlinkSync(path.join(dir, f)); } catch (e) { }
            });

            return this.parseSrt(content);

        } catch (error) {
            // Cleanup on error
            const dir = path.dirname(tempBase);
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                files.filter(f => f.startsWith(`temp_subs_${videoId}`)).forEach(f => {
                    try { fs.unlinkSync(path.join(dir, f)); } catch (e) { }
                });
            }
            throw error;
        }
    }

    static parseSrt(srtContent) {
        const lines = srtContent.split(/\r?\n/);
        const textLines = [];

        for (const line of lines) {
            if (/^\d+$/.test(line.trim())) continue;
            if (line.includes('-->')) continue;
            if (!line.trim()) continue;

            const cleanLine = line.trim();
            if (textLines.length === 0 || textLines[textLines.length - 1] !== cleanLine) {
                textLines.push(cleanLine);
            }
        }
        return textLines.join(' ');
    }

    static async transcribeWithWhisper(url, videoId) {
        const tempPath = path.resolve(__dirname, `temp_${videoId}.m4a`);

        try {
            console.log('[Transcript] Downloading audio with yt-dlp (m4a)...');

            const ytDlpPath = this.getBinaryPath('yt-dlp');
            // Use a more flexible format selector: prefer m4a but fall back to any audio
            const cmd = `"${ytDlpPath}" -f "bestaudio[ext=m4a]/bestaudio" -o "${tempPath}" "${url}"`;

            console.log(`[Transcript] Executing: ${cmd}`);
            await this.execWithEnhancedPath(cmd);

            if (!fs.existsSync(tempPath)) {
                // Check if yt-dlp saved with a different extension
                const dir = path.dirname(tempPath);
                const files = fs.readdirSync(dir);
                const audioFile = files.find(f => f.startsWith(`temp_${videoId}`) && !f.endsWith('.part'));
                if (audioFile) {
                    const actualPath = path.join(dir, audioFile);
                    console.log(`[Transcript] Audio saved as: ${actualPath}`);
                    // Rename to expected path
                    fs.renameSync(actualPath, tempPath);
                } else {
                    throw new Error('Audio file not created by yt-dlp');
                }
            }

            console.log('[Transcript] Audio downloaded, sending to Groq Whisper...');

            const groq = getGroqClient();
            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(tempPath),
                model: "whisper-large-v3",
                response_format: "text"
            });

            return transcription;

        } catch (error) {
            throw error;
        } finally {
            // Cleanup any temp files
            try {
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                const dir = path.dirname(tempPath);
                const files = fs.readdirSync(dir);
                files.filter(f => f.startsWith(`temp_${videoId}`)).forEach(f => {
                    try { fs.unlinkSync(path.join(dir, f)); } catch (e) { }
                });
            } catch (e) { }
        }
    }
}

module.exports = TranscriptService;
