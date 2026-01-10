"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFeature } from "@/app/context/FeatureFlagContext";
import DashboardCard from "../components/ui/DashboardCard";
import DoctorCompanion from "../components/companion/DoctorCompanion";
import GlassButton from "../components/ui/GlassButton";
import { supabase } from "@/lib/supabase";
import { Megaphone, AlertCircle, BookOpen, GraduationCap, MessageCircle, Clock, Bookmark, Shield } from "lucide-react";

export default function DashboardPage() {
    const { user, profile, logout, loading } = useAuth();
    const router = useRouter(); 
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



    const allCards = [
        {
            id: 'notes',
            title: "Notes Library",
            description: "Access premium medical notes and revision sheets.",
            accent: "#0ea5e9",
            href: "/notes",
            icon: <BookOpen size={24} />
        },
        {
            id: 'ask_senior',
            flag: 'enable_ask_senior',
            title: "Ask Senior",
            description: "Get guidance and specific answers from seniors.",
            accent: "#8b5cf6",
            href: "/ask-senior",
            icon: <GraduationCap size={24} />
        },
        {
            id: 'chat',
            flag: 'enable_chat',
            title: "Study Chat",
            description: "Join real-time discussions in subject rooms.",
            accent: "#f59e0b",
            href: "/chat",
            icon: <MessageCircle size={24} />
        },
        {
            id: 'focus',
            title: "Focus Mode", 
            description: "Distraction-free timer for deep work.",
            accent: "#2dd4bf",
            href: "/focus",
            icon: <Clock size={24} />
        },
        {
            id: 'bookmarks',
            title: "My Bookmarks",
            description: "Your saved notes.",
            accent: "#f43f5e",
            href: "/notes",
            icon: <Bookmark size={24} />
        },
    ];

    const cards = allCards.filter(card => !card.flag || isEnabled(card.flag));

    if (user?.role === 'admin') {
        cards.push({
            title: "Admin Panel",
            description: "Manage users, content, and settings.",
            accent: "#64748b",
            href: "/admin",
            icon: <Shield size={24} />
        });
    }

    // Helper for Urgent vs Normal
    // This function is no longer used as styling is handled by Tailwind classes directly in JSX.
    // const getAnnouncementStyle = (type) => {
    //     if (type === 'urgent') return {
    //         borderLeft: "4px solid #ef4444",
    //         background: "#fef2f2"
    //     };
    //     return {}; // Default handled by CSS class
    // };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-slate-400">
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 mt-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2 text-white">
                        {(() => {
                            const hour = new Date().getHours();
                            if (hour < 12) return "Good Morning,";
                            if (hour < 18) return "Good Afternoon,";
                            return "Good Evening,";
                        })()}<br />
                        <span className="text-slate-400 font-normal">
                            {profile?.full_name || user?.user_metadata?.full_name || (profile?.role === 'admin' ? 'Admin' : 'Student')}
                        </span>
                    </h1>
                </div>
                <GlassButton
                    onClick={logout}
                    variant="danger"
                    size="sm"
                    className="shadow-red-500/20"
                >
                    Logout
                </GlassButton>
            </header>

            {/* Announcements Section */}
            {announcements.length > 0 && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                        Announcements
                    </h3>
                    <div className="space-y-4">
                        {announcements.map((ann) => (
                            <div 
                                key={ann.id} 
                                className={`flex items-center gap-4 p-4 rounded-xl shadow-sm ${ann.priority === 'urgent' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white border-l-4 border-cyan-500'}`}
                            >
                                {ann.priority === 'urgent' ? <AlertCircle size={24} className="text-red-500" /> : <Megaphone size={24} className="text-cyan-500" />}
                                <div>
                                    <h4 className={`font-bold ${ann.priority === 'urgent' ? 'text-red-900' : 'text-slate-900'}`}>
                                        {ann.title}
                                    </h4>
                                    <p className={`text-sm ${ann.priority === 'urgent' ? 'text-red-700' : 'text-slate-600'}`}>
                                        {ann.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                {cards.map((card, index) => (
                    <div key={index} className="h-[240px]">
                        <DashboardCard
                            {...card}
                            accentColor={card.accent}
                            // icon passed directly
                            delay={index * 0.1}
                        />
                    </div>
                ))}
            </div>

            {/* Companion Section */}
            <div className="mt-12 bg-slate-900/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                 <DoctorCompanion mood="happy" />
            </div>
            
        </div>
    );
}
