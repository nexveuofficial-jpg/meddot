"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import DashboardCard from "../components/ui/DashboardCard";
import { supabase } from "@/lib/supabase";
import { Megaphone } from "lucide-react";

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (data) setAnnouncements(data);
        };
        fetchAnnouncements();
    }, []);

    // Helper wrapper for links or div
    const CardWrapper = ({ href, children }) => {
        if (href) return <Link href={href} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>{children}</Link>;
        return <div style={{ height: '100%' }}>{children}</div>;
    };

    const cards = [
        {
            title: "Notes Library",
            description: "Access premium medical notes and revision sheets.",
            accent: "#0ea5e9",
            href: "/notes",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
        },
        {
            title: "Ask Senior",
            description: "Get guidance and specific answers from seniors.",
            accent: "#8b5cf6",
            href: "/ask-senior",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        },
        {
            title: "Study Chat",
            description: "Join real-time discussions in subject rooms.",
            accent: "#f59e0b",
            href: "/chat",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        },
        {
            title: "Focus Mode",
            description: "Distraction-free timer for deep work.",
            accent: "#2dd4bf",
            href: "/focus",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        },
        {
            title: "My Bookmarks",
            description: "Your saved notes.",
            accent: "#f43f5e",
            href: "/notes", // Redirect to library for now, filtering logic pending phase 5
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        },
    ];

    if (user?.role === 'admin') {
        cards.push({
            title: "Admin Panel",
            description: "Manage users, content, and settings.",
            accent: "#64748b",
            href: "/admin",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        });
    }

    return (
        <div>
            <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "3rem",
                animation: "fadeInUp 0.6s ease-out"
            }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>
                        Good Afternoon,<br />
                        <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>{user?.full_name?.split(' ')[0] || 'Student'}</span>
                    </h1>
                </div>
                <button
                    onClick={logout}
                    style={{
                        padding: "0.75rem 1.5rem",
                        borderRadius: "2rem",
                        background: "white",
                        border: "1px solid var(--border)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all 0.2s"
                    }}
                >
                    Logout
                </button>
            </header>

            {/* Announcements Section */}
            {announcements.length > 0 && (
                <div style={{ marginBottom: "3rem", animation: "fadeInUp 0.6s ease-out 0.1s backwards" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Announcements
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {announcements.map((ann) => (
                            <div key={ann.id} style={{
                                padding: "1rem 1.5rem",
                                background: "#fff",
                                borderLeft: "4px solid var(--primary)",
                                borderRadius: "0.5rem",
                                boxShadow: "var(--shadow-sm)",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem"
                            }}>
                                <Megaphone size={20} color="var(--primary)" />
                                <span style={{ fontWeight: 500 }}>{ann.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2rem",
                paddingBottom: "2rem"
            }}>
                {cards.map((card, index) => (
                    <div key={index} style={{ height: "240px", animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` }}>
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
        </div>
    );
}
