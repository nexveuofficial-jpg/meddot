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

        // Use the robust isAdmin check from context
        if (isAdmin) {
            setIsAuthorized(true);
        } else {
            // console.warn("Access Denied: User is not admin. Role:", user.role, "Meta:", user.user_metadata);
            setIsAuthorized(false);
        }
    }, [user, loading, initialized, isAdmin, router]);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar when route changes (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [router]);

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
        <div style={{ background: "#f1f5f9", minHeight: "100vh", color: "#0f172a", display: "flex", flexDirection: "column" }}>
            {/* Mobile Header */}
            <header className="lg:hidden" style={{
                background: "#0f172a",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "white"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Meddot Admin</span>
                </div>
            </header>

            <div style={{ display: "flex", flex: 1, position: "relative" }}>
                {/* Sidebar Overlay (Mobile) */}
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40
                        }}
                        className="lg:hidden"
                    />
                )}

                <aside
                    className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                    style={{
                        width: "250px",
                        borderRight: "1px solid var(--border)",
                        padding: "1rem",
                        background: "#0f172a",
                        color: "white",
                        position: 'fixed',
                        height: '100vh',
                        zIndex: 50,
                        transition: 'transform 0.3s ease-in-out',
                        left: 0,
                        top: 0,
                        bottom: 0
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", color: "#38bdf8", margin: 0 }}>Meddot Admin</h2>
                        {/* Close button mobile only */}
                        <button
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'white' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <a href="#users" onClick={() => setSidebarOpen(false)} style={{ padding: "0.5rem", color: "#e2e8f0", textDecoration: "none", borderRadius: "0.5rem", transition: "background 0.2s" }} className="hover:bg-slate-800">User Management</a>
                        <a href="#moderation" onClick={() => setSidebarOpen(false)} style={{ padding: "0.5rem", color: "#94a3b8", textDecoration: "none", borderRadius: "0.5rem", transition: "background 0.2s" }} className="hover:text-white">Content Moderation</a>
                        <a href="#announcements" onClick={() => setSidebarOpen(false)} style={{ padding: "0.5rem", color: "#94a3b8", textDecoration: "none", borderRadius: "0.5rem", transition: "background 0.2s" }} className="hover:text-white">Announcements</a>
                        <a href="#rooms" onClick={() => setSidebarOpen(false)} style={{ padding: "0.5rem", color: "#94a3b8", textDecoration: "none", borderRadius: "0.5rem", transition: "background 0.2s" }} className="hover:text-white">Chat Rooms</a>
                    </nav>
                </aside>

                {/* Main Content Spacer for Desktop Sidebar */}
                <div className="hidden lg:block" style={{ width: "250px", flexShrink: 0 }}></div>

                <main style={{ flex: 1, padding: "1.5rem", overflowX: "hidden" }}>
                    {children}
                </main>
            </div>

            {/* Add global styles for Tailwind-like utility classes used above if not present, primarily for media queries */}
            <style jsx global>{`
                @media (min-width: 1024px) {
                    .lg\\:hidden { display: none !important; }
                    .lg\\:block { display: block !important; }
                    .lg\\:translate-x-0 { transform: translateX(0) !important; }
                }
                @media (max-width: 1023px) {
                    .hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}
