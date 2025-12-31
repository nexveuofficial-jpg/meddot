"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { Send, ArrowLeft, Loader2, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ChatRoomPage(props) {
    const params = use(props.params);
    const { user } = useAuth();
    const router = useRouter();

    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial Fetch & Subscription
    useEffect(() => {
        if (!params?.roomId) return;

        const fetchData = async () => {
            // Fetch Room Details
            const { data: roomData, error: roomError } = await supabase
                .from('chat_rooms')
                .select('*')
                .eq('id', params.roomId)
                .single();

            if (roomError) {
                console.error(roomError);
                return;
            }
            setRoom(roomData);

            // Fetch Recent Messages
            const { data: msgs, error: msgError } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', params.roomId)
                .order('created_at', { ascending: true })
                .limit(50);

            if (msgError) console.error(msgError);
            else setMessages(msgs || []);

            setLoading(false);
        };

        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel(`room_${params.roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${params.roomId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${params.roomId}`
            }, (payload) => {
                setMessages(prev => prev.filter(m => m.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [params]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const content = newMessage.trim();
        setNewMessage(""); // Optimistic clear

        // Optimistic UI update could go here, but realtime is fast enough usually

        const { error } = await supabase.from('chat_messages').insert({
            room_id: params.roomId,
            user_id: user.id,
            user_name: user.full_name || 'Anonymous',
            role: user.role || 'student',
            content: content
        });

        if (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
        }
    };

    const handleDelete = async (msgId) => {
        if (!confirm("Delete this message?")) return;
        await supabase.from('chat_messages').delete().eq('id', msgId);
    };

    if (loading) return <div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin" /></div>;
    if (!room) return <div className="p-10 text-center">Room not found</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc" }}>
            {/* Header */}
            <header style={{
                padding: "1rem 2rem",
                background: "white",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                position: "sticky",
                top: 0,
                zIndex: 10
            }}>
                <Link href="/chat" style={{ color: "var(--muted-foreground)" }}>
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{room.name}</h1>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{room.subject} • Live</span>
                </div>
            </header>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "var(--muted-foreground)", marginTop: "auto", marginBottom: "auto" }}>
                        <p>Welcome to {room.name}!</p>
                        <p style={{ fontSize: "0.9rem" }}>Start the conversation...</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isOwn = msg.user_id === user?.id;
                    const isAdmin = msg.role === 'admin';
                    const isSenior = msg.role === 'senior';

                    return (
                        <div key={msg.id} style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isOwn ? "flex-end" : "flex-start",
                            maxWidth: "70%",
                            alignSelf: isOwn ? "flex-end" : "flex-start"
                        }}>
                            {!isOwn && (
                                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "0.25rem", marginLeft: "0.5rem" }}>
                                    {msg.user_name}
                                    {isAdmin && <span style={{ marginLeft: "4px", color: "#dc2626", fontWeight: 600 }}>[ADMIN]</span>}
                                    {isSenior && <span style={{ marginLeft: "4px", color: "#2563eb", fontWeight: 600 }}>[SENIOR]</span>}
                                </span>
                            )}
                            <div style={{
                                padding: "0.75rem 1rem",
                                borderRadius: isOwn ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0",
                                background: isOwn ? "var(--primary)" : "var(--card-bg)",
                                color: isOwn ? "var(--primary-foreground)" : "var(--text-primary)",
                                boxShadow: isOwn ? "var(--shadow-md)" : "var(--shadow-sm)",
                                border: isOwn ? "none" : "1px solid var(--border)",
                                position: "relative",
                                wordBreak: "break-word",
                                fontWeight: 500
                            }}>
                                {msg.content}
                            </div>
                            {isOwn && (
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    style={{
                                        fontSize: "0.7rem",
                                        color: "var(--muted-foreground)",
                                        border: "none",
                                        background: "none",
                                        cursor: "pointer",
                                        marginTop: "0.25rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem"
                                    }}
                                >
                                    <Trash2 size={10} /> Delete
                                </button>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "1.5rem", background: "white", borderTop: "1px solid var(--border)" }}>
                {user ? (
                    <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "1rem", maxWidth: "1200px", margin: "0 auto" }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message #${room.name}...`}
                            style={{
                                flex: 1,
                                padding: "0.75rem 1rem",
                                borderRadius: "0.75rem",
                                border: "1px solid var(--border)",
                                fontSize: "1rem",
                                background: "var(--background)",
                                color: "var(--foreground)"
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                width: "3.5rem",
                                height: "3.5rem",
                                borderRadius: "50%",
                                background: "var(--primary)",
                                color: "white",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "var(--shadow-md)"
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Login</Link> to join the chat.
                    </div>
                )}
            </div>
        </div>
    );
}
