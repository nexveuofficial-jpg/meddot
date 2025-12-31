"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import { Menu, X } from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("meddot_user");

        // Only redirect if NOT loading and NO user
        if (!loading && !user && !storedUser) {
            router.push("/login");
        }
    }, [user, loading, router]);

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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user && typeof window !== 'undefined' && !localStorage.getItem("meddot_user")) {
        return null;
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

                <nav style={{ display: "flex", flexDirection: "column" }}>
                    <div className={styles.activeNav}>Dashboard</div>
                    <div className={styles.navItem}>Notes Library</div>
                    <div className={styles.navItem}>My Bookmarks</div>
                    <div className={styles.navItem} style={{ marginTop: "auto" }}>Settings</div>
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
