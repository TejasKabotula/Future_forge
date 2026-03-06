import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, ArrowRight } from 'lucide-react';

const JumpBackIn = () => {
    const { user } = useAuth();
    if (!user?.lastActiveVideo) return null;

    const { playlistId, videoId, title, thumbnail } = user.lastActiveVideo;

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 group">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <img src={thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"} className="w-full h-full object-cover blur-3xl opacity-30 scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                {/* Thumbnail Card */}
                <div className="w-full md:w-80 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 relative shrink-0 group/card">
                    <img
                        src={thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                        alt={title}
                        onError={(e) => e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white">
                            <PlayCircle size={28} fill="currentColor" />
                        </div>
                    </div>
                    {/* Progress Bar (Fake for visual) */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-primary w-[65%]" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center text-center md:text-left h-full py-2">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-widest uppercase text-primary mb-3">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Jump Back In
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 line-clamp-2">
                        {title}
                    </h2>
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-1">Continue from where you left off</p>

                    <Link
                        to={`/playlist/${playlistId}?videoId=${videoId}`}
                        className="inline-flex items-center gap-2 bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 self-center md:self-start group/btn"
                    >
                        <PlayCircle size={20} fill="black" />
                        Resume Playing
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default JumpBackIn;
