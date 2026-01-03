import { FileText, Bookmark, Eye, ShieldCheck, Clock, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function NoteCard({ note, isBookmarked = false, onBookmarkToggle }) {
    const { user } = useAuth();
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [downloading, setDownloading] = useState(false);

    // Initial check (if isBookmarked prop isn't fully reliable or need self-check)
    useEffect(() => {
        // Here we rely on prop typically, but could fetch status if needed. 
        // For list views, passing isBookmarked is better performance.
    }, []);

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // prevent card click
        if (!user) return alert("Login to bookmark");

        const wasBookmarked = bookmarked;
        setBookmarked(!bookmarked); // Optimistic

        try {
            if (wasBookmarked) {
                // Remove bookmark
                const { error } = await supabase
                    .from("bookmarks")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("note_id", note.id);

                if (error) throw error;
            } else {
                // Add bookmark
                const { error } = await supabase
                    .from("bookmarks")
                    .insert([{
                        user_id: user.id,
                        note_id: note.id,
                        created_at: new Date().toISOString()
                    }]);

                if (error) throw error;
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            setBookmarked(wasBookmarked); // Revert
        }
    };

    const handleNoteClick = async () => {
        if (downloading) return;
        setDownloading(true);

        try {
            // Priority 1: Try generating a Signed URL (Secure)
            if (note.file_path) {
                console.log("Attempting Signed URL for:", note.file_path);
                const { data, error } = await supabase
                    .storage
                    .from('notes_documents')
                    .createSignedUrl(note.file_path, 60);

                if (error) {
                    console.warn("Signed URL generation failed:", error.message);
                    // Don't throw yet, try fallback
                } else if (data?.signedUrl) {
                    window.open(data.signedUrl, '_blank');
                    return; // Success
                }
            }

            // Priority 2: Fallback to Public URL if Signed Failed or Path Missing
            if (note.file_url) {
                console.log("Falling back to Public URL:", note.file_url);
                window.open(note.file_url, '_blank');
                return;
            }

            // If we get here, both methods failed
            throw new Error("Could not resolve a download link. File path or URL missing.");

        } catch (error) {
            console.error("Download error:", error);
            alert(`Failed to download note: ${error.message}`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div
            onClick={handleNoteClick}
            style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
                cursor: downloading ? "wait" : "pointer",
                position: "relative" // For absolute positioning of loading overlay
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
                boxShadow: "var(--shadow-sm)",
                opacity: downloading ? 0.7 : 1
            }}
                onMouseEnter={e => {
                    if (!downloading) {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                        e.currentTarget.style.borderColor = "var(--primary-light, #bae6fd)";
                    }
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                    e.currentTarget.style.borderColor = "var(--card-border, #e2e8f0)";
                }}
            >
                {/* Loading Overlay */}
                {downloading && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        flexDirection: 'column',
                        gap: '0.5rem',
                        color: 'var(--primary)',
                        fontWeight: 600
                    }}>
                        <Loader2 className="animate-spin" size={24} />
                        <span style={{ fontSize: '0.85rem' }}>Opening...</span>
                    </div>
                )}

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
                                padding: "4px",
                                zIndex: 5 // Ensure bookmark is clickable above card click
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
        </div>
    );
}
