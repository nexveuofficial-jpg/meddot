"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import Loader from "../../components/ui/Loader";

export default function QuestionDetailPage(props) {
    const params = use(props.params);
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

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
                .select("*, profiles(username, full_name, email, role, year_of_study)")
                .eq("question_id", params.id)
                .order("created_at", { ascending: true });

            if (aError) throw aError;

            const mappedAnswers = (aData || []).map(d => {
                const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
                const dName = p?.username || p?.full_name || (p?.email?.split('@')[0]) || d.author_name || 'Anonymous';
                
                return {
                    ...d,
                    profiles: p || {
                        full_name: d.author_name || 'Anonymous',
                        role: d.author_role || 'student'
                    },
                    display_name: dName,
                    author_year: p?.year_of_study
                };
            });

            setAnswers(mappedAnswers);

        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestionAndAnswers();

        // Realtime Subscription
        const channel = supabase
            .channel(`question:${params.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'answers',
                    filter: `question_id=eq.${params.id}`
                },
                (payload) => {
                    const newAns = payload.new;
                    setAnswers(prev => [...prev, {
                        ...newAns,
                        profiles: {
                            full_name: newAns.author_name || 'Anonymous',
                            role: newAns.author_role || 'student'
                        }
                    }]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [params.id]);

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim() || !user) return;
        setSubmitting(true);

        try {
            const { error } = await supabase.from("answers").insert([{
                question_id: params.id,
                content: newAnswer,
                author_id: user.id,
                author_name: user.full_name || user.email || 'Anonymous',
                author_role: user.role || 'student',
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;

            // Optionally update answer count on question
            // await supabase.rpc('increment_answer_count', { row_id: params.id });

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
                        {question.topic || 'General'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                        {new Date(question.created_at).toLocaleDateString()}
                    </span>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.3 }}>{question.title || question.content}</h1>
                {question.body && <p style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{question.body}</p>}

                <p style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                    Asked by {question.display_name}
                    {question.author_year && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '2px 6px', color: '#4b5563' }}>Year {question.author_year}</span>}
                </p>
            </div>

            {/* Answers Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Answers ({answers.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {answers.map(answer => (
                        <div key={answer.id} style={{
                            background: answer.author_id === user?.id ? 'var(--accent)' : 'var(--card-bg)', // Highlight own answers
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            border: '1px solid var(--card-border)',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {answer.display_name}
                                    {answer.profiles?.role !== 'student' && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>{answer.profiles?.role}</span>}
                                    {answer.author_year && <span style={{ fontSize: '0.7rem', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '2px 6px', borderRadius: '4px', color: '#4b5563' }}>Year {answer.author_year}</span>}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{new Date(answer.created_at).toLocaleDateString()}</span>
                            </div>
                            <p style={{ lineHeight: 1.6 }}>{answer.content}</p>
                        </div>
                    ))}
                    {answers.length === 0 && <p style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No answers yet. Be the first!</p>}
                </div>
            </div>

            {/* Post Answer Form */}
            {user ? (
                <form onSubmit={handleAnswerSubmit} style={{
                    background: 'var(--card-bg)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'sticky',
                    bottom: '2rem'
                }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Post your Answer</label>
                    <textarea
                        rows={3}
                        value={newAnswer}
                        onChange={e => setNewAnswer(e.target.value)}
                        placeholder="Write a helpful response..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1rem', resize: 'vertical' }}
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
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
                </form>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--muted)', borderRadius: '1rem' }}>
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link> to post an answer.
                </div>
            )}
        </div>
    );
}
