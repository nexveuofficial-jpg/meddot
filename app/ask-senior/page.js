"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionCard from "@/app/components/qna/QuestionCard";
import { Plus, Search } from "lucide-react";
import Loader from "../components/ui/Loader";
import { useAuth } from "@/app/context/AuthContext";
import { useFeature } from "@/app/context/FeatureFlagContext";

import styles from "./ask-senior.module.css";

export default function AskSeniorPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { isEnabled } = useFeature();

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("questions")
                    .select("*, profiles(username, full_name, role)")
                    .order("created_at", { ascending: false });

                if (error) throw error;

                const questionsData = data.map(doc => ({
                    ...doc,
                    // profile is now an object or array depending on relation (usually object)
                    profiles: Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles,
                    answers: [{ count: doc.answer_count || 0 }] // Mock answer struct
                }));

                setQuestions(questionsData);
            } catch (error) {
                console.error(error);
            }
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
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <Link href="/dashboard" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontSize: "0.9rem", marginBottom: "0.5rem", display: "inline-block" }}>← Back</Link>
                    <h1 className={styles.title}>
                        Ask Senior
                    </h1>
                    <p className={styles.subtitle}>
                        Get guidance, clear doubts, and learn from experienced seniors.
                    </p>
                </div>

                {user && (
                    <Link href="/ask-senior/ask" style={{ width: 'fit-content' }}>
                        <button className={styles.askButton}>
                            <Plus size={18} />
                            Ask a Question
                        </button>
                    </Link>
                )}
            </header>

            {loading ? (
                <div className="flex justify-center p-20"><Loader /></div>
            ) : questions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", background: "var(--muted)", borderRadius: "1rem", border: "1px dashed var(--border)" }}>
                    <p>No questions yet. Be the first to ask!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {questions.map(q => <QuestionCard key={q.id} question={q} />)}
                </div>
            )}
        </div>
    );
}
