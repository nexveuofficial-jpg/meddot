"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFeature } from "@/app/context/FeatureFlagContext";
import DashboardCard from "../components/ui/DashboardCard";
import DoctorCompanion from "../components/companion/DoctorCompanion";
import { supabase } from "@/lib/supabase";
import { Megaphone, AlertCircle } from "lucide-react";
import styles from "./page.module.css";

export default function DashboardPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter(); // Missing import fix needed if not imported? it is not imported.
    const { isEnabled } = useFeature();
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        if (!loading && !user) {
            window.location.href = '/login'; // Force reload to clear any weird state
        }
    }, [user, loading]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // Fetch active announcements
                const { data, error } = await supabase
                    .from("announcements")
                    .select("*")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching announcements:", error);
                } else {
                    setAnnouncements(data || []);
                }
            } catch (error) {
                console.error("Crash fetching announcements:", error);
                setAnnouncements([]);
            }
        };
        fetchAnnouncements();
    }, []);

    // Helper wrapper for links or div
    const CardWrapper = ({ href, children }) => {
        if (href) return <Link href={href} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>{children}</Link>;
        return <div style={{ height: '100%' }}>{children}</div>;
    };

    const allCards = [
        {
            id: 'notes',
            title: "Notes Library",
            description: "Access premium medical notes and revision sheets.",
            accent: "#0ea5e9",
            href: "/notes",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
        },
        {
            id: 'ask_senior',
            flag: 'enable_ask_senior',
            title: "Ask Senior",
            description: "Get guidance and specific answers from seniors.",
            accent: "#8b5cf6",
            href: "/ask-senior",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        },
        {
            id: 'chat',
            flag: 'enable_chat',
            title: "Study Chat",
            description: "Join real-time discussions in subject rooms.",
            accent: "#f59e0b",
            href: "/chat",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        },
        {
            id: 'focus',
            title: "Focus Mode", // Keeping base Focus Mode always available, or gate if 'enable_focus_rooms' implies all focus features
            description: "Distraction-free timer for deep work.",
            accent: "#2dd4bf",
            href: "/focus",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        },
        {
            id: 'bookmarks',
            title: "My Bookmarks",
            description: "Your saved notes.",
            accent: "#f43f5e",
            href: "/notes",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        },
    ];

    const cards = allCards.filter(card => !card.flag || isEnabled(card.flag));

    if (user?.role === 'admin') {
        cards.push({
            title: "Admin Panel",
            description: "Manage users, content, and settings.",
            accent: "#64748b",
            href: "/admin",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        });
    }

    // Helper for Urgent vs Normal
    const getAnnouncementStyle = (type) => {
        if (type === 'urgent') return {
            borderLeft: "4px solid #ef4444",
            background: "#fef2f2"
        };
        return {}; // Default handled by CSS class
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8' }}>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.greeting}>
                        Good Afternoon,<br />
                        <span className={styles.userName}>{user?.full_name?.split(' ')[0] || 'Student'}</span>
                    </h1>
                </div>
                <button
                    onClick={logout}
                    className={styles.logoutButton}
                >
                    Logout
                </button>
            </header>

            {/* Announcements Section */}
            {announcements.length > 0 && (
                <div className={styles.announcementSection}>
                    <h3 className={styles.announcementTitle}>
                        Announcements
                    </h3>
                    <div className={styles.announcementList}>
                        {announcements.map((ann) => (
                            <div key={ann.id} className={styles.announcementCard} style={getAnnouncementStyle(ann.priority || ann.type)}>
                                {ann.priority === 'urgent' ? <AlertCircle size={20} color="#ef4444" /> : <Megaphone size={20} color="var(--primary)" />}
                                <span style={{ fontWeight: 500 }}>{ann.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.grid}>
                {cards.map((card, index) => (
                    <div key={index} className={styles.cardContainer} style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` }}>
                        <CardWrapper href={card.href}>
                            <DashboardCard
                                title={card.title}
                                description={card.description}
                                icon={card.icon}
                                accentColor={card.accent}
                                delay={index * 0.1}
                            />
                        </CardWrapper>
                    </div>
                ))}
            </div>

            <DoctorCompanion mood="idle" context="dashboard" />
        </div>
    );
}
