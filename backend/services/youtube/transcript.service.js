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
            console.log('[Transcript] Attempting yt-dlp subtitle fetch (no-ffmpeg mode)...');

            const ytDlpPath = this.getBinaryPath('yt-dlp');
            // Remove --convert-subs srt to avoid ffmpeg requirement
            const cmd = `"${ytDlpPath}" --write-sub --write-auto-sub --sub-lang "en,en-US,en-GB,en-orig" --skip-download --output "${tempBase}" "${url}"`;

            await this.execWithEnhancedPath(cmd);

            const dir = path.dirname(tempBase);
            const files = fs.readdirSync(dir);
            // Look for .vtt or .srt
            const subFile = files.find(f => f.startsWith(`temp_subs_${videoId}`) && (f.endsWith('.srt') || f.endsWith('.vtt')));

            if (!subFile) {
                throw new Error('No subtitle file found after download attempt');
            }

            const subPath = path.join(dir, subFile);
            const content = fs.readFileSync(subPath, 'utf-8');

            const result = subFile.endsWith('.vtt') ? this.parseVtt(content) : this.parseSrt(content);

            // Cleanup immediately
            files.filter(f => f.startsWith(`temp_subs_${videoId}`)).forEach(f => {
                try { fs.unlinkSync(path.join(dir, f)); } catch (e) { }
            });

            if (!result || result.trim().length < 50) {
                throw new Error('Parsed transcript is too short or empty');
            }

            return result;

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
            const cleanLine = line.trim();
            if (/^\d+$/.test(cleanLine)) continue;
            if (cleanLine.includes('-->')) continue;
            if (!cleanLine) continue;
            if (cleanLine.startsWith('<')) continue; // Remove HTML/XML tags

            if (textLines.length === 0 || textLines[textLines.length - 1] !== cleanLine) {
                textLines.push(cleanLine);
            }
        }
        return textLines.join(' ');
    }

    static parseVtt(vttContent) {
        const lines = vttContent.split(/\r?\n/);
        const textLines = [];

        let isBody = false;
        for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine === 'WEBVTT') {
                isBody = true;
                continue;
            }
            if (!isBody) continue;

            if (cleanLine.includes('-->')) continue;
            if (/^\d+$/.test(cleanLine)) continue;
            if (!cleanLine) continue;
            if (cleanLine.startsWith('Kind:') || cleanLine.startsWith('Language:')) continue;

            // Remove VTT tags like <c.color> or <00:00:00.000>
            const textOnly = cleanLine.replace(/<[^>]+>/g, '');
            if (!textOnly.trim()) continue;

            if (textLines.length === 0 || textLines[textLines.length - 1] !== textOnly) {
                textLines.push(textOnly);
            }
        }
        return textLines.join(' ');
    }

    static async transcribeWithWhisper(url, videoId) {
        const tempPath = path.resolve(__dirname, `temp_${videoId}.m4a`);

        try {
            console.log('[Transcript] Downloading audio with yt-dlp (m4a)...');

            const ytDlpPath = this.getBinaryPath('yt-dlp');
            // Use a more robust format selector and avoid large video files
            // Try best audio, but limit to 50MB if possible (though Whisper limit is 25MB)
            // We use -f "ba" which is usually a single stream M4A or OPUS
            const cmd = `"${ytDlpPath}" -f "ba/ba*" -o "${tempPath}" "${url}"`;

            console.log(`[Transcript] Executing: ${cmd}`);
            await this.execWithEnhancedPath(cmd);

            if (!fs.existsSync(tempPath)) {
                const dir = path.dirname(tempPath);
                const files = fs.readdirSync(dir);
                const audioFile = files.find(f => f.startsWith(`temp_${videoId}`) && !f.endsWith('.part'));
                if (audioFile) {
                    const actualPath = path.join(dir, audioFile);
                    fs.renameSync(actualPath, tempPath);
                } else {
                    throw new Error('Audio file not created by yt-dlp');
                }
            }

            // Check file size (Whisper limit is 25MB)
            const stats = fs.statSync(tempPath);
            const fileSizeMB = stats.size / (1024 * 1024);
            console.log(`[Transcript] Audio file size: ${fileSizeMB.toFixed(2)} MB`);

            if (fileSizeMB > 24.5) {
                throw new Error(`Video audio is too large (${fileSizeMB.toFixed(2)} MB) for AI transcription. Max limit is 25MB. Please try a shorter video or use one with captions.`);
            }

            console.log('[Transcript] Sending to Groq Whisper...');
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
