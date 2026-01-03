"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Loader from "../components/ui/Loader";
import Link from "next/link";
import { MessageCircle, CheckCircle, Clock, ArrowRight } from "lucide-react";

export default function SeniorDashboard() {
    const [stats, setStats] = useState({ total: 0, unanswered: 0, answered: 0 });
    const [recentQuestions, setRecentQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch stats (approximate for now)
                const { count: total } = await supabase.from("questions").select("*", { count: 'exact', head: true });

                // For accurate 'unanswered' we need the answer_count column or join. 
                // Assuming answer_count exists (per instructions)
                const { count: answered } = await supabase.from("questions").select("*", { count: 'exact', head: true }).gt('answer_count', 0);

                // Fetch recent unanswered questions
                const { data: recent } = await supabase
                    .from("questions")
                    .select("*")
                    .eq('answer_count', 0) // Explicitly look for 0 answers
                    .order('created_at', { ascending: false })
                    .limit(5);

                setStats({
                    total: total || 0,
                    answered: answered || 0,
                    unanswered: (total || 0) - (answered || 0)
                });
                setRecentQuestions(recent || []);

            } catch (error) {
                console.error("Error fetching senior dashboard:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 flex justify-center"><Loader /></div>;

    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "2rem" }}>Senior Overview</h1>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <StatCard
                    title="Needs Answers"
                    value={stats.unanswered}
                    icon={<Clock size={24} color="#f59e0b" />}
                    bg="rgba(251, 191, 36, 0.1)"
                />
                <StatCard
                    title="Resolved"
                    value={stats.answered}
                    icon={<CheckCircle size={24} color="#10b981" />}
                    bg="rgba(16, 185, 129, 0.1)"
                />
                <StatCard
                    title="Total Queries"
                    value={stats.total}
                    icon={<MessageCircle size={24} color="#3b82f6" />}
                    bg="rgba(59, 130, 246, 0.1)"
                />
            </div>

            {/* Recent Unanswered */}
            <div style={{ background: "white", borderRadius: "1rem", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Recent Questions Needs Attention</h3>
                    <Link href="/senior/questions" style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div>
                    {recentQuestions.length === 0 ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-foreground)" }}>
                            <CheckCircle size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                            <p>Good job! No pending questions.</p>
                        </div>
                    ) : (
                        recentQuestions.map(q => (
                            <Link key={q.id} href={`/ask-senior/${q.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <div style={{
                                    padding: "1.5rem",
                                    borderBottom: "1px solid var(--border)",
                                    transition: "background 0.2s"
                                }} className="hover:bg-slate-50">
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", background: "var(--accent)", padding: "2px 8px", borderRadius: "99px" }}>
                                            {q.topic || 'General'}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.5rem" }}>{q.title || q.content.substring(0, 60)}</h4>
                                    <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                        {q.body || "No details provided."}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, bg }) {
    return (
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", fontWeight: 500 }}>{title}</p>
                <p style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.1 }}>{value}</p>
            </div>
        </div>
    );
}
