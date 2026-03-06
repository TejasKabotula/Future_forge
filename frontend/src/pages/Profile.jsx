import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StudyHeatmap from '../components/StudyHeatmap';
import { User, Edit2, Check, X, Shield, Award, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [completedPlaylists, setCompletedPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchCompletedPlaylists();
        if (user) setNewUsername(user.username);
    }, [user]);

    const fetchCompletedPlaylists = async () => {
        try {
            const [response] = await Promise.all([
                api.get('/api/playlists'),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);
            const completed = response.data.filter(pl => pl.percent === 100);
            setCompletedPlaylists(completed);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!newUsername.trim()) return;
        setUpdating(true);
        try {
            // Ensure api.put returns the updated user object
            const { data } = await api.put('/api/auth/profile', { username: newUsername });

            // Use context to update the app state gracefully without reload
            updateUser(data);

        } catch (error) {
            console.error("Update failed:", error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
            setIsEditing(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto space-y-8 pb-20 pt-8"
        >
            {/* Removed the ternary check from here, so just render content directly */}
            <>
                {/* 1. Hero / Identity Section */}
                <motion.div variants={itemVariants} className="relative group">
                    {/* Decorative Blur behind */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

                    <div className="relative glass-card rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 overflow-hidden">

                        {/* Avatar Ring */}
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface border-4 border-surface shadow-2xl flex items-center justify-center relative z-10">
                                <span className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            {/* Animated Ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-slow scale-110" />
                            <div className="absolute inset-0 rounded-full border border-secondary/20 scale-125 opacity-50" />
                        </div>

                        {/* User Info Details */}
                        <div className="flex-1 text-center md:text-left space-y-4 w-full pt-2">
                            <div className="space-y-2">
                                <h2 className="text-sm font-medium text-primary tracking-wider uppercase flex items-center justify-center md:justify-start gap-2">
                                    <Shield size={14} /> Premium Student
                                </h2>

                                {isEditing ? (
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="bg-black/40 border border-white/20 rounded-xl px-5 py-3 text-2xl md:text-4xl font-bold text-white focus:outline-none focus:border-primary w-full md:w-auto min-w-[300px]"
                                            autoFocus
                                            placeholder="Enter username"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleUpdateProfile} className="p-3 bg-primary hover:bg-primary/80 rounded-xl text-white transition-colors">
                                                <Check size={20} />
                                            </button>
                                            <button onClick={() => setIsEditing(false)} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center md:justify-start gap-4 group/edit">
                                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                            {user?.username}
                                        </h1>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="opacity-0 group-hover/edit:opacity-100 transition-all p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white"
                                            title="Edit Profile"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-3 text-zinc-400 text-sm md:text-base">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    Online Status
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} className="text-zinc-500" />
                                    {user?.email}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats on Desktop */}
                        <div className="hidden md:flex flex-col gap-4 min-w-[200px] border-l border-white/5 pl-8">
                            <div className="text-right">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Level</p>
                                <p className="text-3xl font-bold text-white">
                                    {(completedPlaylists.length < 1) ? "Novice" :
                                        (completedPlaylists.length < 5) ? "Scholar" : "Master"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Courses</p>
                                <div className="flex items-center justify-end gap-1 text-orange-500 font-bold text-xl">
                                    <Award size={20} fill="currentColor" /> {completedPlaylists.length} Done
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 2. Heatmap Panel - Main Focus */}
                    <motion.div variants={itemVariants} className="">
                        <StudyHeatmap />
                    </motion.div>

                    {/* 3. Achievements / Stats Side Panel */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="glass-panel rounded-[2rem] p-6 flex flex-col h-full">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Award className="text-yellow-400" size={20} />
                                Achievements
                            </h3>

                            <div className="flex-1 space-y-4">
                                {completedPlaylists.length > 0 ? (
                                    completedPlaylists.map(pl => (
                                        <Link to={`/playlist/${pl._id}`} key={pl._id} className="block group">
                                            <div className="bg-black/20 hover:bg-white/5 border border-white/5 hover:border-primary/30 rounded-xl p-3 flex items-center gap-3 transition-all duration-300">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                                    <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm font-medium text-zinc-200 group-hover:text-primary transition-colors truncate">{pl.title}</h4>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Completed</p>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                                    <Award size={12} className="text-yellow-500" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                            <Award className="text-zinc-600" size={24} />
                                        </div>
                                        <p className="text-sm text-zinc-400 font-medium">No Trophies Yet</p>
                                        <p className="text-xs text-zinc-600 mt-1">Complete a playlist to earn badges!</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 mt-6 border-t border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Total Hours</span>
                                    <span className="text-white font-mono">
                                        {(completedPlaylists.length > 0
                                            ? completedPlaylists.reduce((acc, pl) => acc + (pl.totalDurationSeconds || 0), 0) / 3600
                                            : 0).toFixed(1)}h
                                    </span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(((completedPlaylists.length / 10) * 100), 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 4. Quiz Results Section */}
                <motion.div variants={itemVariants} className="mt-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Award className="text-purple-400" size={20} />
                        Quiz Performance
                    </h3>

                    {user?.quizResults?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {user.quizResults.slice().reverse().map((quiz, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 rounded-2xl p-4 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="text-sm font-medium text-zinc-300 line-clamp-1 pr-2" title={quiz.topic}>
                                            {quiz.topic || 'General Knowledge'}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${quiz.percentage >= 80 ? 'bg-green-500/20 text-green-400' :
                                            quiz.percentage >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {quiz.percentage}%
                                        </span>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-xs text-zinc-500">Score</div>
                                            <div className="text-lg font-bold text-white leading-none mt-1">
                                                {quiz.score}/{quiz.total}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-zinc-600">
                                            {new Date(quiz.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                            <p className="text-zinc-500">No quizzes taken yet. Go to Summary page to take a quiz!</p>
                        </div>
                    )}
                </motion.div>

            </>
        </motion.div >
    );
};

export default Profile;
