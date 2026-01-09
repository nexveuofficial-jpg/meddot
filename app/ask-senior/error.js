"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AskSeniorError({ error, reset }) {
    useEffect(() => {
        console.error("Ask Senior Error:", error);
    }, [error]);

    return (
        <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "#e0e7ff", padding: "1rem", borderRadius: "50%", marginBottom: "1.5rem" }}>
                <AlertTriangle size={32} color="#4f46e5" />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#1f2937" }}>
                Section Unavailable
            </h2>
            <p style={{ marginBottom: "2rem", color: "#6b7280" }}>
                Something went wrong while loading the Ask Senior questions.
            </p>
            {error.message && (
                <div style={{ padding: "1rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "0.5rem", marginBottom: "2rem", maxWidth: "80%", wordBreak: "break-word" }}>
                    <strong>Error:</strong> {error.message}
                </div>
            )}
            <button
                onClick={() => reset()}
                style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.5rem",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer"
                }}
            >
                Reload
            </button>
        </div>
    );
}
