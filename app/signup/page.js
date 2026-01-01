"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await signup(name, email, password);
        if (result.success) {
            alert("Signup successful! Please log in.");
            router.push("/login");
        } else {
            alert(result.error || "Signup failed");
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
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: "#0f172a"
            }}>
                <h1 style={{ marginBottom: "1.5rem", textAlign: "center", color: "#0ea5e9" }}>Join Meddot</h1>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid #cbd5e1",
                                background: "#f8fafc",
                                color: "#0f172a"
                            }}
                        />
                    </div>

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
                                border: "1px solid #cbd5e1",
                                background: "#f8fafc",
                                color: "#0f172a"
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
                                border: "1px solid #cbd5e1",
                                background: "#f8fafc",
                                color: "#0f172a"
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
                        Sign Up
                    </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                    Already have an account? <Link href="/login" style={{ color: "var(--primary)" }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
