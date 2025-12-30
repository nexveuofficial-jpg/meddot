"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionCard from "@/app/components/qna/QuestionCard";
import { Plus, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useFeature } from "@/app/context/FeatureFlagContext";

export default function AskSeniorPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { isEnabled } = useFeature();

    useEffect(() => {
        const fetchQuestions = async () => {
            const { data, error } = await supabase
                .from('questions')
                .select(`
                    *,
                    profiles(full_name),
                    answers(count)
                `)
                .order('created_at', { ascending: false });

            if (error) console.error(error);
            else setQuestions(data || []);
            setLoading(false);
        };

        if (isEnabled('enable_ask_senior')) {
            fetchQuestions();
        }
    }, [isEnabled]);

    if (!isEnabled('enable_ask_senior')) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Feature Unavailable</h1>
                <p>The "Ask Senior" feature is currently disabled by administrators.</p>
                <Link href="/dashboard" style={{ marginTop: '2rem', display: 'inline-block', color: 'var(--primary)' }}>Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem 4rem", maxWidth: "1200px", margin: "0 auto", minHeight: "100vh" }}>
            <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                marginBottom: "3rem"
            }}>
                <div>
                    <Link href="/dashboard" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontSize: "0.9rem", marginBottom: "0.5rem", display: "inline-block" }}>← Back</Link>
                    <h1 style={{ fontSize: "3rem", fontWeight: "800", letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1 }}>
                        Ask Senior
                    </h1>
                    <p style={{ marginTop: "1rem", color: "var(--muted-foreground)", maxWidth: "500px" }}>
                        Get guidance, clear doubts, and learn from experienced seniors.
                    </p>
                </div>

                {user && (
                    <Link href="/ask-senior/ask">
                        <button style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "0.75rem",
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "var(--shadow-md)"
                        }}>
                            <Plus size={18} />
                            Ask a Question
                        </button>
                    </Link>
                )}
            </header>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
            ) : questions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", background: "var(--muted)", borderRadius: "1rem", border: "1px dashed var(--border)" }}>
                    <p>No questions yet. Be the first to ask!</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    {questions.map(q => <QuestionCard key={q.id} question={q} />)}
                </div>
            )}
        </div>
    );
}
