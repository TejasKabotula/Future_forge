import React, { useState, useEffect } from 'react';
import { Save, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useBlocker } from 'react-router-dom';

const NotesSection = ({ playlistId, videoId, videoTitle, isDirty, setIsDirty }) => {
    const [note, setNote] = useState('');

    // Reset notes when changing video
    useEffect(() => {
        setNote('');
        if (setIsDirty) setIsDirty(false);
    }, [playlistId, videoId, setIsDirty]);

    // Handle browser close/refresh
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Handle in-app navigation blocking (Router only)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === "blocked") {
            const stay = window.confirm("You have unsaved notes! Click OK to stay and download them. Click Cancel to discard and leave.");
            if (stay) {
                blocker.reset();
            } else {
                blocker.proceed();
            }
        }
    }, [blocker]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(16);
        doc.text(videoTitle || "Learning Notes", 10, 10);

        // Add Content (wrapped)
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(note, 180);
        doc.text(splitText, 10, 20);

        // Sanitize filename
        const safeTitle = (videoTitle || `notes-${videoId}`).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`${safeTitle}.pdf`);
        if (setIsDirty) setIsDirty(false);
    };

    const handleChange = (e) => {
        setNote(e.target.value);
        if (setIsDirty) setIsDirty(true);
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-white/5 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    My Notes
                </h3>
                {isDirty && (
                    <span className="text-xs text-amber-500 font-medium animate-pulse">
                        Unsaved Changes
                    </span>
                )}
            </div>

            <div className="relative">
                <textarea
                    className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:outline-none focus:border-primary/50 min-h-[200px] resize-y font-mono text-sm leading-relaxed"
                    placeholder="Write your key takeaways here..."
                    value={note}
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-end mt-4">
                <button
                    onClick={handleDownloadPDF}
                    disabled={!note.trim()}
                    className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={18} />
                    Download as PDF
                </button>
            </div>
        </div>
    );
};

export default NotesSection;
