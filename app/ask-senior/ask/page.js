"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Loader from "../../components/ui/Loader";
import Link from "next/link";

export default function AskPage() {
    const { user } = useAuth();
    const { isEnabled } = useFeature();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [subject, setSubject] = useState("General");
    const [loading, setLoading] = useState(false);

    // Feature Flag Check
    if (!isEnabled('enable_ask_senior')) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Feature Unavailable.</h2>
                <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Back to Dashboard</Link>
            </div>
        );
    }

    // Auth Check
    if (typeof window !== 'undefined' && !user) {
        setTimeout(() => router.push('/login'), 100);
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        setLoading(true);

        try {
            const { error } = await supabase.from("questions").insert([{
                title,
                content: body, // Fixed: Schema expects 'content', not 'body'
                topic: subject, // Mapping 'subject' to 'topic' as per schema likely
                author_id: user.id,
                author_name: user.full_name || user.email || 'Anonymous',
                created_at: new Date().toISOString(),
                answer_count: 0
            }]);

            if (error) throw error;
            router.push("/ask-senior");
        } catch (error) {
            alert("Error posting question: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <Link href="/ask-senior" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '2rem', textDecoration: 'none' }}>
                <ArrowLeft size={18} /> Back to Q&A
            </Link>

            <div style={{ background: "var(--card-bg)", borderRadius: "1rem", padding: "2.5rem", boxShadow: "var(--shadow-lg)", border: "1px solid var(--card-border)" }}>
                <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem", background: "linear-gradient(135deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Ask a Senior
                    </h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Stuck on a concept? Get help from the community.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Question Title</label>
                        <input
                            type="text"
                            placeholder="e.g. How to memorize Cranial Nerves?"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Subject</label>
                        <select
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            style={inputStyle}
                        >
                            {['General', 'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Microbiology', 'Medicine', 'Surgery'].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Details</label>
                        <textarea
                            rows="6"
                            placeholder="Describe your doubt in detail..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "1rem",
                            borderRadius: "0.75rem",
                            background: "var(--foreground)",
                            color: "var(--background)",
                            fontWeight: 600,
                            fontSize: "1rem",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <Loader size={20} /> : <><MessageSquare size={18} /> Post Question</>}
                    </button>

                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                        Note: Seniors are notified of new questions in their respective subjects.
                    </p>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    fontSize: "0.95rem",
    background: "var(--background)",
    color: "var(--foreground)",
    fontFamily: "inherit"
};
