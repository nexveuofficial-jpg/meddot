"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Loader from "../../components/ui/Loader"; // Correct relative path from app/senior/questions
import Link from "next/link";
import { MessageCircle, Filter } from "lucide-react";

export default function SeniorQuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("unanswered"); // 'all', 'unanswered'

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from("questions")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (filter === "unanswered") {
                    query = query.eq("answer_count", 0);
                }

                const { data, error } = await query;
                if (error) throw error;
                setQuestions(data || []);
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
            setLoading(false);
        };

        fetchQuestions();
    }, [filter]);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Student Queries</h1>

                <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem", padding: "0.25rem", display: "flex" }}>
                    <button
                        onClick={() => setFilter("unanswered")}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.25rem",
                            background: filter === "unanswered" ? "var(--muted)" : "transparent",
                            fontWeight: 600,
                            fontSize: "0.9rem"
                        }}
                    >
                        Unanswered
                    </button>
                    <button
                        onClick={() => setFilter("all")}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.25rem",
                            background: filter === "all" ? "var(--muted)" : "transparent",
                            fontWeight: 600,
                            fontSize: "0.9rem"
                        }}
                    >
                        All History
                    </button>
                </div>
            </div>

            {loading ? <div className="flex justify-center p-20"><Loader /></div> : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {questions.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "var(--muted-foreground)", background: "white", borderRadius: "1rem", border: "1px dashed var(--border)" }}>
                            <p>No questions found in this category.</p>
                        </div>
                    ) : (
                        questions.map(q => (
                            <Link key={q.id} href={`/ask-senior/${q.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <div style={{
                                    background: "var(--card-bg)",
                                    padding: "1.5rem",
                                    borderRadius: "1rem",
                                    border: "1px solid var(--card-border)",
                                    transition: "all 0.2s",
                                    boxShadow: "var(--shadow-sm)"
                                }} className="hover:shadow-md hover:border-blue-300">
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", background: "var(--accent)", padding: "2px 8px", borderRadius: "99px" }}>
                                            {q.topic || 'General'}
                                        </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                                            <span>{new Date(q.created_at).toLocaleDateString()}</span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                <MessageCircle size={14} /> {q.answer_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>{q.title || "Untitled Question"}</h3>
                                    <p style={{ color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                                        {q.body || q.content || "No details provided."}
                                    </p>
                                    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                                        <span>Asked by {q.author_name && q.author_name.includes('@') ? q.author_name.split('@')[0] : (q.author_name || 'Anonymous')}</span>
                                        <span style={{ color: "var(--primary)", fontWeight: 600 }}>Click to Answer →</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
