"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { Send, ArrowLeft, Loader2, Trash2 } from "lucide-react";
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
            try {
                const { data: roomData, error: roomError } = await supabase
                    .from("chat_rooms")
                    .select("*")
                    .eq("id", params.roomId)
                    .single();

                if (roomError) throw roomError;

                if (roomData) {
                    setRoom(roomData);
                } else {
                    console.error("Room not found");
                    return;
                }

                // Initial Message Load
                const { data: msgs, error: msgError } = await supabase
                    .from("chat_messages")
                    .select("*")
                    .eq("room_id", params.roomId)
                    .order("created_at", { ascending: true });

                if (msgError) throw msgError;
                setMessages(msgs || []);

            } catch (error) {
                console.error("Error fetching room data:", error);
            }
            setLoading(false);
        };

        fetchData();

        // Realtime Subscription for Messages
        const channel = supabase
            .channel(`room:${params.roomId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${params.roomId}`
                },
                (payload) => {
                    const newMsg = payload.new;
                    const eventType = payload.eventType;

                    if (eventType === 'INSERT') {
                        setMessages(prev => {
                            // Avoid duplicates if optimistic update already added it (check content/user or better yet, handling logic in send)
                            // Since we replace the optimistic ID in handleSendMessage, we just need to avoid adding if ID exists.
                            if (prev.find(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    } else if (eventType === 'DELETE') {
                        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [params.roomId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const content = newMessage.trim();
        const optimisticId = Date.now().toString(); // temporary ID
        setNewMessage(""); // Clear input immediately

        // 1. Optimistic Update (Show immediately)
        const optimisticMsg = {
            id: optimisticId, // Temp ID
            room_id: params.roomId,
            user_id: user.id,
            user_name: user.full_name || user.email || 'You',
            role: user.role || 'student',
            content: content,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { data, error } = await supabase
                .from("chat_messages")
                .insert([{
                    room_id: params.roomId,
                    user_id: user.id,
                    user_name: user.full_name || user.email || 'Anonymous',
                    role: user.role || 'student',
                    content: content,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            // Replace optimistic message with real one (if needed, but subscription handles 'INSERT' usually)
            // We just let the subscription or next fetch normalize it. 
            // Ideally, we replace the temp ID with the real ID to allow deletion.
            setMessages(prev => prev.map(m => m.id === optimisticId ? data : m));

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
            // Rollback on error
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // ID of msg to delete

    // ... (rest of code) ...

    const handleDeleteClick = (msgId) => {
        setShowDeleteConfirm(msgId);
    };

    const confirmDelete = async () => {
        if (!showDeleteConfirm) return;
        const msgId = showDeleteConfirm;
        setShowDeleteConfirm(null);

        // Optimistic Delete
        setMessages(prev => prev.filter(m => m.id !== msgId));

        // If ID is numeric (optimistic), don't call server
        if (!isNaN(msgId) && !msgId.includes('-')) {
            console.log("Deleted optimistic message locally:", msgId);
            return;
        }

        try {
            const { error } = await supabase
                .from("chat_messages")
                .delete()
                .eq("id", msgId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting message:", error);
            alert("Failed to delete message from server."); // Fallback
        }
    };

    const cancelDelete = () => setShowDeleteConfirm(null);

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
                <Link href="/chat" style={{ color: "#0f172a" }}> {/* Fixed Color */}
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>{room.name}</h1> {/* Fixed Color */}
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{room.subject} • Live</span> {/* Fixed Color */}
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
                                    onClick={() => handleDeleteClick(msg.id)}
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


            {/* Custom Delete Confirmation Modal */}
            {
                showDeleteConfirm && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 100
                    }}>
                        <div style={{
                            background: 'white', padding: '1.5rem', borderRadius: '1rem',
                            maxWidth: '300px', width: '90%', boxShadow: 'var(--shadow-xl)',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>Delete Message?</h3>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button
                                    onClick={cancelDelete}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
                                        background: 'white', color: '#64748b', cursor: 'pointer', fontWeight: 500
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
                                        background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 500
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
