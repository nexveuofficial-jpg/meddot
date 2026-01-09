import { useState, useRef, useEffect } from 'react';
import { Send, X, Paperclip, Smile } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

export default function ChatInput({ onSend, replyTo, onCancelReply, editingMessage, onCancelEdit, allowImages }) {
    const [text, setText] = useState("");
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Sync for Edit
    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.content);
            if (textareaRef.current) textareaRef.current.focus();
        }
    }, [editingMessage]);

    // Auto-grow
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
    }, [text]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSend(e);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (onSend) onSend(null, file); 
        e.target.value = '';
        if (onCancelReply) onCancelReply();
    };

    return (
        <div className="w-full bg-[#0F1623]/90 backdrop-blur-xl border-t border-white/10 p-4 pb-safe-area-bottom">
            <div className="max-w-4xl mx-auto">
                {/* Reply / Edit Preview */}
                {(replyTo || editingMessage) && (
                    <div className="flex items-center justify-between bg-slate-800/50 border border-white/5 rounded-t-xl p-3 mb-2 animate-in slide-in-from-bottom-2 fade-in">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-1 h-8 rounded-full ${editingMessage ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                            <div className="flex flex-col overflow-hidden">
                                <span className={`text-xs font-bold uppercase tracking-wider ${editingMessage ? 'text-amber-500' : 'text-cyan-500'}`}>
                                    {editingMessage ? 'Editing Message' : `Replying to ${replyTo.user_name}`}
                                </span>
                                <span className="text-sm text-slate-400 truncate max-w-[200px] md:max-w-md">
                                    {editingMessage ? editingMessage.content : (replyTo.content || 'Attachment')}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                if (editingMessage) { onCancelEdit(); setText(""); }
                                else onCancelReply();
                            }} 
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={16} className="text-slate-400" />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-3 bg-slate-900/50 border border-slate-700/50 rounded-[1.5rem] p-2 pr-2 shadow-lg ring-1 ring-white/5 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/50 transition-all duration-300">
                    {/* Attachments */}
                    {allowImages && (
                        <>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button
                                className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all"
                                title="Attach Image"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip size={20} strokeWidth={2} />
                            </button>
                        </>
                    )}

                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 py-3 px-2 resize-none max-h-[120px] scrollbar-hide text-sm md:text-base leading-relaxed"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{ minHeight: '44px' }}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className={`
                            p-2.5 rounded-full transition-all duration-300 shadow-lg flex-shrink-0
                            ${text.trim() 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 hover:shadow-cyan-500/25' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                        `}
                    >
                        <Send size={18} strokeWidth={2.5} className={text.trim() ? "ml-0.5" : ""} />
                    </button>
                </div>
            </div>
        </div>
    );
}
