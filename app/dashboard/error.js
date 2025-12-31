"use client";

import { useEffect } from "react";

export default function DashboardError({ error, reset }) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            textAlign: "center"
        }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
                Unable to load dashboard content
            </h2>
            <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground, #666)" }}>
                There was a problem loading this section.
            </p>
            <button
                onClick={() => reset()}
                style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    background: "var(--primary, #007BFF)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500
                }}
            >
                Try again
            </button>
        </div>
    );
}
