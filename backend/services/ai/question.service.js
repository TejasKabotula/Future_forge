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

class QuestionService {
    static async generateQuestions(transcript, count = 10, language = 'en') {
        try {
            const langPrompt = language === 'hi' ? "Generate questions in Hindi-English mixed (Hinglish)." :
                language === 'te' ? "Generate questions in Telugu." : "Generate questions in English.";

            const groq = getGroqClient();
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a teacher creating a quiz from a video transcript. ${langPrompt}
                        Generate a valid JSON array of question objects.
                        Rules:
                        1. Output ONLY valid JSON. No markdown, no "Here is the JSON".
                        2. Array format: [{"question": "What is the capital of France?", "options": ["Paris", "London", "Berlin", "Madrid"], "answer": "Paris", "difficulty": "Medium"}]
                        3. The "answer" field MUST be the EXACT string content of the correct option. Do NOT use "A", "B", "C", "D" unless those are the actual option texts.
                        4. Create 5 questions.`
                    },
                    {
                        role: "user",
                        content: `Generate 5 MCQ questions based on this text:\n\n${transcript.substring(0, 15000)}`
                    }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.1, // Lower temperature means more deterministic
            });

            let content = completion.choices[0]?.message?.content || "[]";

            // Robust cleaning
            const jsonStart = content.indexOf('[');
            const jsonEnd = content.lastIndexOf(']') + 1;

            if (jsonStart !== -1 && jsonEnd !== -1) {
                content = content.substring(jsonStart, jsonEnd);
            }

            try {
                const parsed = JSON.parse(content);
                // Basic validation
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error("JSON Parse Error in Questions:", e);
                return [];
            }
        } catch (error) {
            console.error("Question Generation Error:", error);
            return [];
        }
    }
}

module.exports = QuestionService;
