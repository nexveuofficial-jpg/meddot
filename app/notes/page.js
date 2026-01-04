"use client";

import { Search, Filter, Plus } from "lucide-react";
import Loader from "../components/ui/Loader";
import NoteCard from "../components/notes/NoteCard";
import { SkeletonGrid } from "../components/ui/LoadingSkeleton";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { useAuth } from "@/app/context/AuthContext";
import DoctorCompanion from "../components/companion/DoctorCompanion";

const ITEMS_PER_PAGE = 50;

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");
    const [sourceFilter, setSourceFilter] = useState("all"); // 'all', 'official', 'student'

    const { isEnabled } = useFeature();
    const { user } = useAuth();

    // Debounce search value to prevent rapid firing API calls
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset list when filters change
    useEffect(() => {
        setNotes([]);
        setPage(0);
        setHasMore(true);
        fetchNotes(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, selectedSubject, sourceFilter]);

    const fetchNotes = async (pageIndex, isFresh = false) => {
        if (isFresh) setLoading(true);
        else setLoadingMore(true);

        try {
            const from = pageIndex * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from("notes")
                .select("*, profiles(username, full_name)")
                .eq("status", "published")
                .order("created_at", { ascending: false })
                .range(from, to);

            // Apply Filters Server-Side
            if (selectedSubject !== "All Subjects") {
                query = query.eq("subject", selectedSubject);
            }

            if (sourceFilter === 'official') {
                query = query.in('author_role', ['admin', 'senior']);
            } else if (sourceFilter === 'community') {
                query = query.not('author_role', 'in', '("admin","senior")'); // Correct syntax for not.in might vary, checking safest simple filter or handling client side mixed? 
                // Actual Supabase syntax: .not('author_role', 'in', ['admin', 'senior']) ??
                // Let's use filter if needed or simple logic. 
                // .filter('author_role', 'not.in', '("admin","senior")')
                // safer:
                // query = query.or('author_role.neq.admin,author_role.neq.senior') -> tricky.
                // Simplest for now: .neq('author_role', 'admin').neq('author_role', 'senior')
                query = query.neq('author_role', 'admin').neq('author_role', 'senior');
            }

            if (debouncedSearch) {
                // ILIKE for case-insensitive search on title. 
                // Note: Searching multiple columns (title OR description) is hard without Views or RPC in simple query chaining.
                // We will stick to Title search for performance as requested.
                query = query.ilike('title', `%${debouncedSearch}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                if (isFresh) {
                    setNotes(data);
                } else {
                    setNotes(prev => [...prev, ...data]);
                }

                // If we got fewer items than requested, we reached the end
                if (data.length < ITEMS_PER_PAGE) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreNotes = () => {
        if (!hasMore || loading || loadingMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotes(nextPage, false);
    };

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
                        placeholder="Search notes by title..."
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
                            color: "#334155",
                            boxShadow: "var(--shadow-sm)",
                            cursor: "pointer",
                            outline: "none",
                            height: "100%"
                        }}
                    >
                        <option>All Subjects</option>

                        <optgroup label="First Year (Pre-Clinical)">
                            <option>Anatomy</option>
                            <option>Physiology</option>
                            <option>Biochemistry</option>
                        </optgroup>

                        <optgroup label="Second Year (Para-Clinical)">
                            <option>Pathology</option>
                            <option>Pharmacology</option>
                            <option>Microbiology</option>
                            <option>Forensic Medicine</option>
                        </optgroup>

                        <optgroup label="Third Year">
                            <option>Community Medicine</option>
                            <option>Ophthalmology</option>
                            <option>ENT</option>
                        </optgroup>

                        <optgroup label="Final Year (Clinical)">
                            <option>General Medicine</option>
                            <option>General Surgery</option>
                            <option>Obstetrics & Gynecology</option>
                            <option>Pediatrics</option>
                            <option>Orthopedics</option>
                            <option>Psychiatry</option>
                            <option>Dermatology</option>
                            <option>Anesthesiology</option>
                            <option>Radiology</option>
                        </optgroup>
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
                            color: "#334155",
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
                loading && notes.length === 0 ? (
                    <SkeletonGrid count={8} />
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
                    <>
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

                        {/* Load More Button */}
                        {hasMore && (
                            <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
                                <button
                                    onClick={loadMoreNotes}
                                    disabled={loadingMore}
                                    style={{
                                        padding: '0.75rem 2rem',
                                        background: 'white',
                                        border: '1px solid var(--border)',
                                        borderRadius: '2rem',
                                        color: 'var(--foreground)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-sm)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {loadingMore && <Loader size={16} />}
                                    {loadingMore ? 'Loading...' : 'Load More Notes'}
                                </button>
                            </div>
                        )}
                    </>
                )
            }
        </div >
    );
}
