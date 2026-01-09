"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionCard from "@/app/components/qna/QuestionCard";
import { Plus } from "lucide-react";
import Loader from "../components/ui/Loader";
import { useAuth } from "@/app/context/AuthContext";
import { useFeature } from "@/app/context/FeatureFlagContext";
import UserProfileModal from "@/app/components/UserProfileModal";

import styles from "./ask-senior.module.css";

export default function AskSeniorPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { isEnabled } = useFeature();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const categories = ["All", "Exam Strategy", "Anatomy", "Physiology", "Clinical Postings"];

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from("questions")
                    .select("*, profiles(username, full_name, role)")
                    .order("created_at", { ascending: false });
                
                if (selectedCategory !== "All") {
                   query = query.eq('category', selectedCategory);
                }

                const { data, error } = await query;

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
    }, [isEnabled, selectedCategory]);

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
                    <Link href="/ask-senior/ask" style={{ width: 'fit-content', textDecoration: 'none' }}>
                        <div className={styles.askButton}>
                            <Plus size={18} />
                            Ask a Question
                        </div>
                    </Link>
                )}
            </header>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '99px',
                            border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
                            background: selectedCategory === cat ? 'var(--primary)' : 'transparent',
                            color: selectedCategory === cat ? 'white' : 'var(--muted-foreground)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader /></div>
            ) : questions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", background: "var(--muted)", borderRadius: "1rem", border: "1px dashed var(--border)" }}>
                    <p>No questions found in this category.</p>
                    {selectedCategory !== 'All' && (
                        <button 
                            onClick={() => setSelectedCategory('All')}
                            style={{ marginTop: '1rem', color: 'var(--primary)', textDecoration: 'underline' }}
                        >
                            View all questions
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.grid}>
                    {questions.map(q => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            onUserClick={(uid) => {
                                // We need the user's ID. 
                                // questions.profiles might be the profile object, but we need ID.
                                // Actually, joins typically return 'id' if selected.
                                // Wait, the join "*, profiles(...)" might not return profiles.id if not explicit.
                                // But "profiles(username...)" does not include id by default if not asked.
                                // Let's ensure we fetch profile ID in the parent fetch.
                                setSelectedUserId(q.author_id);
                            }}
                        />
                    ))}
                </div>
            )}

            <UserProfileModal userId={selectedUserId} isOpen={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
        </div>
    );
}
