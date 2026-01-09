"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import BrandLogo from "../components/BrandLogo";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [studyYear, setStudyYear] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await signup(name, email, password, studyYear);

        if (result.success) {
            // Because email confirmation is ON, we usually won't get a session immediately.
            // However, we check just in case.
            if (result.data?.session) {
                router.push('/dashboard');
            } else {
                // Email confirmation required
                setShowSuccess(true);
            }
        } else {
            alert(result.error || "Signup failed");
        }
    };

    if (showSuccess) {
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
                    color: "#0f172a",
                    textAlign: "center"
                }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                        <BrandLogo size="2rem" />
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Check your email</h2>
                    <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                        We've sent a confirmation link to<br/> <span style={{fontWeight: 600, color: "#0f172a"}}>{email}</span>.
                    </p>
                    <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "2rem" }}>
                        Please check your inbox (and spam folder) and click the link to verify your account.
                    </p>
                    <Link 
                        href="/login"
                        style={{
                            display: "inline-block",
                            padding: "0.75rem 2rem",
                            borderRadius: "0.5rem",
                            background: "var(--primary)",
                            color: "white",
                            fontWeight: 600,
                            textDecoration: "none"
                        }}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

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
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                    <BrandLogo size="2rem" />
                </div>
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.2rem", fontWeight: 600, color: "#64748b" }}>Create your account</h2>

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
                        <label style={{ display: "block", marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Study Year</label>
                        <input
                            type="number"
                            min="1"
                            max="6"
                            placeholder="e.g. 1 (for 1st year)"
                            value={studyYear}
                            onChange={(e) => setStudyYear(e.target.value)}
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
