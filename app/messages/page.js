"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import Loader from "@/app/components/ui/Loader";
import { MessageCircle, Search, User, Shield, Award } from "lucide-react";
import UserAvatar from "@/app/components/ui/UserAvatar";
import ProfileCard from "@/app/components/profile/ProfileCard";
import GlassButton from "@/app/components/ui/GlassButton";

export default function InboxPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
             // 1. Fetch Conversations (DMs)
            const { data: rooms, error: roomsError } = await supabase
                .from("chat_rooms")
                .select("*")
                .eq("type", "dm")
                .contains("participants", [user.id])
                .neq("last_message_at", null) 
                .order("last_message_at", { ascending: false });

            if (!roomsError && rooms) {
                 const enriched = await Promise.all(rooms.map(async (room) => {
                     const otherId = room.participants.find(id => id !== user.id);
                     const { data: profile } = await supabase.from('profiles').select('*').eq('id', otherId).single();
                     return { ...room, partner: profile };
                 }));
                 setConversations(enriched);
            }

            setLoading(false);
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0F1623]"><Loader /></div>;

    return (
        <div className="min-h-screen bg-[#0F1623] p-6 pb-20 md:pl-80"> 
             {/* Note: The main layout padding might need adjustment, assuming this renders in the main slot */}
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-6">Messages</h1>
                        <p className="text-slate-400">Manage your direct messages.</p>
                    </div>
                </div>

                {/* Conversations Section */}
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageCircle className="text-indigo-400" size={20} />
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Your Conversations</h2>
                    </div>

                    <div className="grid gap-4">
                        {conversations.length > 0 ? (
                            conversations.map(convo => (
                                <Link href={`/messages/room/${convo.id}`} key={convo.id}>
                                    <div className="group bg-[#151e2e]/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 hover:border-cyan-500/30 transition-all cursor-pointer">
                                        <UserAvatar user={convo.partner} size="56px" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-white font-bold group-hover:text-cyan-400 transition-colors truncate">
                                                    {convo.partner?.full_name}
                                                </h3>
                                                <span className="text-xs text-slate-500">
                                                    {convo.last_message_at ? new Date(convo.last_message_at).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm truncate">
                                                Click to continue chatting...
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all">
                                            <MessageCircle size={16} />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
                                <MessageCircle size={48} className="mx-auto text-slate-700 mb-4" />
                                <h3 className="text-slate-300 font-bold mb-2">No messages yet</h3>
                                <p className="text-slate-500">Visit a profile to start a conversation!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
