"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// Import styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SecureReader({ note, onClose }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [isBlurred, setIsBlurred] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const { user, profile } = useAuth();
    const router = useRouter();

    // 1. Secure Blob Loading
    useEffect(() => {
        if (!note?.file_url) {
            setLoading(false);
            return;
        }

        let objectUrl = null;

        const fetchSecurePdf = async () => {
            try {
                const response = await fetch(note.file_url);
                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                setPdfBlob(objectUrl);
            } catch (error) {
                console.error("Error loading secure document:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSecurePdf();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [note?.file_url]);

    // 2. High Security (Shortcuts & Context Menu)
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        
        const handleKeyDown = (e) => {
            // Prevent Ctrl+S, Ctrl+P, Ctrl+Shift+I, PrintScreen (if possible)
            if (
                (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) || 
                (e.ctrlKey && e.shiftKey && e.key === 'i') ||
                e.key === 'PrintScreen'
            ) {
                e.preventDefault();
                // Optional: Flash a warning
                alert("Security Alert: Content is protected.");
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // 3. Privacy Blur (Focus Detection)
    useEffect(() => {
        const handleBlur = () => setIsBlurred(true);
        const handleFocus = () => setIsBlurred(false);

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Watermark Generation
    const watermarkText = `${user?.email || 'Protected'} • ${profile?.full_name || 'User'} • ${new Date().toLocaleDateString()}`;
    const tiles = Array(20).fill(watermarkText);

    // Controls
    const changePage = (offset) => setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    if (!note) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 w-screen h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col"
            style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none'
            }}
        >
            {/* Privacy Blur Overlay */}
            <AnimatePresence>
                {isBlurred && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50"
                    >
                        <div className="text-center">
                            <ShieldAlert size={64} className="mx-auto mb-4 text-red-500" />
                            <h2 className="text-2xl font-bold">Secure Content Hidden</h2>
                            <p className="text-gray-400">Please click back to resume reading.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dynamic Watermark Layer */}
            <div className="absolute inset-0 z-[55] pointer-events-none overflow-hidden flex flex-wrap content-between opacity-10">
                {tiles.map((text, i) => (
                    <div key={i} className="p-12 transform -rotate-45 text-xl font-bold whitespace-nowrap select-none">
                        {text}
                    </div>
                ))}
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[56] bg-gradient-to-b from-black/80 to-transparent">
                <div>
                    <h1 className="text-lg font-semibold text-gray-100">{note.title}</h1>
                    <p className="text-sm text-gray-400">Protected Mode • {note.author || 'Unknown'}</p>
                </div>
                <button 
                    onClick={() => onClose ? onClose() : router.back()} 
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
                >
                    <X size={24} />
                </button>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-8 relative z-10 custom-scrollbar">
                {loading || !pdfBlob ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="animate-spin text-sky-500" />
                        <p className="text-gray-400">Establishing Secure Connection...</p>
                    </div>
                ) : (
                    <Document
                        file={pdfBlob}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        loading={<Loader2 className="animate-spin" />}
                        error={<div className="text-red-500">Failed to decrypt document.</div>}
                        className="shadow-2xl"
                    >
                        <Page 
                            pageNumber={pageNumber} 
                            scale={scale}
                            renderTextLayer={false} // Disable text selection
                            renderAnnotationLayer={false}
                            className="shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                            canvasBackground="white"
                        />
                    </Document>
                )}
            </div>

            {/* Floating Glass Toolbar */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[56]">
                <div className="flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                    <button 
                        onClick={() => changePage(-1)} 
                        disabled={pageNumber <= 1}
                        className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="text-sm font-mono min-w-[3rem] text-center">
                        {pageNumber} / {numPages || '-'}
                    </span>

                    <button 
                        onClick={() => changePage(1)} 
                        disabled={pageNumber >= (numPages || 1)}
                        className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ZoomOut size={20} />
                    </button>
                    
                    <span className="text-xs font-mono w-12 text-center">
                        {Math.round(scale * 100)}%
                    </span>

                    <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ZoomIn size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
