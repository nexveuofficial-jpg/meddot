"use client";

import Link from "next/link";
import { CheckCircle, MessageCircle, Clock } from "lucide-react";
import GlassCard from "../ui/GlassCard";

export default function QuestionCard({ question, onUserClick }) {
    // Handle answers count structure depending on how it's fetched (array or count object)
    const answerCount = Array.isArray(question.answers)
        ? question.answers.length
        : (question.answers?.[0]?.count || 0);

    const getCategoryBadgeStyle = (cat) => {
        switch(cat) {
            case 'Exam Strategy': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Anatomy': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'Physiology': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Clinical Postings': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
        }
    };

    return (
        <Link
            href={`/ask-senior/${question.id}`}
            className="block h-full group"
        >
            <GlassCard className="h-full flex flex-col p-6 hover:bg-[#1e293b]/80 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getCategoryBadgeStyle(question.category || question.subject)}`}>
                        {question.subject || 'General'}
                    </span>
                    {question.is_resolved && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                            <CheckCircle size={12} /> Solved
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {question.title}
                </h3>
                
                <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                    {question.body}
                </p>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-white/5 mt-auto">
                    <div
                        className="flex items-center gap-2 hover:text-cyan-400 transition-colors z-10"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onUserClick && onUserClick(question.author_id);
                        }}
                    >
                        <span className="font-medium">
                            {question.profiles?.username || question.profiles?.full_name || question.author_name || 'Anonymous'}
                        </span>
                        {(question.profiles?.role === 'admin' || question.profiles?.role === 'senior') && (
                            <span className={`
                                px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border
                                ${question.profiles?.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}
                            `}>
                                {question.profiles?.role}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <MessageCircle size={14} className={answerCount > 0 ? "text-cyan-400" : ""} />
                            {answerCount}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                             <Clock size={14} />
                             {new Date(question.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </GlassCard>
        </Link>
    );
}
