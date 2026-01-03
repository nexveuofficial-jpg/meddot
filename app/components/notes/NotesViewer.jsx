"use client";

import { useState, useEffect } from "react";
import styles from "./NotesViewer.module.css";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, Plus, Minus, RotateCcw, Bookmark } from "lucide-react";

// Import styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function NotesViewer({ note }) {
    const [zoomLevel, setZoomLevel] = useState(1.0); // Start at 100%
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [numPages, setNumPages] = useState(null);
    const { user } = useAuth();

    // Check initial bookmark status
    useEffect(() => {
        const checkBookmark = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from("bookmarks")
                    .select("id")
                    .eq("note_id", note.id)
                    .eq("user_id", user.id);

                if (error) console.error(error);
                setIsBookmarked(data && data.length > 0);
            } catch (error) {
                console.error(error);
            }
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

        try {
            if (newState) {
                // Add bookmark
                const { error } = await supabase
                    .from("bookmarks")
                    .insert([{
                        user_id: user.id,
                        note_id: note.id,
                        created_at: new Date().toISOString()
                    }]);
                if (error) throw error;
            } else {
                // Remove bookmark
                const { error } = await supabase
                    .from("bookmarks")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("note_id", note.id);
                if (error) throw error;
            }
        } catch (error) {
            console.error(error);
            setIsBookmarked(!newState); // Revert on error
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


    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    const handleReset = () => setZoomLevel(1.0);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div className={styles.container}>
            {/* Progress Bar */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "4px", zIndex: 60, background: "transparent" }}>
                <div style={{ height: "100%", width: readingProgress + "%", background: "var(--primary)", transition: "width 0.1s" }} />
            </div>

            {/* Toolbar - Glass Effect */}
            <div className={`${styles.toolbar} glass-clean`}>
                <button onClick={handleZoomOut} className={styles.button} title="Zoom Out">
                    <Minus size={20} />
                </button>

                <span style={{ fontSize: "0.875rem", fontVariantNumeric: "tabular-nums", minWidth: "3ch", textAlign: "center", color: '#475569' }}>
                    {Math.round(zoomLevel * 100)}%
                </span>

                <button onClick={handleZoomIn} className={styles.button} title="Zoom In">
                    <Plus size={20} />
                </button>

                <div style={{ width: "1px", height: "1.5rem", background: "#cbd5e1" }}></div>

                <button onClick={handleReset} className={styles.button} title="Reset View">
                    <RotateCcw size={20} />
                </button>

                <button
                    onClick={toggleBookmark}
                    className={`${styles.button} ${isBookmarked ? styles.active : ''} `}
                    title="Bookmark"
                    style={{ color: isBookmarked ? "#fbbf24" : "var(--muted-foreground)" }}
                >
                    <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Canvas */}
            <div className={styles.canvasWrapper}>
                <div className={styles.paper} style={{ background: 'transparent', boxShadow: 'none' }}>
                    <h1 className={styles.title}>{note.title}</h1>
                    <div className={styles.meta}>
                        <span>By {note.author}</span>
                        <span>•</span>
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{numPages ? `${numPages} Pages` : 'Loading...'}</span>
                    </div>

                    <div className={styles.content}>
                        {note.file_url ? (
                            <Document
                                file={note.file_url}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={40} /></div>}
                                error={<div className="text-red-500 p-4">Failed to load PDF.</div>}
                            >
                                {numPages && Array.from(new Array(numPages), (el, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        scale={zoomLevel}
                                        className="mb-8 shadow-md rounded-md overflow-hidden"
                                        renderAnnotationLayer={true}
                                        renderTextLayer={true}
                                    />
                                ))}
                            </Document>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: note.description || '' }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
