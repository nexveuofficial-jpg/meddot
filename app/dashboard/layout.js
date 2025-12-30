"use client";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("meddot_user");
        if (!storedUser && !user) {
            router.push("/login");
        }
    }, [user, router]);

    if (!user && typeof window !== 'undefined' && !localStorage.getItem("meddot_user")) {
        return null;
    }

    const navItemStyle = {
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        color: "var(--foreground)",
        fontSize: "0.95rem",
        fontWeight: 500,
        marginBottom: "0.5rem",
        cursor: "pointer",
        transition: "all 0.2s ease"
    };

    const activeNavStyle = {
        ...navItemStyle,
        background: "var(--accent)",
        color: "var(--accent-foreground)",
        fontWeight: 600
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "var(--muted)" }}>
            <aside style={{
                width: "280px",
                background: "var(--background)",
                borderRight: "1px solid var(--border)",
                padding: "2rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
                height: "100vh"
            }}>
                <div style={{ marginBottom: "3rem", paddingLeft: "0.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", color: "var(--primary)", letterSpacing: "-0.03em" }}>Meddot.</h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Student Portal</p>
                </div>

                <nav style={{ display: "flex", flexDirection: "column" }}>
                    <div style={activeNavStyle}>Dashboard</div>
                    <div style={navItemStyle} className="hover-nav">Notes Library</div>
                    <div style={navItemStyle} className="hover-nav">My Bookmarks</div>
                    <div style={{ ...navItemStyle, marginTop: "auto", color: "var(--muted-foreground)" }}>Settings</div>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: "3rem 4rem", overflowY: "auto" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
