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

class ClarificationService {
    static async generateClarifications(transcript, language = 'en') {
        try {
            const langPrompt = language === 'hi' ? "Provide explanations in Hindi-English mixed (Hinglish)." :
                language === 'te' ? "Provide explanations in Telugu." : "Provide explanations in English.";

            const groq = getGroqClient();
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a potential doubt detector. Identify 3-5 complex concepts from the transcript that a student might find confusing. ${langPrompt}
                        Rules:
                        1. Output ONLY valid JSON array. No markdown, no pre-text.
                        2. Format: [{"concept": "...", "clarification": "..."}]
                        3. Clarification should be simple, using an analogy.`
                    },
                    {
                        role: "user",
                        content: `Analyze this text for complex topics:\n\n${transcript.substring(0, 15000)}`
                    }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.2,
            });

            let content = completion.choices[0]?.message?.content || "[]";

            const jsonStart = content.indexOf('[');
            const jsonEnd = content.lastIndexOf(']') + 1;

            if (jsonStart !== -1 && jsonEnd !== -1) {
                content = content.substring(jsonStart, jsonEnd);
            }

            try {
                return JSON.parse(content);
            } catch (e) {
                console.error("JSON Parse Error in Clarifications:", e);
                return [];
            }
        } catch (error) {
            console.error("Clarification Generation Error:", error);
            return [];
        }
    }
}

module.exports = ClarificationService;
