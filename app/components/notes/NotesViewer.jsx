"use client";

import { useState, useEffect } from "react";
import styles from "./NotesViewer.module.css";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export default function NotesViewer({ note }) {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const { user } = useAuth();

    // Check initial bookmark status
    useEffect(() => {
        const checkBookmark = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('bookmarks')
                .select('id')
                .eq('note_id', note.id)
                .eq('user_id', user.id)
                .single();
            setIsBookmarked(!!data);
        };
        checkBookmark();
    }, [note.id, user]);

    const toggleBookmark = async () => {
        if (!user) {
            alert("Please login to bookmark notes.");
            return;
        }

        // Optimistic update
        const newState = !isBookmarked;
        setIsBookmarked(newState);

        if (newState) {
            // Add bookmark
            const { error } = await supabase
                .from('bookmarks')
                .insert({ user_id: user.id, note_id: note.id });
            if (error) {
                console.error(error);
                setIsBookmarked(!newState); // Revert on error
            }
        } else {
            // Remove bookmark
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', user.id)
                .eq('note_id', note.id);
            if (error) {
                console.error(error);
                setIsBookmarked(!newState); // Revert on error
            }
        }
    };

    // Scroll Progress
    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setReadingProgress(Math.min(100, Math.max(0, progress)));
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    const handleReset = () => setZoomLevel(1);

    return (
        <div className={styles.container}>
            {/* Progress Bar */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "4px", zIndex: 60, background: "transparent" }}>
                <div style={{ height: "100%", width: readingProgress + "%", background: "var(--primary)", transition: "width 0.1s" }} />
            </div>

            {/* Toolbar - Glass Effect */}
            <div className={`${styles.toolbar} glass-clean`}>
                <button onClick={handleZoomOut} className={styles.button} title="Zoom Out">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>

                <span style={{ fontSize: "0.875rem", fontVariantNumeric: "tabular-nums", minWidth: "3ch", textAlign: "center" }}>
                    {Math.round(zoomLevel * 100)}%
                </span>

                <button onClick={handleZoomIn} className={styles.button} title="Zoom In">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>

                <div style={{ width: "1px", height: "1.5rem", background: "var(--border)" }}></div>

                <button onClick={handleReset} className={styles.button} title="Reset View">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>

                <button
                    onClick={toggleBookmark}
                    className={`${styles.button} ${isBookmarked ? styles.active : ''} `}
                    title="Bookmark"
                    style={{ color: isBookmarked ? "#fbbf24" : "currentColor" }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
            </div>

            {/* Canvas */}
            <div className={styles.canvasWrapper}>
                <div
                    className={styles.paper}
                    style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s ease-out" }}
                >
                    <h1 className={styles.title}>{note.title}</h1>
                    <div className={styles.meta}>
                        <span>By {note.author}</span>
                        <span>•</span>
                        <span>{note.date}</span>
                        <span>•</span>
                        <span>{note.readTime} read</span>
                    </div>

                    <div className={styles.content}>
                        {note.content}
                    </div>
                </div>
            </div>
        </div>
    );
}
