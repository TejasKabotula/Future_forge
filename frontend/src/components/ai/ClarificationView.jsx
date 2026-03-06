import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';

const ClarificationView = ({ clarifications }) => {
    if (!clarifications || clarifications.length === 0) return (
        <div className="text-center text-gray-500 p-8">No complex concepts detected requiring clarification.</div>
    );

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {clarifications.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-white/10 p-1 relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative bg-gray-900/90 rounded-lg p-5 h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                            </div>
                            <h3 className="font-bold text-lg text-white">{item.concept || item.Concept}</h3>
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed">
                            {item.clarification || item.Clarification}
                        </p>

                        <div className="absolute top-2 right-2 opacity-20">
                            <Sparkles className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ClarificationView;
