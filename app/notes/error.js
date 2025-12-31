"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function NotesError({ error, reset }) {
    useEffect(() => {
        console.error("Notes Error:", error);
    }, [error]);

    return (
        <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "#fee2e2", padding: "1rem", borderRadius: "50%", marginBottom: "1.5rem" }}>
                <AlertCircle size={32} color="#dc2626" />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#1f2937" }}>
                Unable to load notes
            </h2>
            <p style={{ marginBottom: "2rem", color: "#6b7280", maxWidth: "400px" }}>
                We encountered a problem while accessing the notes library. This might be a temporary connection issue.
            </p>
            <button
                onClick={() => reset()}
                style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.5rem",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.2)"
                }}
            >
                Try Again
            </button>
        </div>
    );
}
