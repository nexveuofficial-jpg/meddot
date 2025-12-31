"use client";

import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "4rem", textAlign: "center", background: "#fef2f2", color: "#991b1b", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong.</h2>
                    <p style={{ maxWidth: "500px", marginBottom: "2rem" }}>
                        We encountered a runtime error. This might be due to a connectivity issue or a temporary glitch.
                    </p>
                    <pre style={{ background: "white", padding: "1rem", borderRadius: "0.5rem", overflow: "auto", maxWidth: "800px", marginBottom: "2rem", textAlign: "left", fontSize: "0.8rem", border: "1px solid #fca5a5" }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false });
                            window.location.reload();
                        }}
                        style={{
                            padding: "0.75rem 1.5rem",
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
