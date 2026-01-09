"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, ThumbsUp, Trash2, Edit2 } from "lucide-react";
import Loader from "../../components/ui/Loader";
import RichTextEditor from "../../components/ui/RichTextEditor";

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
        // e.preventDefault() is not needed as this is triggered from RichTextEditor parent (div not form, or custom button)
        if (!newAnswer.trim() || !user) return;
        
        // RBAC Check
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

    if (loading) return <div className="flex justify-center p-20"><Loader /></div>;
    if (!question) return <div className="p-20 text-center">Question not found</div>;

    return (
        <div style={{ padding: "2rem 4rem", maxWidth: "1000px", margin: "0 auto", minHeight: "100vh" }}>
            <Link href="/ask-senior" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={18} />
                Back to Q&A
            </Link>

                {/* Question Section */}
            <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--card-border)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", background: "var(--accent)", padding: "0.25rem 0.75rem", borderRadius: "99px" }}>
                        {question.category || question.topic || 'General'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                        {new Date(question.created_at).toLocaleDateString()}
                    </span>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.3 }}>{question.title || question.content}</h1>
                {question.body && <p style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{question.body}</p>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontWeight: 500, margin: 0 }}>
                        Asked by {question.display_name}
                        {question.author_year && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '2px 6px', color: '#4b5563' }}>Year {question.author_year}</span>}
                    </p>
                    {isAdmin && (
                        <button
                            onClick={handleDeleteQuestion}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                            <Trash2 size={16} /> Delete Question (Admin)
                        </button>
                    )}
                </div>
            </div>

            {/* Answers Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Answers ({answers.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {answers.map(answer => (
                        <div key={answer.id} style={{
                            background: answer.is_accepted ? '#f0fdf4' : 'var(--card-bg)',
                            border: answer.is_accepted ? '2px solid #22c55e' : '1px solid var(--card-border)',
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            position: 'relative'
                        }}>
                            {answer.is_accepted && (
                                <div style={{ position: 'absolute', top: '-10px', right: '20px', background: '#22c55e', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CheckCircle size={12} /> Accepted Answer
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', fontWeight: 700 }}>
                                        {answer.display_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {answer.display_name}
                                            {/* Senior Badge */}
                                            {(answer.profiles?.role === 'senior' || answer.profiles?.role === 'admin') && (
                                                <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                                                    {answer.display_role || 'Senior'}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                            {new Date(answer.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                     {/* Mark as Accepted (Visible to Question Author Only) */}
                                     {user?.id === question.author_id && !answer.is_accepted && (
                                        <button 
                                            onClick={() => handleAcceptAnswer(answer.id)}
                                            style={{ fontSize: '0.75rem', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '4px', padding: '2px 6px' }}
                                        >
                                            Mark as Best Answer
                                        </button>
                                     )}
                                     
                                     {/* Answer Actions: Edit/Delete */}
                                     {user && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {/* Edit: Own Answer + Senior */}
                                            {editingAnswerId !== answer.id && isSenior && user.id === answer.author_id && (
                                                <button onClick={() => handleStartEdit(answer)} style={{ color: 'var(--muted-foreground)', padding: '4px' }} title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                            )}
                                            {/* Delete: Own Answer (Senior) OR Admin */}
                                            {((isSenior && user.id === answer.author_id) || isAdmin) && (
                                                <button onClick={() => handleDeleteAnswer(answer.id)} style={{ color: '#ef4444', padding: '4px' }} title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                     )}
                                </div>
                            </div>
                            
                            {/* Content - Rich Text Supported OR Editor Mode */}
                            {editingAnswerId === answer.id ? (
                                <div style={{ marginTop: '1rem' }}>
                                    <RichTextEditor content={editContent} onChange={setEditContent} />
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setEditingAnswerId(null)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'transparent' }}>Cancel</button>
                                        <button onClick={() => handleSaveEdit(answer.id)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none' }}>Save Changes</button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    className="prose prose-sm"
                                    style={{ lineHeight: 1.6, color: 'var(--foreground)' }}
                                    dangerouslySetInnerHTML={{ __html: answer.content }}
                                />
                            )}

                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button 
                                    onClick={() => handleUpvote(answer.id, answer.upvotes || 0)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontWeight: 500, fontSize: '0.9rem' }}
                                >
                                    <ThumbsUp size={16} /> 
                                    {answer.upvotes || 0} Helpful
                                </button>
                            </div>
                        </div>
                    ))}
                    {answers.length === 0 && <p style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No answers yet. Seniors will respond soon!</p>}
                </div>
            </div>

            {/* Post Answer Form - ONLY FOR SENIORS/ADMINS */}
            {user && (isSenior || isAdmin) ? (
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'sticky',
                    bottom: '2rem'
                }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Post your Answer (Senior)</label>
                    <RichTextEditor 
                        content={newAnswer} 
                        onChange={setNewAnswer} 
                        placeholder="Write a detailed explanation..." 
                    />
                    
                    <button
                        onClick={handleAnswerSubmit}
                        disabled={submitting}
                        style={{
                            marginTop: '1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            float: 'right'
                        }}
                    >
                        {submitting ? <Loader size={16} /> : <Send size={16} />}
                        Post Answer
                    </button>
                    <div style={{ clear: 'both' }}></div>
                </div>
            ) : user ? (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--muted)', borderRadius: '1rem' }}>
                    <p style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Waiting for a Senior to answer...</p>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--muted)', borderRadius: '1rem' }}>
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link> to view.
                </div>
            )}
        </div>
    );
}
