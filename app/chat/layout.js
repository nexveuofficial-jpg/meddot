"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { useRouter } from "next/navigation";
import { Hash, ArrowLeft, MessageSquare, User } from "lucide-react";
import Loader from "../components/ui/Loader";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import GlassCard from "../components/ui/GlassCard"; 

export default function ChatLayout({ children }) {
    const [rooms, setRooms] = useState([]);
    const [dms, setDms] = useState([]); 
    const [loading, setLoading] = useState(true);
    const { isEnabled, loading: flagsLoading } = useFeature();
    const { user } = useAuth(); 
    const pathname = usePathname();
    const router = useRouter();
    const isChatActive = pathname && pathname !== '/chat';

    // Search State Removed

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
                    .neq("type", "dm") 
                    .order("name", { ascending: true });

                setRooms(publicRooms || []);

                // 2. Fetch My DMs (if logged in)
                if (user) {
                    const { data: myDms } = await supabase
                        .from("chat_rooms")
                        .select("*")
                        .eq("type", "dm")
                        .contains("participants", [user.id]);

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
                                displayName: profile ? (profile.full_name || profile.username) : 'Unknown User'
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
    }, [isEnabled, flagsLoading, user?.id]); // Fix: fetching depends on ID, not full user object to prevent flickers

    if (flagsLoading) return <div className="flex h-screen items-center justify-center bg-[#0B1120]"><Loader /></div>;

    if (!isEnabled('enable_chat')) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#0B1120] text-slate-400">
                <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/5 text-center">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold text-white mb-2">Chat Disabled</h2>
                    <p className="mb-4">Chat is currently disabled by the administrator.</p>
                    <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] bg-[#0B1120] overflow-hidden">
            {/* Sidebar */}
            {/* Hidden on mobile if chat is active, otherwise shown. Always shown on Desktop. */}
            <aside 
                className={`
                    w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0F1623]/50 backdrop-blur-xl z-20
                    ${isChatActive ? 'hidden md:flex' : 'flex'}
                `}
            >

                <div className="p-6 border-b border-white/5">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-6">
                        <ArrowLeft size={16} /> Back
                    </Link>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Study Groups</h2>
                        <Link href="/chat" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <Hash size={18} />
                        </Link>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader size={24} /></div>
                    ) : (
                        <>
                            {/* DMs Section */}
                            {user && dms.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Direct Messages</h3>
                                    <div className="space-y-1">
                                        {dms.map(room => (
                                            <Link 
                                                key={room.id} 
                                                href={`/chat/${room.id}`}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                                                    ${pathname === `/chat/${room.id}` ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'}
                                                `}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-800 group-hover:bg-slate-700 transition-colors ${pathname === `/chat/${room.id}` ? 'bg-cyan-500/20 text-cyan-400' : ''}`}>
                                                    <User size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm font-bold truncate ${pathname === `/chat/${room.id}` ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>
                                                        {room.displayName}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Public Rooms Section */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Study Rooms</h3>
                                <div className="space-y-1">
                                    {rooms.map(room => (
                                        <Link 
                                            key={room.id} 
                                            href={`/chat/${room.id}`}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                                                ${pathname === `/chat/${room.id}` ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'}
                                            `}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-800 group-hover:bg-slate-700 transition-colors ${pathname === `/chat/${room.id}` ? 'bg-cyan-500/20 text-cyan-400' : ''}`}>
                                                <Hash size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-bold truncate ${pathname === `/chat/${room.id}` ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>
                                                    {room.name}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                {/* User Status Bar (Optional Polish) */}
                {user && (
                    <div className="p-4 border-t border-white/5 bg-[#0F1623]/80 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold border border-cyan-500/30">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate">
                                    {user.user_metadata?.full_name || 'Student'}
                                </div>
                                <div className="text-[10px] text-green-400 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content Area - Expands to fill remaining width */}
            <main className={`flex-1 relative h-full overflow-hidden ${!isChatActive ? 'hidden md:block' : 'block'}`}>
                {children}
            </main>
        </div>
    );
}
