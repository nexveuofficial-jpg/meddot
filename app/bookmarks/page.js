"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function BookmarksPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [bookmarkedNotes, setBookmarkedNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (!user) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('bookmarks')
                .select(`
                    note_id,
                    notes:notes (*)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching bookmarks:", error);
            } else {
                // Flatten the structure: we want the note objects
                // data format: [{ note_id: "...", notes: { id: "...", title: "..." } }]
                const validNotes = data
                    ?.map(item => item.notes)
                    .filter(note => note !== null); // Filter out any nulls if note was deleted
                setBookmarkedNotes(validNotes || []);
            }
            setLoading(false);
        };

        fetchBookmarks();
    }, [user]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "10rem" }}><Loader2 className="animate-spin" /></div>;

    return (
        <div style={{ minHeight: "100vh", background: "var(--background)", padding: "2rem" }}>
            <header style={{ marginBottom: "3rem", maxWidth: "1200px", margin: "0 auto 3rem auto" }}>
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{ marginBottom: "1rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.5rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--foreground)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted-foreground)"}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    Back to Dashboard
                </button>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--foreground)", marginBottom: "0.5rem" }}>My Bookmarks</h1>
                <p style={{ color: "var(--muted-foreground)" }}>Your saved study materials.</p>
            </header>

            {/* Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2rem",
                maxWidth: "1200px",
                margin: "0 auto"
            }}>
                {bookmarkedNotes.map(note => (
                    <Link key={note.id} href={`/notes/${note.id}`} style={{ display: "block", textDecoration: "none" }}>
                        <div className="glass" style={{
                            padding: "1.5rem",
                            borderRadius: "1rem",
                            height: "100%",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column"
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 20px -5px rgba(0,0,0,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
                        >
                            <div style={{
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                color: "var(--primary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "0.5rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <span>{note.subject} • {note.year}</span>
                                <span style={{ color: "#fbbf24" }}>★</span>
                            </div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--foreground)", marginBottom: "0.5rem", lineHeight: "1.4" }}>
                                {note.title}
                            </h2>
                            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "auto" }}>
                                By {note.author}
                            </p>
                            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", fontSize: "0.80rem", color: "var(--muted-foreground)", display: "flex", justifyContent: "space-between" }}>
                                <span>{note.date}</span>
                                <span>{note.readTime}</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {bookmarkedNotes.length === 0 && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--muted-foreground)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>📂</div>
                        <p>No bookmarks yet.</p>
                        <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>Save important notes to access them quickly here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
