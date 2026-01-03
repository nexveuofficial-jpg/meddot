"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import styles from "./dashboard.module.css";
import { Menu, X } from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";
import Link from "next/link";

export default function DashboardLayout({ children }) {
    const { user, loading, initialized, logout, debugStatus } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const NavLink = ({ href, children }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
            <Link
                href={href}
                className={isActive ? styles.activeNav : styles.navItem}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                {children}
            </Link>
        );
    };

    useEffect(() => {
        // Only redirect if auth is fully initialized and we definitely have no user
        if (initialized && !loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, initialized, router]);

    // Close mobile menu on route change or when screen resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show loading spinner until we know auth state
    if (!initialized || loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)', position: 'relative', zIndex: 9999 }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Initializing Dashboard...</p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Auth Loading: {loading ? 'Yes' : 'No'}, Init: {initialized ? 'Yes' : 'No'}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.5rem' }}>Debug: {debugStatus}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red', zIndex: 9999, position: 'relative' }}>
                Redirecting to Login... (No User Found)
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Mobile Toggle Button */}
            <button
                className={styles.toggleButton}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            <div
                className={`${styles.overlay} ${isMobileMenuOpen ? styles.visible : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Meddot.</h2>
                    <p className={styles.subtitle}>Student Portal</p>
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: '0.5rem', marginTop: "2rem" }}>
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/notes">Notes Library</NavLink>
                    <NavLink href="/ask-senior">Ask Senior</NavLink>
                    <NavLink href="/chat">Study Groups</NavLink>
                    <NavLink href="/focus">Focus Mode</NavLink>
                    <NavLink href="/profile">My Profile</NavLink>
                    <NavLink href="/settings">Settings</NavLink>

                    <button
                        onClick={() => logout()}
                        className={styles.navItem}
                        style={{ marginTop: "auto", textAlign: "left", color: "#ef4444", fontWeight: 600 }}
                    >
                        Sign Out
                    </button>
                </nav>
            </aside>

            <main className={styles.main}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
}
