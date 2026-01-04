"use client";

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import Loader from "../ui/Loader";
import { createPortal } from 'react-dom';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SecurePDFReader({ isOpen, onClose, fileUrl, title, userEmail }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPageNumber(1);
            setScale(1.0);
            setLoading(true);
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, fileUrl]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const changePage = (offset) => {
        setPageNumber(prevPage => {
            const newPage = prevPage + offset;
            return Math.max(1, Math.min(newPage, numPages || 1));
        });
    };

    const changeScale = (delta) => {
        setScale(prevScale => Math.max(0.5, Math.min(prevScale + delta, 3.0)));
    };

    if (!mounted || !isOpen || !fileUrl) return null;

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(15, 23, 42, 0.95)', // Dark slate backdrop
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onContextMenu={(e) => e.preventDefault()} // Disable Right Click
        >
            {/* Header */}
            <div style={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.4)'
            }}>
                <h2 style={{ color: 'white', fontWeight: 600, fontSize: '1rem', maxWidth: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {title}
                </h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Main Viewer Area */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative'
            }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <Loader size={32} />
                        <p>Loading secure document...</p>
                    </div>
                )}

                <div style={{ position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={null}
                        error={<div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Failed to load document.</div>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderAnnotationLayer={false}
                            renderTextLayer={false} // Disable text selection/copying if desired for max security
                            className="secure-pdf-page"
                        />
                    </Document>

                    {/* Watermark Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.1,
                        transform: 'rotate(-45deg)',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: 'var(--primary, blue)', /* Changed to primary or safe color, keeping existing red if preferred but usually branding is subtle. existing was red. let's stick to existing style but change text */
                        color: 'red',
                        zIndex: 10,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}>
                        {Array(5).fill("Meddot.online").join('      ')}
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                background: 'rgba(0,0,0,0.6)',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '2rem' }}>
                    <button onClick={() => changeScale(-0.1)} style={controlBtnStyle} title="Zoom Out"><ZoomOut size={18} /></button>
                    <span style={{ color: 'white', fontSize: '0.8rem', width: '40px', textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
                    <button onClick={() => changeScale(0.1)} style={controlBtnStyle} title="Zoom In"><ZoomIn size={18} /></button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '2rem' }}>
                    <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} style={controlBtnStyle} title="Previous Page">
                        <ChevronLeft size={20} />
                    </button>
                    <span style={{ color: 'white', fontSize: '0.9rem', padding: '0 0.5rem' }}>
                        {pageNumber} / {numPages || '--'}
                    </span>
                    <button onClick={() => changePage(1)} disabled={pageNumber >= numPages} style={controlBtnStyle} title="Next Page">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .secure-pdf-page canvas {
                    display: block;
                    max-width: 100%;
                    height: auto !important;
                }
            `}</style>
        </div>
    );

    return createPortal(modalContent, document.body);
}

const controlBtnStyle = {
    background: 'transparent',
    border: 'none',
    color: 'white',
    padding: '0.5rem',
    cursor: 'pointer',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
};
