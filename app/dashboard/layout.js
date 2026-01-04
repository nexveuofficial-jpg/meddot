"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import styles from "./dashboard.module.css";
import { Menu, X } from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";
import Link from "next/link";
import Loader from "../components/ui/Loader";

export default function DashboardLayout({ children }) {
    const { user, loading, initialized, logout, isAdmin, isSenior, profile } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    // Show loading spinner until we know auth state
    if (!initialized || loading) {
        return <Loader fullScreen />;
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
                    {profile?.avatar_url ? (
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid white',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            marginBottom: '1rem'
                        }}>
                            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ) : null}
                    <h2 className={styles.title}>Meddot.</h2>
                    <p className={styles.subtitle}>Student Portal</p>
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: '0.5rem', marginTop: "2rem" }}>
                    <NavLink href="/dashboard" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>Dashboard</NavLink>
                    <NavLink href="/notes" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>Notes Library</NavLink>
                    <NavLink href="/ask-senior" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>Ask Senior</NavLink>
                    <NavLink href="/chat" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>Study Groups</NavLink>
                    <NavLink href="/messages" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>Messages</NavLink>
                    <NavLink href="/focus" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>Focus Mode</NavLink>
                    <NavLink href="/profile" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>My Profile</NavLink>

                    {/* Admin Access */}
                    {isAdmin && (
                        <NavLink href="/admin" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Admin Panel</span>
                        </NavLink>
                    )}

                    {/* Senior Panel */}
                    {(isSenior || isAdmin) && (
                        <NavLink href="/senior" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen}>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Senior Panel</span>
                        </NavLink>
                    )}


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

function NavLink({ href, children, pathname, setIsMobileMenuOpen }) {
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
}
