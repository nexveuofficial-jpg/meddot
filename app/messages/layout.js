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

    const [globalResults, setGlobalResults] = useState([]);
    const [searchingGlobal, setSearchingGlobal] = useState(false);

    // Filter DMs based on search term
    const filteredDms = dms.filter(dm => 
        dm.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Global Search Effect
    useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.trim().length === 0) {
                setGlobalResults([]);
                return;
            }
            
            setSearchingGlobal(true);
            try {
                // Search in profiles
                const { data: users, error } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
                    .neq('id', user?.id) // Exclude self
                    .limit(5);

                if (error) throw error;
                
                // Exclude users we already have DMs with from the "People" list to avoid duplicates?
                // Or keep them but maybe highlight? For now, we'll just show them in "People" too if they match, 
                // but the user might prefer to see them in "Conversations".
                // Let's filter out users who are already in 'dms' participants.
                
                const existingPartnerIds = new Set(dms.map(dm => {
                    return dm.participants.find(pid => pid !== user.id);
                }).filter(Boolean));

                const newPeople = users.filter(u => !existingPartnerIds.has(u.id));
                setGlobalResults(newPeople);

            } catch (err) {
                console.error("Global search error:", err);
            } finally {
                setSearchingGlobal(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (user) searchUsers();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, user, dms]);

    const handleStartChat = async (otherUserId) => {
        try {
            const { data: roomId, error } = await supabase.rpc('get_or_create_dm_room', { 
                other_user_id: otherUserId 
            });

            if (error) throw error;
            router.push(`/messages/room/${roomId}`);
            setSearchTerm(""); // Clear search on selection
        } catch (error) {
            console.error("Error creating DM:", error);
            alert("Failed to start chat.");
        }
    };

    if (authLoading) return <div className="flex h-screen items-center justify-center bg-[#0B1120]"><Loader /></div>;

    return (
        <div className="flex h-[100dvh] bg-[#0B1120] overflow-hidden">
            {/* Sidebar */}
            {/* Hidden on mobile if chat is active, otherwise shown. Always shown on Desktop. */}
            {/* Sidebar */}
            {/* Hidden on mobile if chat is active, otherwise shown. Always shown on Desktop. */}
            <aside 
                className={`
                    w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-cyan-500/10 bg-[#0F1623]/95 backdrop-blur-sm z-20 h-[100dvh]
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
                            placeholder="Search people & conversations..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#151e2e] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader size={24} /></div>
                    ) : (
                        <div>
                             {dms.length === 0 && searchTerm.length === 0 && (
                                <div className="text-center text-slate-500 py-10 px-4">
                                    <p>No messages yet.</p>
                                    <p className="text-xs mt-2">Search above to find people.</p>
                                </div>
                             )}

                             {/* Active Conversations */}
                             {filteredDms.length > 0 && (
                                <div className="space-y-1 mb-6">
                                    {searchTerm.length > 0 && (
                                        <h3 className="text-xs font-bold text-slate-500 px-2 mb-2 uppercase tracking-wider">Conversations</h3>
                                    )}
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
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                             )}

                             {/* Global People Results */}
                             {searchTerm.length > 0 && (
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold text-slate-500 px-2 mb-2 uppercase tracking-wider">
                                        {searchingGlobal ? 'Searching People...' : 'People'}
                                    </h3>
                                    {globalResults.map(person => (
                                        <button 
                                            key={person.id} 
                                            onClick={() => handleStartChat(person.id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-cyan-500/20 transition-all duration-200 group text-left"
                                        >
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-800 group-hover:bg-slate-700 transition-colors overflow-hidden">
                                                {person.avatar_url ? (
                                                    <img src={person.avatar_url} alt={person.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={18} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-200 group-hover:text-white truncate">
                                                    {person.full_name || person.username}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">
                                                    @{person.username}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {!searchingGlobal && globalResults.length === 0 && filteredDms.length === 0 && (
                                        <div className="text-center py-8 text-slate-500 text-sm">
                                            No matched found.
                                        </div>
                                    )}
                                </div>
                             )}
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
                {children}
            </main>
        </div>
    );
}
