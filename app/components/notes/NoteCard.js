"use client";

import { FileText, Bookmark, Eye, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
// import { supabase } from "@/lib/supabase"; // For future backend toggle
// import { useAuth } from "../../context/AuthContext"; // For future backend toggle

export default function NoteCard({ note, isBookmarked = false, onBookmarkToggle }) {
    // const { user } = useAuth(); // For future backend toggle
    const user = null; // Mock user for now
    const [bookmarked, setBookmarked] = useState(isBookmarked);

    const handleBookmark = async (e) => {
        e.preventDefault();
        if (!user) return alert("Login to bookmark");

        // Optimistic UI
        setBookmarked(!bookmarked);

        // TODO: Real DB toggle (Phase 3.3)
        // onBookmarkToggle(note.id); 
    };

    return (
        <Link
            href={`/notes/${note.id}`}
            style={{
                textDecoration: "none",
                color: "inherit",
                display: "block"
            }}
        >
            <div style={{
                background: "var(--card-bg, #ffffff)",
                border: "1px solid var(--card-border, #e2e8f0)",
                borderRadius: "1rem",
                overflow: "hidden",
                transition: "all 0.3s ease",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxShadow: "var(--shadow-sm)"
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                    e.currentTarget.style.borderColor = "var(--primary-light, #bae6fd)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                    e.currentTarget.style.borderColor = "var(--card-border, #e2e8f0)";
                }}
            >
                {/* Decorative Top Accent */}
                <div style={{ height: "4px", background: "var(--primary)" }}></div>

                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <span style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "var(--primary)",
                            background: "var(--accent)",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "99px"
                        }}>
                            {note.subject}
                        </span>

                        <button
                            onClick={handleBookmark}
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: bookmarked ? "var(--primary)" : "var(--muted-foreground)",
                                padding: "4px"
                            }}
                        >
                            <Bookmark
                                size={18}
                                fill={bookmarked ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    <h3 style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        marginBottom: "0.75rem",
                        lineHeight: 1.3,
                        color: "var(--foreground)"
                    }}>
                        {note.title}
                    </h3>

                    {note.description && (
                        <p style={{
                            fontSize: "0.9rem",
                            color: "var(--muted-foreground)",
                            marginBottom: "1.5rem",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                        }}>
                            {note.description}
                        </p>
                    )}

                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <GraduationCap size={14} />
                            <span>{new Date(note.created_at).getFullYear()}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Eye size={14} />
                            {/* Mock read time or views */}
                            <span>{note.views || 0} views</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
