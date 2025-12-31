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
            height: "100vh",
            padding: "2rem"
        }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Something went wrong!</h2>
            <button
                onClick={() => reset()}
                style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.5rem",
                    background: "var(--primary, #007BFF)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold"
                }}
            >
                Try again
            </button>
        </div>
    );
}
