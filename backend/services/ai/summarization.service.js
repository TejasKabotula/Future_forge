const Groq = require('groq-sdk');
require('dotenv').config();

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in environment variables.");
    }
    return new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
};

class SummarizationService {
    static async generateSummary(transcript, level = 'medium', language = 'en') {
        const prompts = {
            short: "Provide a concise bullet-point summary.",
            medium: "Provide a structured paragraph summary of the key points.",
            detailed: "Provide detailed study notes with headers and sub-points."
        };

        const langInstruction = language === 'hi' ? "Output in Hindi-English mixed (Hinglish)." :
            language === 'te' ? "Output in Telugu." : "Output in English.";

        const prompt = prompts[level] || prompts.medium;

        try {
            const groq = getGroqClient();
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert educational assistant efficiently summarizing video content. ${langInstruction}
                        Ensure the summary is clear, accurate, and matches the requested format.`
                    },
                    {
                        role: "user",
                        content: `${prompt}\n\nTranscript:\n${transcript.substring(0, 15000)}` // Truncate to avoid context limit issues roughly
                    }
                ],
                model: "llama-3.1-8b-instant", // Switch to faster model to avoid rate limits
                temperature: 0.5,
            });

            return {
                type: level,
                content: completion.choices[0]?.message?.content || "Summary generation failed."
            };
        } catch (error) {
            console.error("Summarization Error Detailed:", JSON.stringify(error, null, 2));
            console.error("Summarization Error Message:", error.message);
            // Return safe fallback
            return {
                type: level,
                content: `Error generating summary: ${error.message || 'Unknown error'}. Please try again.`
            };
        }
    }
}

module.exports = SummarizationService;
