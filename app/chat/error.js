"use client";

import { useEffect } from "react";
import { MessageSquareOff } from "lucide-react";

export default function ChatError({ error, reset }) {
    useEffect(() => {
        console.error("Chat Error:", error);
    }, [error]);

    return (
        <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "#fef3c7", padding: "1rem", borderRadius: "50%", marginBottom: "1.5rem" }}>
                <MessageSquareOff size={32} color="#d97706" />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#1f2937" }}>
                Chat unavailable
            </h2>
            <p style={{ marginBottom: "2rem", color: "#6b7280", maxWidth: '400px', wordBreak: 'break-word' }}>
                {error.message || "We couldn't connect to the chat server."}
            </p>
            <button
                onClick={() => reset()}
                style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.5rem",
                    background: "#d97706",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer"
                }}
            >
                Retry Connection
            </button>
        </div>
    );
}
