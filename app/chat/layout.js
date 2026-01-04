"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { Hash, ArrowLeft } from "lucide-react";
import Loader from "../components/ui/Loader";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function ChatLayout({ children }) {
    const [rooms, setRooms] = useState([]);
    const [dms, setDms] = useState([]); // Separate state for DMs
    const [loading, setLoading] = useState(true);
    const { isEnabled, loading: flagsLoading } = useFeature();
    const { user } = useAuth(); // Need user to fetch DMs
    const pathname = usePathname();
    const isChatActive = pathname && pathname !== '/chat';

    useEffect(() => {
        const fetchData = async () => {
            if (!isEnabled('enable_chat')) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Public Rooms
                const { data: publicRooms } = await supabase
                    .from("chat_rooms")
                    .select("*")
                    .eq("is_active", true)
                    .neq("type", "dm") // Exclude DMs
                    .order("name", { ascending: true });

                setRooms(publicRooms || []);

                // 2. Fetch My DMs (if logged in)
                if (user) {
                    const { data: myDms } = await supabase
                        .from("chat_rooms")
                        .select("*")
                        .eq("type", "dm")
                        .contains("participants", [user.id]);

                    // For DMs, we probably want to fetch the OTHER user's name to display instead of "DM"
                    // But for MVP, let's just list them. Ideally we map participants to names.
                    // Doing a clientside fetch for names for now to be quick.
                    if (myDms && myDms.length > 0) {
                        const enrichedDms = await Promise.all(myDms.map(async (dm) => {
                            const otherUserId = dm.participants.find(id => id !== user.id);
                            if (!otherUserId) return { ...dm, displayName: 'Me' };

                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('username, full_name')
                                .eq('id', otherUserId)
                                .single();

                            return {
                                ...dm,
                                displayName: profile ? (profile.username || profile.full_name) : 'Unknown User'
                            };
                        }));
                        setDms(enrichedDms);
                    } else {
                        setDms([]);
                    }
                }

            } catch (error) {
                console.error("Error fetching chat data:", error);
            }
            setLoading(false);
        };

        if (!flagsLoading) {
            fetchData();
        }
    }, [isEnabled, flagsLoading, user]);

    // ... (rest of code) ...

    return (
        <div style={{ display: "flex", height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
            {/* Sidebar */}
            <aside className={`chat-sidebar ${isChatActive ? 'hidden-mobile' : ''}`}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '1rem' }}>
                        <ArrowLeft size={16} /> Back
                    </Link>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Messages</h2>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader size={20} /></div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                            {/* DMs Section */}
                            {dms.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Direct Messages</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                        {dms.map(dm => {
                                            const isActive = pathname === `/chat/${dm.id}`;
                                            return (
                                                <Link
                                                    key={dm.id}
                                                    href={`/chat/${dm.id}`}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.75rem",
                                                        padding: "0.5rem 1rem",
                                                        borderRadius: "0.5rem",
                                                        textDecoration: "none",
                                                        color: isActive ? "var(--primary)" : "var(--foreground)",
                                                        background: isActive ? "var(--accent)" : "transparent",
                                                        fontWeight: isActive ? 600 : 400,
                                                        transition: "all 0.2s"
                                                    }}
                                                >
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                                        {dm.displayName?.[0] || 'U'}
                                                    </div>
                                                    <span>{dm.displayName}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Rooms Section */}
                            <div>
                                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Study Rooms</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                    {rooms.map(room => {
                                        const isActive = pathname === `/chat/${room.id}`;
                                        return (
                                            <Link
                                                key={room.id}
                                                href={`/chat/${room.id}`}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.75rem",
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "0.5rem",
                                                    textDecoration: "none",
                                                    color: isActive ? "var(--primary)" : "var(--foreground)",
                                                    background: isActive ? "var(--accent)" : "transparent",
                                                    fontWeight: isActive ? 600 : 400,
                                                    transition: "all 0.2s"
                                                }}
                                            >
                                                <Hash size={18} />
                                                <span>{room.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={`chat-main ${!isChatActive ? 'hidden-mobile' : ''}`}>
                {children}
            </main>
        </div>
    );
}
