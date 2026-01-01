"use client";

import { Search, Filter, Plus, Loader2 } from "lucide-react";
import NoteCard from "../components/notes/NoteCard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { useAuth } from "@/app/context/AuthContext";
import DoctorCompanion from "../components/companion/DoctorCompanion";

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");
    const [sourceFilter, setSourceFilter] = useState("all"); // 'all', 'official', 'student'
    const { isEnabled } = useFeature();
    const { user } = useAuth();

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            let query = supabase
                .from('notes')
                .select('*')
                .eq('status', 'approved') // Only show approved notes
                .order('created_at', { ascending: false });

            if (selectedSubject !== "All Subjects") {
                query = query.eq('subject', selectedSubject);
            }

            if (sourceFilter === 'official') {
                query = query.eq('author_role', 'admin');
            } else if (sourceFilter === 'community') {
                query = query.neq('author_role', 'admin');
            }

            if (searchQuery) {
                query = query.ilike('title', `%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) {
                console.error(error);
            } else {
                setNotes(data || []);
            }
            setLoading(false);
        };

        // Debounce search slightly
        const timer = setTimeout(fetchNotes, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedSubject, sourceFilter]);

    return (
        <div style={{
            padding: "2rem 4rem",
            maxWidth: "1400px",
            margin: "0 auto",
            minHeight: "100vh"
        }}>
            {/* Header */}
            <header style={{
                marginBottom: "3rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                animation: "fadeInUp 0.6s ease-out"
            }}>
                <div>
                    <Link href="/dashboard" style={{
                        color: "var(--muted-foreground)",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        marginBottom: "0.5rem",
                        display: "inline-block",
                        transition: "color 0.2s"
                    }}>
                        ← Back
                    </Link>
                    <h1 style={{
                        fontSize: "3rem",
                        fontWeight: "800",
                        letterSpacing: "-0.04em",
                        color: "var(--foreground)",
                        lineHeight: 1
                    }}>
                        Notes Library
                    </h1>
                </div>

                {/* Upload Button checking Feature Flag */}
                {isEnabled('enable_uploads') && user && (
                    <Link href="/notes/upload">
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
                            boxShadow: "var(--shadow-md)",
                            transition: "all 0.2s"
                        }}>
                            <Plus size={18} />
                            Upload Note
                        </button>
                    </Link>
                )}
            </header>

            {/* Search & Filter */}
            <div style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "3rem",
                animation: "fadeInUp 0.6s ease-out 0.1s backwards"
            }}>
                <div style={{
                    flex: 1,
                    position: "relative"
                }}>
                    <Search
                        size={20}
                        style={{
                            position: "absolute",
                            left: "1rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--primary)"
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search notes by title or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "1rem 1rem 1rem 3rem",
                            borderRadius: "1rem",
                            border: "1px solid var(--border)",
                            background: "white",
                            fontSize: "1rem",
                            boxShadow: "var(--shadow-sm)",
                            outline: "none",
                            transition: "all 0.2s"
                        }}
                    />
                </div>

                <div style={{ position: "relative" }}>
                    <Filter
                        size={18}
                        style={{
                            position: "absolute",
                            left: "1rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--muted-foreground)",
                            pointerEvents: "none"
                        }}
                    />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        style={{
                            padding: "1rem 2rem 1rem 2.5rem",
                            borderRadius: "0.75rem",
                            border: "1px solid var(--border)",
                            background: "white",
                            fontSize: "0.95rem",
                            fontWeight: 500,
                            color: "var(--foreground)",
                            boxShadow: "var(--shadow-sm)",
                            cursor: "pointer",
                            outline: "none",
                            height: "100%"
                        }}
                    >
                        <option>All Subjects</option>
                        <option>Anatomy</option>
                        <option>Physiology</option>
                        <option>Biochemistry</option>
                        <option>Pharmacology</option>
                        <option>Pathology</option>
                        <option>Microbiology</option>
                    </select>
                </div>

                <div style={{ position: "relative" }}>
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        style={{
                            padding: "1rem 2rem 1rem 1rem",
                            borderRadius: "0.75rem",
                            border: "1px solid var(--border)",
                            background: "white",
                            fontSize: "0.95rem",
                            fontWeight: 500,
                            color: "var(--foreground)",
                            boxShadow: "var(--shadow-sm)",
                            cursor: "pointer",
                            outline: "none",
                            height: "100%"
                        }}
                    >
                        <option value="all">All Sources</option>
                        <option value="official">🎓 Official (Admin)</option>
                        <option value="community">👤 Student Community</option>
                    </select>
                </div>
            </div>

            {/* Note Grid */}
            {
                loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
                ) : notes.length === 0 ? (
                    <div style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "4rem",
                        background: "var(--muted)",
                        borderRadius: "1rem",
                        border: "1px dashed var(--border)",
                        color: "var(--muted-foreground)"
                    }}>
                        <p style={{ fontSize: "1.2rem", fontWeight: 500, marginBottom: "0.5rem" }}>No notes found</p>
                        <p style={{ fontSize: "0.9rem" }}>Try adjusting your search or filters</p>
                        <DoctorCompanion mood="idle" context="empty" />
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                        gap: "2rem",
                        animation: "fadeInUp 0.6s ease-out 0.2s backwards"
                    }}>
                        {notes.map((note) => (
                            <NoteCard key={note.id} note={note} />
                        ))}
                    </div>
                )
            }
        </div >
    );
}
