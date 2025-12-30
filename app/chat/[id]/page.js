"use client";

import { useEffect, useState, use, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2, Send } from "lucide-react";

export default function ChatRoomPage(props) {
    const params = use(props.params);
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!params?.id) return;

        const fetchRoomData = async () => {
            // Fetch Room Info
            const { data: rData } = await supabase
                .from('chat_rooms')
                .select('*')
                .eq('id', params.id)
                .single();
            setRoom(rData);

            // Fetch Messages
            const { data: mData, error } = await supabase
                .from('chat_messages')
                .select('*, profiles(full_name, role)')
                .eq('room_id', params.id)
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) console.error(error);
            else setMessages(mData || []);
            setLoading(false);
        };

        fetchRoomData();

        // Subscription
        const channel = supabase
            .channel(`room_${params.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${params.id}`
            }, async (payload) => {
                // Fetch the new message with profile
                const { data } = await supabase
                    .from('chat_messages')
                    .select('*, profiles(full_name, role)')
                    .eq('id', payload.new.id)
                    .single();

                if (data) setMessages(prev => [...prev, data]);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);

    }, [params]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const content = newMessage.trim();
        setNewMessage(""); // Optimistic clear

        const { error } = await supabase.from('chat_messages').insert({
            room_id: params.id,
            user_id: user.id,
            content: content
        });

        if (error) {
            console.error("Failed to send", error);
            alert("Failed to send message per policy (Are you logged in?)");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'white' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>#{room?.name || 'Chat'}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{room?.description}</p>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                {messages.map((msg, i) => {
                    const isMe = msg.user_id === user?.id;
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}>
                            {!isMe && (
                                <span style={{ fontSize: '0.75rem', marginBottom: '2px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                    {msg.profiles?.full_name}
                                    {msg.profiles?.role !== 'student' && <span style={{ marginLeft: '4px', color: '#1e40af', background: '#dbeafe', padding: '1px 4px', borderRadius: '3px', fontSize: '0.65rem' }}>{msg.profiles?.role}</span>}
                                </span>
                            )}
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '1rem',
                                background: isMe ? 'var(--primary)' : 'white',
                                color: isMe ? 'white' : 'var(--foreground)',
                                border: isMe ? 'none' : '1px solid var(--border)',
                                boxShadow: isMe ? 'var(--shadow-sm)' : 'none',
                                borderBottomRightRadius: isMe ? '2px' : '1rem',
                                borderBottomLeftRadius: isMe ? '1rem' : '2px'
                            }}>
                                {msg.content}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '2px', opacity: 0.7 }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid var(--border)' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder={user ? `Message #${room?.name || 'chat'}` : "Login to chat"}
                        disabled={!user}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            outline: 'none',
                            background: user ? 'white' : 'var(--muted)'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!user || !newMessage.trim()}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0 1rem',
                            borderRadius: '0.75rem',
                            cursor: (!user || !newMessage.trim()) ? 'default' : 'pointer',
                            opacity: (!user || !newMessage.trim()) ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
