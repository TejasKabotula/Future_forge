import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const SummaryView = ({ summary }) => {
    if (!summary) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden"
        >
            <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-white/5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Video Summary ({summary.type})</h3>
            </div>

            <div className="p-6 text-gray-300 leading-relaxed whitespace-pre-wrap font-light">
                {summary.content}
            </div>
        </motion.div>
    );
};

export default SummaryView;
