"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            if (email.includes("admin")) {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } else {
            setError("Invalid credentials. Try student@meddot.com / password");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                padding: "2rem",
                borderRadius: "1rem",
                background: "var(--background)",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
            }}>
                <h1 style={{ marginBottom: "1.5rem", textAlign: "center", color: "var(--primary)" }}>Login to Meddot</h1>

                {error && <p style={{ color: "red", marginBottom: "1rem", fontSize: "0.875rem", textAlign: "center" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--border)",
                                background: "var(--muted)"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--border)",
                                background: "var(--muted)"
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: "1rem",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            background: "var(--primary)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "1rem"
                        }}
                    >
                        Sign In
                    </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                    Don't have an account? <Link href="/signup" style={{ color: "var(--primary)" }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
