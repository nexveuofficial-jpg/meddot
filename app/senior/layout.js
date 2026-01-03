"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./SeniorDashboard.module.css";
import Link from "next/link";
import { LayoutDashboard, MessageSquare, LogOut, ArrowLeft } from "lucide-react";
import Loader from "../components/ui/Loader";

export default function SeniorLayout({ children }) {
    const { user, loading, initialized, isSenior, isAdmin, logout } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        if (!initialized || loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        // Allow if Senior OR Admin
        if (isSenior || isAdmin) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    }, [user, loading, initialized, isSenior, isAdmin, router]);

    if (!initialized || loading || isAuthorized === null) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f9ff" }}>
                <Loader size={48} className="text-primary" />
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
                <h1 className="text-2xl font-bold text-red-500">Access Restricted</h1>
                <p className="text-muted-foreground">This area is reserved for verified Seniors.</p>
                <Link href="/dashboard" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
            {/* Senior Sidebar */}
            <aside style={{
                width: "260px",
                background: "#0f172a", // Dark Admin-like sidebar
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
                height: "100vh",
                zIndex: 10,
                color: "white"
            }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }}></div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)" }}>Senior Panel</span>
                    </div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Meddot.</h2>
                </div>

                <nav style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <NavItem href="/senior" icon={<LayoutDashboard size={18} />}>Overview</NavItem>
                    <NavItem href="/senior/questions" icon={<MessageSquare size={18} />}>Unanswered Questions</NavItem>
                </nav>

                <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)" }}>
                    <Link href="/dashboard" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        color: "var(--muted-foreground)",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        borderRadius: "0.5rem",
                        marginBottom: "0.5rem"
                    }}>
                        <ArrowLeft size={18} />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, children }) {
    return (
        <Link href={href} style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            color: "#e2e8f0", // Light gray for dark bg
            textDecoration: "none",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: "0.5rem",
            transition: "all 0.2s",
            background: "transparent"
        }}
            className="hover:bg-slate-800 hover:text-white"
        >
            {icon}
            {children}
        </Link>
    );
}
