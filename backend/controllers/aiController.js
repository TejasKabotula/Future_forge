const OpenAI = require("openai");
const TranscriptService = require('../services/youtube/transcript.service');
const SummarizationService = require('../services/ai/summarization.service');
const QuestionService = require('../services/ai/question.service');
const ClarificationService = require('../services/ai/clarification.service');

exports.chatWithGrok = async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ status: 'error', message: "Messages array is required" });
    }

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({
            status: 'error',
            message: "Configuration Error: GROQ_API_KEY is missing."
        });
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1",
        });

        const completion = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are a helpful YouTube learning assistant. You help users understand video content, answer questions about their playlists, and provide study tips. Keep answers concise and encouraging." },
                ...messages
            ],
        });

        res.json({
            status: 'success',
            data: completion.choices[0].message
        });
    } catch (error) {
        console.error("Groq API Error:", error);
        // IMPORTANT: Never return 401 to frontend — the axios interceptor treats ANY 401
        // as an auth failure and redirects to /login. Always use 500 for AI service errors.
        let msg = "Failed to communicate with AI service.";
        if (error.status === 401 || error.message?.includes('401')) {
            msg = "AI Configuration Error: The GROQ_API_KEY is invalid. Please contact the administrator.";
        } else {
            msg = error.error?.error?.message || error.message || msg;
        }
        res.status(500).json({ status: 'error', message: msg });
    }
};

exports.processVideo = async (req, res) => {
    try {
        const { youtubeUrl, transcriptText, language, summaryLevel } = req.body;

        let transcript = transcriptText;

        if (!transcript && youtubeUrl) {
            try {
                transcript = await TranscriptService.getTranscript(youtubeUrl);
            } catch (err) {
                return res.status(422).json({ status: 'error', message: `Transcript failed: ${err.message}. Please use Manual Mode.` });
            }
        }

        if (!transcript) {
            return res.status(422).json({ status: 'error', message: 'Could not retrieve transcript. Please use Manual Mode.' });
        }

        // Sequential AI Processing (to avoid Rate Limits)
        const summary = await SummarizationService.generateSummary(transcript, summaryLevel, language);

        let questions = [];
        try {
            await new Promise(r => setTimeout(r, 2000));
            questions = await QuestionService.generateQuestions(transcript, 5, language);
        } catch (err) {
            console.error('Question generation skipped:', err.message);
        }

        let clarifications = [];
        try {
            await new Promise(r => setTimeout(r, 2000));
            clarifications = await ClarificationService.generateClarifications(transcript, language);
        } catch (err) {
            console.error('Clarification generation skipped:', err.message);
        }

        res.json({
            status: 'success',
            data: {
                summary,
                questions,
                clarifications
            }
        });

    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
    }
};
