"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./SecureNotesViewer.module.css";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { Document, Page, pdfjs } from 'react-pdf';
import { Plus, Minus, RotateCcw, Bookmark, ArrowLeft, Loader2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Import styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SecureNotesViewer({ note }) {
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [numPages, setNumPages] = useState(null);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { user, profile } = useAuth();
    const router = useRouter();

    // --- Security Features ---

    // Prevent Right Click
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener('contextmenu', handleContextMenu);
        
        // Prevent generic keyboard shortcuts for saving/printing (Ctrl+S, Ctrl+P)
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
                e.preventDefault();
                alert("Content is protected. saving or printing is disabled.");
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // --- Bookmark Logic ---
    useEffect(() => {
        const checkBookmark = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from("bookmarks")
                    .select("id")
                    .eq("note_id", note.id)
                    .eq("user_id", user.id);
                setIsBookmarked(data && data.length > 0);
            } catch (error) {
                console.error(error);
            }
        };
        checkBookmark();
    }, [note.id, user]);

    const toggleBookmark = async () => {
        if (!user) return;
        const newState = !isBookmarked;
        setIsBookmarked(newState); // Optimistic

        try {
            if (newState) {
                const { error } = await supabase.from("bookmarks").insert([{ user_id: user.id, note_id: note.id }]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("note_id", note.id);
                if (error) throw error;
            }
        } catch (error) {
            setIsBookmarked(!newState); // Revert
            console.error(error);
        }
    };

    // --- View Logic ---
    
    // Auto-hide header on scroll down
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Progress Bar
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (currentScrollY / totalHeight) * 100;
            setReadingProgress(Math.min(100, Math.max(0, progress)));

            // Header Toggle
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setHeaderVisible(false);
            } else {
                setHeaderVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2.5));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    const handleReset = () => setZoomLevel(1.0);

    // Watermark Content
    const watermarkContent = `${profile?.full_name || 'Meddot User'} - ${user?.email || 'Protected Content'}`;
    const watermarkArray = Array(12).fill(watermarkContent); // Repeat to cover screen

    return (
        <div className={styles.container}>
            {/* Reading Progress Indicator */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "3px", zIndex: 100, background: "transparent" }}>
                <div style={{ height: "100%", width: `${readingProgress}%`, background: "#0ea5e9", transition: "width 0.1s" }} />
            </div>

            {/* Dynamic Watermark Overlay */}
            <div className={styles.watermarkContainer}>
                {watermarkArray.map((text, i) => (
                    <div key={i} className={styles.watermarkText}>
                        {text} <br/> <span style={{fontSize: '0.8em', opacity: 0.7}}>DO NOT DISTRIBUTE</span>
                    </div>
                ))}
            </div>

            {/* Sticky Header */}
            <header className={`${styles.header} ${headerVisible ? '' : styles.hidden}`}>
                <div className={styles.titleGroup}>
                    <Link href="/notes" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        Back
                    </Link>
                    <div>
                        <h1 className={styles.docTitle}>{note.title}</h1>
                        <span className={styles.docMeta}>
                            by {note.author || 'Unknown'} • {new Date(note.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#10b981', background: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 500 }}>
                    <ShieldCheck size={16} />
                    Protected View
                </div>
            </header>

            {/* Main Content (PDF) */}
            <main className={styles.canvasWrapper} onContextMenu={(e) => e.preventDefault()}>
                {note.file_url ? (
                    <Document
                        file={note.file_url}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        loading={
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '4rem' }}>
                                <Loader2 size={40} className="animate-spin text-sky-500" />
                                <p style={{ color: '#64748b' }}>Loading Secure Document...</p>
                            </div>
                        }
                        error={
                            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#ef4444' }}>
                                <X size={40} style={{ margin: '0 auto 1rem' }} />
                                <p>Failed to load document.</p>
                            </div>
                        }
                    >
                        {numPages && Array.from(new Array(numPages), (el, index) => (
                            <div key={`page_${index + 1}`} className="shadow-2xl mb-8 relative">
                                <Page
                                    pageNumber={index + 1}
                                    scale={zoomLevel}
                                    className={styles.pdfPage}
                                    renderAnnotationLayer={true} // Links work
                                    renderTextLayer={false} // Disable text selection layer for security
                                />
                                {/* Invisible overlay to capture clicks/drags to further prevent selection */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }} />
                            </div>
                        ))}
                    </Document>
                ) : (
                    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '3rem', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div dangerouslySetInnerHTML={{ __html: note.description || '' }} />
                    </div>
                )}
            </main>

            {/* Floating Glass Toolbar */}
            <div className={styles.floatingToolbar}>
                <button onClick={handleZoomOut} className={styles.toolButton} title="Zoom Out">
                    <Minus size={20} />
                </button>

                <div className={styles.zoomLabel}>{Math.round(zoomLevel * 100)}%</div>

                <button onClick={handleZoomIn} className={styles.toolButton} title="Zoom In">
                    <Plus size={20} />
                </button>

                <div className={styles.separator} />

                <button onClick={handleReset} className={styles.toolButton} title="Reset">
                    <RotateCcw size={18} />
                </button>

                <div className={styles.separator} />

                <button 
                    onClick={toggleBookmark} 
                    className={`${styles.toolButton} ${isBookmarked ? styles.active : ''}`}
                    title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                >
                    <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
            </div>
        </div>
    );
}
