"use client";

import { useEffect, useState, useRef, use } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { Send, ArrowLeft } from "lucide-react";
import Loader from "../../components/ui/Loader";
import Link from "next/link";
import UserAvatar from "../../components/ui/UserAvatar";

export default function DirectMessageChat(props) {
    const params = use(props.params);
    const { user } = useAuth();
    const [recipient, setRecipient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchRecipient = async () => {
            const { data } = await supabase.from("profiles").select("*").eq("id", params.userId).single();
            setRecipient(data);
        };

        const fetchMessages = async () => {
            const { data } = await supabase
                .from("direct_messages")
                .select("*")
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${params.userId}),and(sender_id.eq.${params.userId},receiver_id.eq.${user.id})`)
                .order("created_at", { ascending: true });

            setMessages(data || []);
            setLoading(false);

            // Mark as read
            await supabase
                .from("direct_messages")
                .update({ is_read: true })
                .eq("sender_id", params.userId)
                .eq("receiver_id", user.id);
        };

        if (user && params.userId) {
            fetchRecipient();
            fetchMessages();

            const channel = supabase
                .channel(`dm:${user.id}-${params.userId}`)
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'direct_messages' },
                    (payload) => {
                        const newMsg = payload.new;
                        // Check if message belongs to this conversation
                        if (
                            (newMsg.sender_id === user.id && newMsg.receiver_id === params.userId) ||
                            (newMsg.sender_id === params.userId && newMsg.receiver_id === user.id)
                        ) {
                            setMessages(prev => [...prev, newMsg]);
                            if (newMsg.sender_id === params.userId) {
                                // Mark as read instantly if looking at chat
                                supabase.from("direct_messages").update({ is_read: true }).eq("id", newMsg.id).then();
                            }
                        }
                    }
                )
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [user, params.userId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage.trim();
        setNewMessage("");

        const { error } = await supabase.from("direct_messages").insert([{
            sender_id: user.id,
            receiver_id: params.userId,
            content
        }]);

        if (error) {
            alert("Failed to send");
            console.error(error);
        }
    };

    if (loading) return <div className="flex justify-center h-screen items-center"><Loader /></div>;
    if (!recipient) return <div className="p-10 text-center">User not found</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc" }}>
            {/* Header */}
            <header style={{
                padding: "1rem 2rem", background: "white", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: "1rem", position: "sticky", top: 0, zIndex: 10
            }}>
                <Link href="/messages" style={{ color: "#0f172a" }}>
                    <ArrowLeft size={20} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserAvatar user={recipient} size="36px" />
                    <div>
                        <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>{recipient.full_name}</h1>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "capitalize" }}>{recipient.role}</span>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {messages.map(msg => {
                    const isOwn = msg.sender_id === user.id;
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isOwn ? "flex-end" : "flex-start",
                            maxWidth: "70%",
                            display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start"
                        }}>
                            <div style={{
                                padding: "0.75rem 1rem",
                                borderRadius: isOwn ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0",
                                background: isOwn ? "var(--primary)" : "white",
                                color: isOwn ? "white" : "#0f172a",
                                boxShadow: "var(--shadow-sm)",
                                border: isOwn ? "none" : "1px solid var(--border)",
                                position: 'relative'
                            }}>
                                {msg.content}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isOwn && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm("Delete this message?")) return;
                                            setMessages(prev => prev.filter(m => m.id !== msg.id)); // Optimistic
                                            await supabase.from("direct_messages").delete().eq("id", msg.id);
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "1.5rem", background: "white", borderTop: "1px solid var(--border)" }}>
                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "1rem", maxWidth: "800px", margin: "0 auto" }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${recipient.full_name}...`}
                        style={{
                            flex: 1, padding: "0.75rem 1rem", borderRadius: "0.75rem",
                            border: "1px solid var(--border)", fontSize: "1rem", background: "var(--background)", color: "var(--foreground)"
                        }}
                    />
                    <button type="submit" style={{
                        width: "3.5rem", height: "3.5rem", borderRadius: "50%",
                        background: "var(--primary)", color: "white", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                    }}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
