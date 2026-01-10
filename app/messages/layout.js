"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Search } from "lucide-react"; // Imported Search
import Loader from "@/app/components/ui/Loader";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function MessagesLayout({ children }) {
    const [dms, setDms] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // Added search state
    const { user, loading: authLoading } = useAuth(); 
    const pathname = usePathname();
    const router = useRouter();
    // In messages implementation, any sub-route means chat is active
    const isChatActive = pathname && pathname !== '/messages';

    useEffect(() => {
        const fetchDms = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data: myDms } = await supabase
                    .from("chat_rooms")
                    .select("*")
                    .eq("type", "dm")
                    .contains("participants", [user.id])
                    .order("last_message_at", { ascending: false });

                if (myDms && myDms.length > 0) {
                    const enrichedDms = await Promise.all(myDms.map(async (dm) => {
                        const otherUserId = dm.participants.find(id => id !== user.id);
                        if (!otherUserId) return { ...dm, displayName: 'Me' };

                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('username, full_name, avatar_url') // Added avatar_url fetch
                            .eq('id', otherUserId)
                            .single();

                        return {
                            ...dm,
                            displayName: profile ? (profile.full_name || profile.username) : 'Unknown User',
                            avatar_url: profile?.avatar_url
                        };
                    }));
                    setDms(enrichedDms);
                } else {
                    setDms([]);
                }
            } catch (error) {
                console.error("Error fetching DMs:", error);
            }
            setLoading(false);
        };

        if (!authLoading) {
            fetchDms();
        }
    }, [user, authLoading]);

    // Filter DMs based on search term
    const filteredDms = dms.filter(dm => 
        dm.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading) return <div className="flex h-screen items-center justify-center bg-[#0B1120]"><Loader /></div>;

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
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Messages</h2>
                    </div>

                    {/* Search Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search conversations..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#151e2e] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader size={24} /></div>
                    ) : (
                        <div>
                             {dms.length === 0 && (
                                <div className="text-center text-slate-500 py-10 px-4">
                                    <p>No messages yet.</p>
                                    <p className="text-xs mt-2">Visit a profile to start a conversation.</p>
                                </div>
                             )}

                             {/* Render Filtered DMs */}
                            <div className="space-y-1">
                                {filteredDms.map(room => (
                                    <Link 
                                        key={room.id} 
                                        href={`/messages/room/${room.id}`}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                                            ${pathname === `/messages/room/${room.id}` ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'}
                                        `}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-800 group-hover:bg-slate-700 transition-colors overflow-hidden ${pathname === `/messages/room/${room.id}` ? 'bg-cyan-500/20 text-cyan-400' : ''}`}>
                                            {room.avatar_url ? (
                                                <img src={room.avatar_url} alt={room.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-bold truncate ${pathname === `/messages/room/${room.id}` ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>
                                                {room.displayName}
                                            </div>
                                            {/* Optional: Show last message preview here if available in future */}
                                        </div>
                                    </Link>
                                ))}
                                {dms.length > 0 && filteredDms.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No conversations found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* User Status Bar */}
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

            {/* Main Content Area */}
            <main className={`flex-1 relative h-full overflow-hidden ${!isChatActive ? 'hidden md:block' : 'block'}`}>
                {!isChatActive && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <User size={32} opacity={0.5} />
                        </div>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
