"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error("App error:", error);
    }, [error]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            padding: "2rem",
            textAlign: "center"
        }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: 'var(--foreground)' }}>Something went wrong!</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--muted-foreground)' }}>{error.message || "An unexpected error occurred."}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: "0.6rem 1.2rem",
                        borderRadius: "0.5rem",
                        background: "var(--primary)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    Try again
                </button>
                <button
                    onClick={() => window.location.href = "/dashboard"}
                    style={{
                        padding: "0.6rem 1.2rem",
                        borderRadius: "0.5rem",
                        background: "var(--muted)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    Dashboard
                </button>
            </div>
        </div>
    );
}
