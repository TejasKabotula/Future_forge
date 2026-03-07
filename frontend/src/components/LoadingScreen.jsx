import React, { useState, useEffect } from 'react';
import { Loader2, Server, Globe, Zap, Cpu } from 'lucide-react';

const loadingMessages = [
    { text: "Waking up the server...", icon: Server },
    { text: "Dusting off the database...", icon: Globe },
    { text: "Connecting to the neural network...", icon: Cpu },
    { text: "Almost there, just a moment...", icon: Zap },
    { text: "Preparing your learning space...", icon: Loader2 }
];

const LoadingScreen = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 3000); // Change message every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = loadingMessages[messageIndex].icon;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>

            {/* Central Content */}
            <div className="z-10 flex flex-col items-center gap-8">
                {/* Visual Loader */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-purple-600 animate-spin-slow blur-md absolute inset-0 opacity-50"></div>
                    <div className="w-24 h-24 rounded-2xl bg-surface border border-white/10 flex items-center justify-center relative shadow-2xl">
                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 animate-pulse">
                            L
                        </span>
                    </div>
                    {/* Orbiting particles */}
                    <div className="absolute -inset-4 animate-spin-reverse">
                        <div className="w-3 h-3 bg-secondary rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#fff]"></div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-center gap-3 h-20">
                    <h2 className="text-2xl font-bold tracking-tight">LearnTrackYT</h2>

                    <div className="flex items-center gap-2 text-zinc-400 animate-fade-in-up key={messageIndex}">
                        <CurrentIcon size={18} className="animate-bounce" />
                        <span className="font-medium tracking-wide">
                            {loadingMessages[messageIndex].text}
                        </span>
                    </div>
                </div>

                {/* Progress Bar (Visual only, creates feeling of movement) */}
                <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-purple-500 w-1/2 animate-loading-bar rounded-full"></div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-xs text-zinc-600">
                Deploying excellence...
            </div>
        </div>
    );
};

export default LoadingScreen;
