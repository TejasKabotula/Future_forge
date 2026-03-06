
const express = require('express');
const router = express.Router();
const TranscriptService = require('./transcript.service');
const SummarizationService = require('./summarization.service');
const QuestionService = require('./question.service');
const ClarificationService = require('./clarification.service');

// POST /api/ai/process
router.post('/process', async (req, res) => {
    try {
        const { youtubeUrl, transcriptText, language, summaryLevel } = req.body;

        let transcript = transcriptText;

        if (!transcript && youtubeUrl) {
            console.log('Fetching transcript for:', youtubeUrl);
            try {
                transcript = await TranscriptService.getTranscript(youtubeUrl);
            } catch (err) {
                console.error("Transcript fetch failed:", err.message);
                return res.status(422).json({ error: `Transcript failed: ${err.message}. Please use Manual Mode.` });
            }
        }

        if (!transcript) {
            return res.status(422).json({ error: 'Could not retrieve transcript. Please use Manual Mode.' });
        }

        // 2. Parallel AI Processing
        // 2. Sequential AI Processing (to avoid Rate Limits)
        console.log('Starting AI processing (Sequential)...');

        // Priority 1: Summary (Critical)
        console.log('Generating Summary...');
        const summary = await SummarizationService.generateSummary(transcript, summaryLevel, language);

        // Priority 2: Questions (Optional - Fail Gracefully)
        let questions = [];
        try {
            console.log('Waiting 2s before generating Questions...');
            await new Promise(r => setTimeout(r, 2000)); // Rate limit buffer
            questions = await QuestionService.generateQuestions(transcript, 5, language);
        } catch (err) {
            console.error('Question generation skipped:', err.message);
        }

        // Priority 3: Clarifications (Optional - Fail Gracefully)
        let clarifications = [];
        try {
            console.log('Waiting 2s before generating Clarifications...');
            await new Promise(r => setTimeout(r, 2000)); // Rate limit buffer
            clarifications = await ClarificationService.generateClarifications(transcript, language);
        } catch (err) {
            console.error('Clarification generation skipped:', err.message);
        }

        res.json({
            summary,
            questions,
            clarifications
        });

    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

module.exports = router;
