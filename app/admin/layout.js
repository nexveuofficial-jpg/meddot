"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFeature } from "@/app/context/FeatureFlagContext";
import styles from "./AdminDashboard.module.css";

export default function AdminLayout({ children }) {
    const { user } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null); // null = loading, false = denied, true = allowed

    useEffect(() => {
        // We need to wait for the user state to be determined (which might happen after a mount if it depends on localStorage)
        // However, AuthContext initializes from localStorage in its own effect.
        // We double check localStorage here just to be safe and avoid flickering if context is slow, 
        // but primarily rely on context if available.

        const checkAuth = () => {
            const storedUserStr = localStorage.getItem("meddot_user");
            let currentUser = user;

            if (!currentUser && storedUserStr) {
                currentUser = JSON.parse(storedUserStr);
            }

            if (!currentUser) {
                router.push("/login"); // Not logged in
                return;
            }

            if (currentUser.role !== 'admin') {
                setIsAuthorized(false); // Logged in but not admin
            } else {
                setIsAuthorized(true); // Admin
            }
        };

        checkAuth();
    }, [user, router]);

    if (isAuthorized === null) {
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
        <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", display: "flex" }}>
            <aside style={{ width: "250px", borderRight: "1px solid #334155", padding: "1rem" }}>
                <h2 style={{ fontSize: "1.25rem", color: "#38bdf8", marginBottom: "2rem" }}>Meddot Admin</h2>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ padding: "0.5rem", background: "#1e293b", borderRadius: "0.5rem" }}>User Management</div>
                    <div style={{ padding: "0.5rem", color: "#94a3b8" }}>Content Moderation</div>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: "2rem" }}>
                {children}
            </main>
        </div>
    );
}
