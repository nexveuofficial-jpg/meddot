"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, ThumbsUp, Trash2, Edit2, Shield, GraduationCap, Clock } from "lucide-react";
import Loader from "../../components/ui/Loader";
import RichTextEditor from "../../components/ui/RichTextEditor";
import GlassCard from "../../components/ui/GlassCard";
import GlassButton from "../../components/ui/GlassButton";
import RevealOnScroll from "../../components/ui/RevealOnScroll";
import UserAvatar from "../../components/ui/UserAvatar";

export default function QuestionDetailPage(props) {
    const params = use(props.params);
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user, profile, isAdmin, isSenior } = useAuth();
    const router = useRouter();
    const [editingAnswerId, setEditingAnswerId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const handleDeleteQuestion = async () => {
        if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) return;
        try {
            const { error } = await supabase.from("questions").delete().eq("id", params.id);
            if (error) throw error;
            router.push("/ask-senior");
        } catch (error) {
            alert("Error deleting question: " + error.message);
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        if (!confirm("Delete this answer?")) return;
        try {
            const { error } = await supabase.from("answers").delete().eq("id", answerId);
            if (error) throw error;
            setAnswers(prev => prev.filter(a => a.id !== answerId));
        } catch (error) {
            alert("Error deleting answer: " + error.message);
        }
    };

    const handleStartEdit = (answer) => {
        setEditingAnswerId(answer.id);
        setEditContent(answer.content);
    };

    const handleSaveEdit = async (answerId) => {
        try {
            const { error } = await supabase.from("answers").update({ content: editContent }).eq("id", answerId);
            if (error) throw error;
            
            setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, content: editContent } : a));
            setEditingAnswerId(null);
            setEditContent("");
        } catch (error) {
            alert("Error updating answer: " + error.message);
        }
    };

    const fetchQuestionAndAnswers = async () => {
        if (!params?.id) return;

        try {
            // Fetch Question
            const { data: qData, error: qError } = await supabase
                .from("questions")
                .select("*, profiles(username, full_name, email, role, year_of_study)")
                .eq("id", params.id)
                .single();

            if (qError) throw qError;

            if (!qData) {
                setLoading(false);
                return;
            }

            // Safe profile access
            const profile = Array.isArray(qData.profiles) ? qData.profiles[0] : qData.profiles;
            const authorName = profile?.username || profile?.full_name || (profile?.email?.split('@')[0]) || qData.author_name || 'Anonymous';

            setQuestion({
                ...qData,
                profiles: profile || { full_name: 'Anonymous' },
                display_name: authorName,
                author_year: profile?.year_of_study
            });

            // Fetch Answers
            const { data: aData, error: aError } = await supabase
                .from("answers")
                .select("*, profiles(*)")
                .eq("question_id", params.id);

            if (aError) throw aError;

            const mappedAnswers = (aData || []).map(d => {
                const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
                const dName = p?.username || p?.full_name || (p?.email?.split('@')[0]) || d.author_name || 'Anonymous';
                const dRole = p?.role || d.author_role || 'student';

                return {
                    ...d,
                    profiles: p || {
                        full_name: d.author_name || 'Anonymous',
                        role: dRole
                    },
                    display_name: dName,
                    author_year: p?.year_of_study,
                    display_role: dRole === 'admin' ? 'Admin' : (dRole === 'senior' ? `Senior (${p?.year_of_study ? 'Year ' + p.year_of_study : 'Intern'})` : 'Student')
                };
            });

            // Sort: Accepted first, then upvotes desc, then time
            mappedAnswers.sort((a, b) => {
                if (a.is_accepted === b.is_accepted) {
                    return (b.upvotes || 0) - (a.upvotes || 0);
                }
                return a.is_accepted ? -1 : 1;
            });

            setAnswers(mappedAnswers);

        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestionAndAnswers();

        const channel = supabase
            .channel(`question:${params.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'answers', filter: `question_id=eq.${params.id}` }, () => {
                fetchQuestionAndAnswers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [params?.id]);

    const handleUpvote = async (answerId, currentUpvotes) => {
        if (!user) return;
        try {
            // Optimistic Update
            setAnswers(prev => prev.map(a => 
                a.id === answerId ? { ...a, upvotes: (a.upvotes || 0) + 1 } : a
            ));

            const { error } = await supabase.from("answer_upvotes").insert([{
                user_id: user.id,
                answer_id: answerId
            }]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    alert("You have already upvoted this answer.");
                    // Revert optimistic
                    setAnswers(prev => prev.map(a => 
                        a.id === answerId ? { ...a, upvotes: currentUpvotes } : a
                    ));
                } else {
                    throw error;
                }
            } else {
                // Increment count on answers table
                await supabase.rpc('increment_upvotes', { row_id: answerId });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAcceptAnswer = async (answerId) => {
        if (!user || user.id !== question.author_id) return;

        try {
             // Reset all for this question
             await supabase.from("answers").update({ is_accepted: false }).eq('question_id', params.id);
             
             // Set new accepted
             const { error } = await supabase
                 .from("answers")
                 .update({ is_accepted: true })
                 .eq('id', answerId);

             if (error) throw error;
             
             // Update local state
             setAnswers(prev => prev.map(a => ({
                 ...a,
                 is_accepted: a.id === answerId
             })).sort((a, b) => {
                 // Re-sort
                 const aAccepted = a.id === answerId;
                 const bAccepted = b.id === answerId;
                 if (aAccepted === bAccepted) return (b.upvotes || 0) - (a.upvotes || 0);
                 return aAccepted ? -1 : 1;
             }));

        } catch (error) {
            alert("Error accepting answer: " + error.message);
        }
    };

    const handleAnswerSubmit = async () => {
        if (!newAnswer.trim() || !user) return;
        
        // RBAC Check (Admin is already Senior via AuthContext, but explicit check is safe)
        if (!isSenior && !isAdmin) {
            alert("Only Seniors can post answers.");
            return;
        }

        setSubmitting(true);

        try {
            const { error } = await supabase.from("answers").insert([{
                question_id: params.id,
                content: newAnswer,
                author_id: user.id,
                author_name: profile?.full_name || user.user_metadata?.full_name || user.email || 'Anonymous',
                author_role: profile?.role || 'student', // Fallback
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;

            setNewAnswer("");
        } catch (error) {
            alert("Error posting answer: " + error.message);
        }

        setSubmitting(false);
    };

    const getCategoryBadgeStyle = (cat) => {
        switch(cat) {
            case 'Exam Strategy': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Anatomy': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'Physiology': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Clinical Postings': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader /></div>;
    if (!question) return <div className="p-20 text-center text-slate-400">Question not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen pb-32">
            <RevealOnScroll>
                <Link href="/ask-senior" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Q&A
                </Link>

                {/* Question Section */}
                <GlassCard className="mb-8 p-8 border-slate-700/50 bg-slate-900/40">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getCategoryBadgeStyle(question.category || question.topic)}`}>
                            {question.category || question.topic || 'General'}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                             <Clock size={14} />
                             {new Date(question.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-tight">
                        {question.title || question.content}
                    </h1>
                    
                    {question.body && (
                        <div className="text-slate-300 text-lg leading-relaxed mb-8 prose prose-invert max-w-none">
                            {question.body}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5">
                                {question.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">
                                    {question.display_name}
                                </div>
                                {question.author_year && (
                                    <div className="text-xs text-slate-500">
                                        Year {question.author_year} Student
                                    </div>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={handleDeleteQuestion}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-xs font-bold"
                            >
                                <Trash2 size={14} /> Delete Question
                            </button>
                        )}
                    </div>
                </GlassCard>
            </RevealOnScroll>

            {/* Answers Section */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    Answers <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-sm">{answers.length}</span>
                </h3>
                
                <div className="space-y-6">
                    {answers.map((answer, index) => (
                        <RevealOnScroll key={answer.id} delay={index * 50}>
                            <GlassCard 
                                className={`
                                    p-6 relative transition-all duration-300
                                    ${answer.is_accepted ? 'border-green-500/30 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-slate-700/30 bg-slate-900/30'}
                                `}
                                hoverEffect={false}
                            >
                                {answer.is_accepted && (
                                    <div className="absolute -top-3 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-green-500/20">
                                        <CheckCircle size={12} strokeWidth={3} /> Accepted Answer
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar user={{ full_name: answer.display_name, email: 'placeholder' }} size="36px" className="ring-2 ring-white/5" />
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-slate-200">
                                                    {answer.display_name}
                                                </span>
                                                {(answer.profiles?.role === 'senior' || answer.profiles?.role === 'admin') && (
                                                    <span className={`
                                                        px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                                        ${answer.profiles?.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}
                                                    `}>
                                                        {answer.display_role || 'Senior'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {new Date(answer.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                         {/* Mark as Accepted */}
                                         {user?.id === question.author_id && !answer.is_accepted && (
                                            <button 
                                                onClick={() => handleAcceptAnswer(answer.id)}
                                                className="text-xs font-bold text-green-400 hover:bg-green-500/10 px-2 py-1 rounded border border-green-500/20 transition-colors"
                                            >
                                                Mark as Best
                                            </button>
                                         )}
                                         
                                         {/* Actions */}
                                         {user && (
                                            <div className="flex items-center gap-1">
                                                {editingAnswerId !== answer.id && isSenior && user.id === answer.author_id && (
                                                    <button onClick={() => handleStartEdit(answer)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Edit">
                                                        <Edit2 size={14} />
                                                    </button>
                                                )}
                                                {((isSenior && user.id === answer.author_id) || isAdmin) && (
                                                    <button onClick={() => handleDeleteAnswer(answer.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                         )}
                                    </div>
                                </div>
                                
                                {/* Content */}
                                {editingAnswerId === answer.id ? (
                                    <div className="mt-4 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                        <RichTextEditor content={editContent} onChange={setEditContent} />
                                        <div className="flex justify-end gap-3 mt-4">
                                            <GlassButton size="sm" variant="ghost" onClick={() => setEditingAnswerId(null)}>Cancel</GlassButton>
                                            <GlassButton size="sm" variant="primary" onClick={() => handleSaveEdit(answer.id)}>Save Changes</GlassButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed mb-4"
                                        dangerouslySetInnerHTML={{ __html: answer.content }}
                                    />
                                )}

                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <button 
                                        onClick={() => handleUpvote(answer.id, answer.upvotes || 0)}
                                        className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors"
                                    >
                                        <ThumbsUp size={16} className={answer.upvotes > 0 ? "text-cyan-400 fill-cyan-400/20" : ""} /> 
                                        {answer.upvotes || 0} Helpful
                                    </button>
                                </div>
                            </GlassCard>
                        </RevealOnScroll>
                    ))}
                    {answers.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl bg-slate-900/20">
                            <GraduationCap size={32} className="mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-500 font-medium italic">No answers yet. Seniors will respond soon!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Answer Sticky Card */}
            {user && (isSenior || isAdmin) ? (
                <div className="fixed bottom-0 left-0 right-0 p-4 z-40 flex justify-center pointer-events-none">
                    <div className="w-full max-w-4xl pointer-events-auto">
                        <GlassCard className="p-4 bg-[#0F1623]/90 backdrop-blur-xl border-t border-cyan-500/20 shadow-2xl shadow-black/50 rounded-2xl md:rounded-b-none mb-4 md:mb-0 border-x border-b border-slate-800">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                                        <GraduationCap size={16} />
                                        Post your Answer (Senior)
                                    </label>
                                    <button 
                                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                        className="md:hidden text-xs text-slate-400"
                                    >
                                        Expand
                                    </button>
                                </div>
                                
                                <RichTextEditor 
                                    content={newAnswer} 
                                    onChange={setNewAnswer} 
                                    placeholder="Write a detailed explanation..." 
                                />
                                
                                <div className="flex justify-end">
                                    <GlassButton
                                        onClick={handleAnswerSubmit}
                                        disabled={submitting}
                                        variant="primary"
                                        className="shadow-lg shadow-cyan-500/20"
                                        loading={submitting}
                                    >
                                        <Send size={16} className="mr-2" />
                                        Post Answer
                                    </GlassButton>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            ) : user ? (
                <div className="text-center py-8 bg-slate-900/30 rounded-2xl border border-white/5 mx-auto max-w-2xl">
                    <p className="font-medium text-slate-400">Waiting for a Senior student to answer...</p>
                </div>
            ) : (
                <div className="text-center py-8 bg-slate-900/30 rounded-2xl border border-white/5 mx-auto max-w-2xl">
                    <Link href="/login" className="text-cyan-400 hover:underline">Login</Link> <span className="text-slate-500">to view answers.</span>
                </div>
            )}
        </div>
    );
}
