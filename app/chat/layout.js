"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { Hash, ArrowLeft } from "lucide-react";
import Loader from "../components/ui/Loader";
import { usePathname } from "next/navigation";

export default function ChatLayout({ children }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isEnabled, loading: flagsLoading } = useFeature();
    const pathname = usePathname();

    useEffect(() => {
        const fetchRooms = async () => {
            // ... existing fetch logic ...
            try {
                const { data, error } = await supabase
                    .from("chat_rooms")
                    .select("*")
                    .eq("is_active", true)
                    .order("name", { ascending: true });

                if (error) {
                    console.error("Error fetching rooms:", error);
                } else {
                    setRooms(data || []);
                }
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        if (!flagsLoading && isEnabled('enable_chat')) {
            fetchRooms();
        }
    }, [isEnabled, flagsLoading]);

    if (flagsLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader /></div>;
    }

    if (!isEnabled('enable_chat')) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Chat Unavailable</h1>
                <p>Chat features are currently disabled.</p>
                <Link href="/dashboard" style={{ marginTop: '2rem', display: 'inline-block', color: 'var(--primary)' }}>Back to Dashboard</Link>
            </div>
        );
    }

    const isChatActive = pathname && pathname.includes('/chat/') && pathname !== '/chat';

    return (
        <div style={{ display: "flex", height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
            {/* Sidebar */}
            <aside className={`chat-sidebar ${isChatActive ? 'hidden-mobile' : ''}`}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '1rem' }}>
                        <ArrowLeft size={16} /> Back
                    </Link>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Chat Rooms</h2>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader size={20} /></div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
                                            padding: "0.75rem 1rem",
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
