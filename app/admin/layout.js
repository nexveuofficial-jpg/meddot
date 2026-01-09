"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFeature } from "@/app/context/FeatureFlagContext";
import styles from "./AdminDashboard.module.css";
import { Users, FileText, MessageSquare, Megaphone, Home, LogOut, Shield, Menu, X } from "lucide-react";

const SidebarLink = ({ href, icon: Icon, label, onClick }) => (
    <a
        href={href}
        onClick={onClick}
        className={styles.navLink}
    >
        <span className={styles.navLinkIcon}><Icon size={20} /></span>
        <span>{label}</span>
    </a>
);

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
            <header className={`${styles.mobileHeader} lg:hidden`}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
                    >
                        <Menu size={24} />
                    </button>
                    <span className={styles.brand} style={{ fontSize: "1.25rem" }}>Meddot Admin</span>
                </div>
            </header>

            <div style={{ display: "flex", flex: 1, position: "relative" }}>
                {/* Sidebar Overlay (Mobile) */}
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className={`${styles.mobileOverlay} lg:hidden`}
                    />
                )}

                <aside
                    className={`${styles.sidebar} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                >
                    <div className={styles.sidebarHeader}>
                        <div style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
                            <Shield size={24} color="white" />
                        </div>
                        <h2 className={styles.brand}>Meddot</h2>

                        {/* Close button mobile only */}
                        <button
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'gray', marginLeft: 'auto', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className={styles.nav}>
                        <SidebarLink href="/dashboard" icon={Home} label="Return to App" onClick={() => setSidebarOpen(false)} />

                        <div style={{ height: '1px', background: '#1e293b', margin: '0.5rem 0' }}></div>

                        <SidebarLink href="#users" icon={Users} label="User Management" onClick={() => setSidebarOpen(false)} />
                        <SidebarLink href="#moderation" icon={FileText} label="Content Moderation" onClick={() => setSidebarOpen(false)} />
                        <SidebarLink href="#announcements" icon={Megaphone} label="Announcements" onClick={() => setSidebarOpen(false)} />
                        <SidebarLink href="#rooms" icon={MessageSquare} label="Chat Rooms" onClick={() => setSidebarOpen(false)} />
                    </nav>

                    <div className={styles.sidebarFooter}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.full_name?.split(' ')[0] || 'Admin'}</span>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Administrator</span>
                            </div>
                        </div>
                        <button onClick={() => router.push('/login')} className={styles.logoutButton}>
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Spacer for Desktop Sidebar */}
                <div className="hidden lg:block" style={{ width: "280px", flexShrink: 0 }}></div>

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
