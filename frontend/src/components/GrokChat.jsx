import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

const GrokChat = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Initial Greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const greeting = user?.username
                ? `Hello ${user.username}! I'm your AI study companion. Need help with a summary or a quiz?`
                : "Hello! I'm your AI study companion. How can I help you today?";

            setMessages([{ role: 'assistant', content: greeting }]);
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Contextualize with previous messages (last 10)
            const recentMessages = [...messages.slice(-10), userMsg].map(m => ({
                role: m.role,
                content: m.content
            }));

            const { data } = await api.post('/api/ai/chat', { messages: recentMessages });
            setMessages(prev => [...prev, data.data]);
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "I'm having trouble connecting right now. Please try again.";
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[100] w-full md:w-[400px] h-full md:h-[550px] bg-black/95 md:bg-[#121214]/95 backdrop-blur-2xl md:border border-white/10 md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden font-sans"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Sparkles size={20} className="text-white fill-white/20" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121214]"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base tracking-wide">Study Assistant</h3>
                                <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 hover:rotate-90 transition-all duration-300 text-zinc-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
                        {messages.map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={clsx(
                                        "flex gap-3 max-w-[90%]",
                                        isUser ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                                        isUser ? "bg-zinc-800 border border-white/10" : "bg-gradient-to-tr from-purple-600 to-blue-600"
                                    )}>
                                        {isUser ? (
                                            <span className="text-xs font-bold text-zinc-300">
                                                {user?.username?.[0]?.toUpperCase() || <UserIcon size={14} />}
                                            </span>
                                        ) : (
                                            <Bot size={16} className="text-white" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={clsx(
                                        "p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-xl backdrop-blur-sm border",
                                        isUser
                                            ? "bg-zinc-800 text-white rounded-tr-sm border-white/5"
                                            : "bg-white/5 text-zinc-100 rounded-tl-sm border-white/10 shadow-black/20"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                                    <Bot size={16} className="text-white" />
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-10 w-16">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#121214]/90 border-t border-white/5 backdrop-blur-xl">
                        <form onSubmit={handleSend} className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Ask ${user?.username || 'me'} anything...`}
                                className="w-full bg-black/40 border border-white/10 group-hover:border-white/20 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-700/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                <Send size={18} className={loading ? 'opacity-0' : 'ml-0.5'} />
                                {loading && <div className="absolute inset-0 m-auto w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            </button>
                        </form>
                        <p className="text-[10px] text-center text-zinc-600 mt-2">
                            AI can make mistakes. Check important info.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GrokChat;
