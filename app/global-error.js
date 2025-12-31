"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error("Global application error:", error);
    }, [error]);

    return (
        <html>
            <body style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto", marginTop: "10vh" }}>
                    <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong!</h1>
                    <p style={{ marginBottom: "2rem", color: "#666" }}>
                        We encountered an unexpected error. Please try again or return to the login page.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.5rem",
                                background: "#007BFF",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => window.location.href = "/login"}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.5rem",
                                background: "#f0f0f0",
                                color: "#333",
                                border: "1px solid #ccc",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
