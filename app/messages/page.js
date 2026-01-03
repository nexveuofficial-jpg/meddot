"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import Loader from "../components/ui/Loader";
import { MessageSquare, Search } from "lucide-react";

export default function MessagesInbox() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchConversations();

        // Subscribe to new DMs to update inbox
        const channel = supabase
            .channel('dm-inbox')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${user.id}` }, () => {
                fetchConversations();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `sender_id=eq.${user.id}` }, () => {
                fetchConversations();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    const fetchConversations = async () => {
        try {
            // Get unique users interacted with
            // Since Supabase doesn't support complex distinct on multiple columns easily, we fetch latest messages
            const { data, error } = await supabase
                .from("direct_messages")
                .select("*, sender:profiles!sender_id(id, full_name, email, role), receiver:profiles!receiver_id(id, full_name, email, role)")
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const convos = {};
            data.forEach(msg => {
                const partner = msg.sender_id === user.id ? msg.receiver : msg.sender;
                if (!partner) return; // Should not happen
                if (!convos[partner.id]) {
                    convos[partner.id] = {
                        partner,
                        lastMessage: msg,
                        unreadCount: (!msg.is_read && msg.receiver_id === user.id) ? 1 : 0
                    };
                } else {
                    if (!msg.is_read && msg.receiver_id === user.id) {
                        convos[partner.id].unreadCount++;
                    }
                }
            });

            setConversations(Object.values(convos));

        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleSearch = async (term) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .ilike('full_name', `%${term}%`)
            .limit(5);

        // Filter out self
        const filtered = (data || []).filter(p => p.id !== user?.id);
        setSearchResults(filtered);
        setSearching(false);
    };

    if (loading) return <div className="flex justify-center p-20"><Loader /></div>;

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", background: "var(--background)", minHeight: "100vh" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem" }}>Messages</h1>

            {/* User Search */}
            <div style={{ marginBottom: "2rem", position: "relative" }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <Search size={20} className="text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search users to chat with..."
                        value={searchTerm}
                        onChange={e => handleSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--foreground)' }}
                    />
                </div>
                {searchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '0.75rem', marginTop: '0.5rem', boxShadow: 'var(--shadow-lg)', zIndex: 10 }}>
                        {searchResults.map(p => (
                            <Link key={p.id} href={`/messages/${p.id}`} style={{ display: 'block', padding: '1rem', textDecoration: 'none', color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{p.role}</div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Conversation List */}
            <div style={{ display: "grid", gap: "1rem" }}>
                {conversations.length === 0 && !searchTerm ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted-foreground)" }}>
                        <MessageSquare size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                        <p>No messages yet.</p>
                        <p style={{ fontSize: "0.9rem" }}>Search for a user above to start chatting.</p>
                    </div>
                ) : (
                    conversations.map(({ partner, lastMessage, unreadCount }) => (
                        <Link key={partner.id} href={`/messages/${partner.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: "var(--card-bg)",
                                padding: "1.25rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--card-border)",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                transition: "all 0.2s"
                            }} className="hover:shadow-md hover:border-blue-300">
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "50%",
                                    background: "var(--accent)", color: "var(--primary)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, fontSize: "1.2rem"
                                }}>
                                    {partner.full_name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                        <h3 style={{ fontWeight: 600, color: "var(--foreground)" }}>{partner.full_name}</h3>
                                        <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                            {new Date(lastMessage.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{
                                        color: unreadCount > 0 ? "var(--foreground)" : "var(--muted-foreground)",
                                        fontWeight: unreadCount > 0 ? 600 : 400,
                                        fontSize: "0.95rem",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px"
                                    }}>
                                        {lastMessage.sender_id === user.id ? 'You: ' : ''}{lastMessage.content}
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <div style={{ background: "var(--primary)", color: "white", borderRadius: "99px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
                                        {unreadCount}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
