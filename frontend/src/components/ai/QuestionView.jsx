import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import api from '../../services/api';

const QuestionView = ({ questions }) => {
    const [revealed, setRevealed] = useState({});
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    if (!questions || questions.length === 0) return (
        <div className="text-center text-gray-500 p-8">No questions generated.</div>
    );

    const toggleReveal = (idx) => {
        setRevealed(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleOptionClick = (qIdx, option) => {
        if (revealed[qIdx] || quizResult) return;
        setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
    };

    const areEqual = (a, b) => {
        if (!a || !b) return false;
        return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
    };

    const checkAnswer = (question, selectedOpt) => {
        if (!selectedOpt) return false;

        // 1. Direct text match (Case-insensitive)
        if (areEqual(selectedOpt, question.answer)) return true;

        // 2. Fallback: Check if answer is a letter (A, B, C, D) and maps to the index
        const cleanAnswer = String(question.answer).trim().toUpperCase();
        if (/^[A-D]$/.test(cleanAnswer)) {
            const selectedIdx = question.options.findIndex(opt => areEqual(opt, selectedOpt));
            if (selectedIdx === -1) return false;

            const correctIdx = cleanAnswer.charCodeAt(0) - 65; // A=0, B=1...
            return selectedIdx === correctIdx;
        }

        return false;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        let score = 0;
        let newRevealed = {};

        questions.forEach((q, idx) => {
            if (checkAnswer(q, selectedAnswers[idx])) {
                score++;
            }
            newRevealed[idx] = true;
        });

        setRevealed(newRevealed);

        const percentage = Math.round((score / questions.length) * 100);
        const resultData = {
            score,
            total: questions.length,
            percentage
        };
        setQuizResult(resultData);

        try {
            await api.post('/api/auth/quiz-result', {
                score,
                total: questions.length,
                topic: "AI Generated Quiz"
            });
        } catch (error) {
            console.error("Failed to save quiz result", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Result Card */}
            <AnimatePresence>
                {quizResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                                <Trophy size={32} className="text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-1">{quizResult.percentage}%</h3>
                            <p className="text-purple-200">You scored {quizResult.score} out of {quizResult.total}</p>
                            <p className="text-xs text-zinc-400 mt-2">Result saved to your profile!</p>
                        </div>
                        <div className="absolute inset-0 bg-purple-500/5 blur-3xl rounded-full"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {questions.map((q, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
                >
                    <div className="p-4 md:p-5">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-4 mb-4">
                            <h4 className="text-base md:text-lg font-medium text-white flex-1 leading-snug">{idx + 1}. {q.question}</h4>
                            <span className={`self-start md:self-center px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${q.difficulty === 'Easy' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                q.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                    'border-red-500/30 text-red-400 bg-red-500/10'
                                }`}>
                                {q.difficulty || 'Medium'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {q.options && q.options.map((opt, i) => {
                                const isSelected = selectedAnswers[idx] === opt;
                                const isCorrect = checkAnswer(q, opt); // Check if THIS option is the correct one
                                const isRevealed = revealed[idx];

                                let btnClass = "bg-black/30 text-gray-400 hover:bg-black/50 border-transparent";

                                if (isSelected) {
                                    btnClass = "bg-purple-500/20 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]";
                                }

                                if (isRevealed) {
                                    if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-200 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
                                    else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-200";
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleOptionClick(idx, opt)}
                                        disabled={!!quizResult}
                                        className={`w-full text-left p-3 rounded-lg border transition-all duration-200 text-sm md:text-base ${btnClass}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${isSelected || (isRevealed && isCorrect) ? 'border-current' : 'border-gray-600'
                                                }`}>
                                                {(isSelected || (isRevealed && isCorrect)) && (
                                                    <div className="w-2 h-2 rounded-full bg-current" />
                                                )}
                                            </div>
                                            <span>{opt}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {!quizResult && (
                            <button
                                onClick={() => toggleReveal(idx)}
                                className="mt-4 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors ml-auto"
                            >
                                {revealed[idx] ? (
                                    <>Hide Answer <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                    <>Show Answer <ChevronDown className="w-4 h-4" /></>
                                )}
                            </button>
                        )}

                        <AnimatePresence>
                            {revealed[idx] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-3 pt-3 border-t border-white/5 text-green-400 text-sm font-medium flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4 shrink-0" />
                                    <span>Correct Answer: {q.answer}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            ))}

            {!quizResult && (
                <div className="flex justify-center pt-4 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(selectedAnswers).length === 0}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 w-full md:w-auto"
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionView;
