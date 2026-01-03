"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFeature } from "@/app/context/FeatureFlagContext";
import styles from "./AdminDashboard.module.css";

export default function AdminLayout({ children }) {
    const { user, loading, initialized, isAdmin } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null); // null = unknown, false = denied, true = allowed

    useEffect(() => {
        // Wait for auth to be fully initialized
        if (!initialized || loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        // Use the robust isAdmin check from context (checks profile.role)
        console.log("AdminLayout Check:", { isAdmin, role: user.role, meta: user.user_metadata });
        if (isAdmin) {
            setIsAuthorized(true);
        } else {
            console.warn("Access Denied: User is not admin. Role:", user.role, "Meta:", user.user_metadata);
            setIsAuthorized(false);
        }
    }, [user, loading, initialized, isAdmin, router]);

    if (!initialized || loading || isAuthorized === null) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0f172a",
                color: "white"
            }}>
                <p>Loading Admin Panel...</p>
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#0f172a",
                color: "white",
                gap: "1rem"
            }}>
                <h1 style={{ fontSize: "2rem", color: "#ef4444" }}>Access Denied</h1>
                <p style={{ color: "#94a3b8" }}>You do not have permission to view this page.</p>
                <p style={{ color: "orange", fontSize: "0.8rem" }}>
                    Debug: Role={user?.role} | MetaRole={user?.user_metadata?.role} | IsAdmin={String(isAdmin)}
                </p>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={() => router.push("/dashboard")}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => router.push("/login")}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            background: "#334155",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#f1f5f9", minHeight: "100vh", color: "#0f172a", display: "flex" }}>
            <aside style={{ width: "250px", borderRight: "1px solid var(--border)", padding: "1rem", background: "#0f172a", color: "white" }}>
                <h2 style={{ fontSize: "1.25rem", color: "#38bdf8", marginBottom: "2rem" }}>Meddot Admin</h2>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <a href="#users" style={{ padding: "0.5rem", color: "#e2e8f0", textDecoration: "none", borderRadius: "0.5rem", transition: "background 0.2s" }} className="hover:bg-slate-800">User Management</a>
                    <a href="#moderation" style={{ padding: "0.5rem", color: "#94a3b8", textDecoration: "none", borderRadius: "0.5rem", transition: "background 0.2s" }} className="hover:text-white">Content Moderation</a>
                    <a href="#announcements" style={{ padding: "0.5rem", color: "#94a3b8", textDecoration: "none", borderRadius: "0.5rem", transition: "background 0.2s" }} className="hover:text-white">Announcements</a>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: "2rem" }}>
                {children}
            </main>
        </div>
    );
}
