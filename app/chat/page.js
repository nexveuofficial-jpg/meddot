"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { MessageCircle, Users, ArrowRight, Activity, Bone, FlaskConical, Microscope, Pill, Coffee } from "lucide-react";
import Loader from "../components/ui/Loader";

// Mapping icons string to components
const iconMap = {
    'Activity': Activity,
    'Bone': Bone,
    'FlaskConical': FlaskConical,
    'Microscope': Microscope,
    'Pill': Pill,
    'Coffee': Coffee
};

import styles from "./chat.module.css";

export default function ChatLobbyPage() {
    const { isEnabled } = useFeature();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const { data, error } = await supabase
                    .from("chat_rooms")
                    .select("*")
                    .eq("is_active", true)
                    .order("name", { ascending: true });

                if (error) throw error;
                setRooms(data);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
            setLoading(false);
        };

        if (isEnabled('enable_chat')) {
            fetchRooms();
        }
    }, [isEnabled]);

    if (!isEnabled('enable_chat')) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Chat is currently disabled.</h2>
                <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Back to Dashboard</Link>
            </div>
        );
    }

    if (loading) return <div className="flex justify-center p-20"><Loader /></div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/dashboard" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontSize: "0.9rem", marginBottom: "0.5rem", display: "inline-block" }}>← Back</Link>
                <h1 className={styles.title}>
                    Study Rooms
                </h1>
                <p style={{ marginTop: "1rem", color: "var(--muted-foreground)", maxWidth: "500px" }}>
                    Join a room to discuss topics, ask quick questions, or just hang out.
                </p>
            </header>

            <div className={styles.grid}>
                {rooms.map((room) => {
                    const Icon = iconMap[room.icon] || MessageCircle;
                    return (
                        <Link key={room.id} href={`/chat/${room.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className={styles.card}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                                }}
                            >
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "var(--accent)",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "1.5rem",
                                    color: "var(--primary)"
                                }}>
                                    <Icon size={24} />
                                </div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0f172a" }}>{room.name}</h3>
                                <p style={{ color: "#475569", fontSize: "0.9rem", flex: 1, marginBottom: "1.5rem" }}>
                                    {room.description}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                                    <span>Join Room</span>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
