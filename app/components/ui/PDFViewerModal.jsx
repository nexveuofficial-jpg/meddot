"use client";

import { X, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export default function PDFViewerModal({ isOpen, onClose, fileUrl, title }) {
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Reset loading when URL changes
        if (isOpen) setLoading(true);
        // Lock scroll
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';

        return () => {
            document.body.style.overflow = '';
        }
    }, [isOpen, fileUrl]);

    if (!mounted) return null;
    if (!isOpen || !fileUrl) return null;

    const modalContent = (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999, // High z-index to sit on top of everything
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            animation: "fadeIn 0.2s ease-out"
        }}>
            <div style={{
                background: "white",
                width: "100%",
                maxWidth: "1000px",
                height: "90vh",
                borderRadius: "1rem",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                position: "relative",
                animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}>
                {/* Header */}
                <div style={{
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fff"
                }}>
                    <h3 style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "var(--foreground)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "70%"
                    }}>
                        {title}
                    </h3>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {/* Optional External Link for mobile/fallback */}
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{
                            padding: "0.5rem",
                            borderRadius: "0.5rem",
                            color: "var(--muted-foreground)",
                            transition: "background 0.2s",
                            display: "flex",
                            alignItems: "center"
                        }} title="Open in new tab">
                            <ExternalLink size={20} />
                        </a>

                        <button
                            onClick={onClose}
                            style={{
                                padding: "0.5rem",
                                borderRadius: "0.5rem",
                                border: "none",
                                background: "var(--muted)",
                                color: "var(--foreground)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, position: "relative", background: "#f1f5f9" }}>
                    {loading && (
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: "1rem",
                            color: "var(--muted-foreground)"
                        }}>
                            <Loader2 className="animate-spin" size={32} />
                            <p>Loading document...</p>
                        </div>
                    )}

                    {/* Google Docs Viewer as fallback or native iframe? 
                        Native iframe works for PDF in most modern browsers.
                        Google Docs Viewer is good for mobile compatibility if native fails, 
                        but let's try native object/iframe first for signed URLs.
                    */}
                    <iframe
                        src={`${fileUrl}#toolbar=0`}
                        style={{ width: "100%", height: "100%", border: "none", display: loading ? 'none' : 'block' }}
                        onLoad={() => setLoading(false)}
                        title="PDF Viewer"
                    />

                    {/* Using embed or object is sometimes better for PDF control, but iframe is standard. 
                        #toolbar=0 tries to hide download buttons in Chrome PDF Viewer.
                    */}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );

    return createPortal(modalContent, document.body);
}
