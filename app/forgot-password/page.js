"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile/update-password`,
            });

            if (error) {
                setStatus("error");
                setMessage(error.message);
            } else {
                setStatus("success");
                setMessage("Check your email for the password reset link.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("An unexpected error occurred.");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "var(--background)"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                padding: "2rem",
                borderRadius: "1rem",
                background: "white",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-lg)"
            }}>
                <Link href="/login" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <h1 style={{ marginBottom: "0.5rem", color: "var(--foreground)" }}>Reset Password</h1>
                <p style={{ marginBottom: "1.5rem", color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
                    Enter your email to receive reset instructions.
                </p>

                {status === "success" ? (
                    <div style={{ padding: "1rem", background: "#f0fdf4", color: "#166534", borderRadius: "0.5rem", border: "1px solid #bbf7d0", marginBottom: "1rem" }}>
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="student@meddot.com"
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem 0.75rem 3rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid var(--border)",
                                        background: "var(--background)",
                                        fontSize: "1rem"
                                    }}
                                />
                            </div>
                        </div>

                        {status === "error" && (
                            <div style={{ color: "#ef4444", fontSize: "0.9rem" }}>{message}</div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                background: "var(--primary)",
                                color: "white",
                                fontWeight: 600,
                                fontSize: "1rem",
                                cursor: status === "loading" ? "not-allowed" : "pointer",
                                opacity: status === "loading" ? 0.8 : 1
                            }}
                        >
                            {status === "loading" && <Loader2 className="animate-spin" size={18} />}
                            {status === "loading" ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
