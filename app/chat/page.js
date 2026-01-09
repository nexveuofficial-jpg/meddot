"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { MessageCircle, Activity, Bone, FlaskConical, Microscope, Pill, Coffee, Hash, ArrowRight } from "lucide-react";
import Loader from "../components/ui/Loader";
import RevealOnScroll from "../components/ui/RevealOnScroll";

// Mapping icons string to components
const iconMap = {
    'Activity': Activity,
    'Bone': Bone,
    'FlaskConical': FlaskConical,
    'Microscope': Microscope,
    'Pill': Pill,
    'Coffee': Coffee
};

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
                setRooms(data || []);
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
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <MessageCircle size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold">Chat is currently disabled.</h2>
                <Link href="/dashboard" className="text-cyan-400 hover:underline mt-2">Back to Dashboard</Link>
            </div>
        );
    }

    if (loading) return <div className="flex items-center justify-center h-full"><Loader /></div>;

    return (
        <div className="h-full overflow-y-auto p-6 md:p-10">
            <RevealOnScroll>
                <header className="mb-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        Live Community
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
                        Study Rooms
                    </h1>
                    <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
                        Join a room to discuss topics, ask quick questions, or coordinate study sessions with your batchmates.
                    </p>
                </header>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {rooms.map((room, index) => {
                    const Icon = iconMap[room.icon] || Hash;
                    return (
                        <RevealOnScroll key={room.id} delay={index * 50}>
                            <Link href={`/chat/${room.id}`}>
                                <div className="group relative p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                                    {/* Hover Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/20">
                                            <Icon size={24} />
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                                            {room.name}
                                        </h3>
                                        
                                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                            {room.description || "A space for medical students to discuss " + room.name}
                                        </p>

                                        <div className="mt-auto flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                                            Join Room <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </RevealOnScroll>
                    );
                })}
            </div>
        </div>
    );
}
