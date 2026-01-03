"use client";

import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    isDestructive = true,
    isLoading = false
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const modalContent = (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            animation: "fadeIn 0.2s ease-out"
        }}>
            <div style={{
                background: "white",
                borderRadius: "1rem",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                padding: "1.5rem",
                position: "relative",
                animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            }}>
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted-foreground)"
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1rem" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: isDestructive ? "#fee2e2" : "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isDestructive ? "#dc2626" : "#475569"
                    }}>
                        <AlertTriangle size={24} />
                    </div>

                    <div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>{title}</h3>
                        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                            {description}
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", width: "100%", marginTop: "0.5rem" }}>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--border)",
                                background: "white",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "background 0.2s"
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "none",
                                background: isDestructive ? "#dc2626" : "var(--primary)",
                                color: "white",
                                fontWeight: 600,
                                cursor: "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                        >
                            {isLoading ? "Processing..." : confirmText}
                        </button>
                    </div>
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
