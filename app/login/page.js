"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.error || "Invalid credentials. Try student@meddot.com / password");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("An unexpected error occurred.");
            setIsLoading(false);
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
                background: "#ffffff", // Force White
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: "#0f172a" // Force Dark Text
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
                                border: "1px solid #cbd5e1",
                                background: "#f8fafc",
                                color: "#0f172a"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    borderRadius: "0.5rem",
                                    border: "1px solid #cbd5e1",
                                    background: "#f8fafc",
                                    color: "#0f172a",
                                    paddingRight: "2.5rem"
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#64748b"
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <Link href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.opacity = "0.9")}
                        onMouseLeave={(e) => !isLoading && (e.currentTarget.style.opacity = "1")}
                        style={{
                            marginTop: "1rem",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            background: isLoading ? "var(--muted)" : "var(--primary)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "1rem",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.7 : 1,
                            transition: "opacity 0.2s"
                        }}
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                    Don&apos;t have an account? <Link href="/signup" style={{ color: "var(--primary)" }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
