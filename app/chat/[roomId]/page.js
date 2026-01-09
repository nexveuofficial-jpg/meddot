"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { ArrowLeft, MoreVertical, Search } from "lucide-react"; // Added MoreVertical, Search for header visuals
import Loader from "../../components/ui/Loader";
import Link from "next/link";
import UserProfileModal from "@/app/components/UserProfileModal";
import ToastContainer from "@/app/components/ui/Toast";

// New Components
import MessageBubble from "@/app/components/chat/MessageBubble";
import ChatInput from "@/app/components/chat/ChatInput";
import ContextMenu from "@/app/components/chat/ContextMenu";

// Styles
import "@/app/chat/telegram.css";

export default function ChatRoomPage(props) {
    const params = use(props.params);
    const { user, profile, isAdmin, isSenior } = useAuth();
    const router = useRouter();

    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const lastMessageTime = useRef(0);
    const [toasts, setToasts] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [onlineCount, setOnlineCount] = useState(0);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState(null); // { x, y, message }

    // Reply & Edit State
    const [replyTo, setReplyTo] = useState(null); // Message object
    const [editingMessage, setEditingMessage] = useState(null); // Message object to edit
    const [viewedImage, setViewedImage] = useState(null); // Image Modal URL

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Scroll helpers
    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (messages.length > 0) scrollToBottom("smooth");
    }, [messages.length]); // Scroll on new count

    // Fetch Data
    useEffect(() => {
        if (!params?.roomId) return;

        const fetchData = async () => {
            if (!supabase) {
                console.error("Supabase client not initialized (missing env vars)");
                addToast("Database connection missing", "error");
                setLoading(false);
                return;
            }

            try {
                // Room
                const { data: roomData, error: roomError } = await supabase
                    .from("chat_rooms")
                    .select("*")
                    .eq("id", params.roomId)
                    .single();

                if (roomError) throw roomError;

                // If DM, fetch friend's name
                if (roomData.type === 'dm' && user) {
                    const friendId = roomData.participants.find(id => id !== user.id);
                    if (friendId) {
                        const { data: friendProfile } = await supabase
                            .from('profiles')
                            .select('username, full_name, avatar_url')
                            .eq('id', friendId)
                            .single();

                        if (friendProfile) {
                            roomData.name = friendProfile.full_name || friendProfile.username;
                            roomData.image = friendProfile.avatar_url;
                            roomData.friendId = friendId; // Store for profile click
                        }
                    }
                }

                setRoom(roomData);

                // Messages
                const { data: msgs, error: msgError } = await supabase
                    .from("chat_messages")
                    .select("*, image_url, profiles(username, full_name, email, role, year_of_study)")
                    .eq("room_id", params.roomId)
                    .order("created_at", { ascending: true });

                if (msgError) throw msgError;
                
                // Map profile data to message structure for consistency
                const mappedMsgs = (msgs || []).map(m => {
                     const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                     return {
                         ...m,
                         user_name: p?.username || p?.full_name || (p?.email?.split('@')[0]) || m.user_name || 'Anonymous',
                         author_year: p?.year_of_study,
                         role: p?.role || m.role
                     };
                });
                
                setMessages(mappedMsgs);

            } catch (error) {
                console.error("Error fetching room/messages:", error);
            }
            setLoading(false);
        };

        fetchData();

        // Realtime
        if (!supabase) return;

        const channel = supabase
            .channel(`room:${params.roomId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${params.roomId}` },
                (payload) => {
                    const eventType = payload.eventType;
                    if (eventType === 'INSERT') {
                        setMessages(prev => {
                            // Deduplicate: Check if message exists
                            if (prev.find(m => m.id === payload.new.id)) return prev;

                            // Optimistic Replacement for Own Messages
                            // If we find a message with same content from same user that has a timestamp-like ID, replace it.
                            if (payload.new.user_id === user.id) {
                                const optimisticMatch = prev.find(m =>
                                    m.user_id === user.id &&
                                    m.content === payload.new.content &&
                                    (m.id.length < 20) // Heuristic: Timestamp (13 chars) vs UUID (36 chars)
                                );
                                if (optimisticMatch) {
                                    return prev.map(m => m.id === optimisticMatch.id ? payload.new : m);
                                }
                            }

                            return [...prev, payload.new];
                        });
                    } else if (eventType === 'DELETE') {
                        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
                    } else if (eventType === 'UPDATE') {
                        setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
                    }
                }
            )
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                setOnlineCount(Object.keys(newState).length);
            })
            .subscribe(async (status, err) => {
                if (status === 'SUBSCRIBED' && user) {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('Realtime connection error:', err);
                    addToast("Could not connect to chat server.", "error");
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [params.roomId, user]);

    // Send Message
    const handleSendMessage = async (text, file = null) => {
        if (!user) return;

        // Rate Limit (Student)
        const isStaff = user.role === 'admin' || user.role === 'senior';
        if (!isStaff && room?.type !== 'dm') {
            const now = Date.now();
            if (now - lastMessageTime.current < 9000) {
                addToast(`Please wait few seconds.`, 'warning');
                return;
            }
            lastMessageTime.current = now;
        }

        if (!supabase) {
            addToast("Chat unavailable (Database error)", "error");
            return;
        }

        const optimisticId = Date.now().toString();

        if (editingMessage && !file) {
            // Handle Edit (Text only)
            const updatedContent = text;
            setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content: updatedContent, is_edited: true } : m));
            setEditingMessage(null); // Exit edit mode

            try {
                const { error } = await supabase
                    .from("chat_messages")
                    .update({ content: updatedContent, is_edited: true })
                    .eq("id", editingMessage.id);

                if (error) throw error;
            } catch (error) {
                console.error("Edit Error:", error);
                addToast("Failed to edit.", "error");
            }
            return;
        }

        // Prepare Optimistic Message
        const newMessageObj = {
            id: optimisticId,
            room_id: params.roomId,
            user_id: user.id,
            user_name: profile?.username || profile?.full_name || user.email || 'You',
            role: profile?.role || user.role || 'student',
            author_year: profile?.year_of_study,
            content: text || (file ? ' Sent an image' : ''),
            image_url: file ? URL.createObjectURL(file) : null, // Optimistic preview
            created_at: new Date().toISOString(),
            reply_to_id: replyTo ? replyTo.id : null,
            reply_to: replyTo ? { id: replyTo.id, user_name: replyTo.user_name, content: replyTo.content } : null
        };

        setMessages(prev => [...prev, newMessageObj]);
        setReplyTo(null);

        try {
            let publicUrl = null;

            if (file) {
                // Upload Image
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${params.roomId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('chat-uploads')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    // Create bucket if it doesn't exist (Handling missing bucket error gracefully-ish)
                    if (uploadError.message.includes("Bucket not found")) {
                        addToast("Image upload failed: System storage not ready.", "error");
                        throw uploadError;
                    }
                    throw uploadError;
                }

                const { data: urlData } = supabase.storage
                    .from('chat-uploads')
                    .getPublicUrl(filePath);

                publicUrl = urlData.publicUrl;
            }

            const insertPayload = {
                room_id: params.roomId,
                user_id: user.id,
                user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
                role: user.role || 'student',
                content: text || (file ? 'Image' : ''),
                image_url: publicUrl,
                reply_to_id: replyTo ? replyTo.id : null
            };

            const { data, error } = await supabase
                .from("chat_messages")
                .insert([insertPayload])
                .select("*, image_url")
                .single();

            if (error) throw error;

            // Update optimistic with real data
            setMessages(prev => prev.map(m => m.id === optimisticId ? data : m));

        } catch (error) {
            console.error("Send Error:", error);
            addToast(`Failed to send: ${error.message || error.error_description || "Unknown error"}`, "error");
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
        }
    };

    // Actions
    const handleContextMenu = (e, msg) => {
        e.preventDefault();
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            message: msg
        });
    };

    const deleteMessage = async (msgId) => {
        setMessages(prev => prev.filter(m => m.id !== msgId)); // Optimistic
        if (!supabase) return;
        try {
            await supabase.from("chat_messages").delete().eq("id", msgId);
        } catch (err) {
            console.error("Delete failed", err);
            addToast("Delete failed", "error");
        }
    };

    // Direct Message Logic (from Context Menu)
    const handleDirectMessage = async (targetUserId) => {
        try {
            if (!user) return addToast("Please login first", "error");

            // Call our RPC function
            const { data: roomId, error } = await supabase.rpc('get_or_create_dm_room', {
                other_user_id: targetUserId
            });

            if (error) throw error;

            if (roomId) {
                router.push(`/chat/${roomId}`);
            }
        } catch (error) {
            console.error("DM Error:", error);
            addToast("Failed to start chat: " + (error.message || "Unknown error"), "error");
        }
    };

    // Prepare Context Menu Options
    const getMenuOptions = () => {
        if (!contextMenu) return [];
        const { message } = contextMenu;
        const isOwn = message.user_id === user?.id;
        const isAdmin = user?.role === 'admin' || user?.role === 'senior';

        const options = [
            {
                label: 'Reply',
                icon: <Search size={16} />, // Search icon as placeholder for reply or just Reply icon if available in imports
                action: () => setReplyTo(message)
            },
            {
                label: 'Copy',
                icon: <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />, // Placeholder
                action: () => navigator.clipboard.writeText(message.content)
            }
        ];

        if (!isOwn) {
            options.push({
                label: 'Message',
                icon: <div style={{ color: '#3b82f6' }}>💬</div>,
                action: () => handleDirectMessage(message.user_id)
            });
        }

        if (isOwn) {
            options.push({
                label: 'Edit',
                icon: <div style={{ color: '#0f172a' }}>✎</div>,
                action: () => setEditingMessage(message)
            });
        }

        if (isOwn || isAdmin) {
            options.push({
                label: 'Delete',
                icon: <div style={{ color: '#ef4444' }}>🗑️</div>,
                danger: true,
                action: () => deleteMessage(message.id)
            });
        }

        return options;
    };

    // Render helpers
    // Enhance messages with 'reply_to' object if missing (client-side join)
    const processedMessages = messages.map(m => {
        if (m.reply_to) return m; // Already has it (fetched or optimistic)
        if (m.reply_to_id) {
            const parent = messages.find(p => p.id === m.reply_to_id);
            if (parent) return { ...m, reply_to: parent };
        }
        return m;
    });

    // Grouping by Date
    const groupedMessages = [];
    let lastDate = null;
    processedMessages.forEach(msg => {
        const date = new Date(msg.created_at).toLocaleDateString();
        if (date !== lastDate) {
            groupedMessages.push({ type: 'date', date, id: `date-${date}` });
            lastDate = date;
        }
        groupedMessages.push({ type: 'msg', data: msg });
    });


    if (loading) return <div className="flex justify-center h-screen items-center"><Loader /></div>;
    if (!room) return <div className="p-10 text-center">Room not found</div>;

    return (
        <div className="telegram-container">
            {/* Header */}
            <header className="telegram-header glass">
                <Link href="/chat" style={{ color: "var(--foreground)", marginRight: '10px' }}>
                    <ArrowLeft size={22} />
                </Link>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSelectedUserId(room.friendId || room.created_by || null)}>
                    <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#000" }}>{room.name}</h1>
                    <span style={{ fontSize: "0.85rem", color: "#0ea5e9", fontWeight: 500 }}>
                        {room.type === 'dm' ? 'Direct Message' : `${onlineCount} members online`}
                    </span>
                </div>
                <Search size={22} color="#555" />
                <MoreVertical size={22} color="#555" />
            </header>

            {/* Chat Area */}
            <div className="chat-scroll-area">
                {groupedMessages.map(item => {
                    if (item.type === 'date') {
                        return (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'center' }}>
                                <div className="date-header">{item.date}</div>
                            </div>
                        );
                    }
                    const msg = item.data;
                    return (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={user && msg.user_id === user.id}
                            onContextMenu={handleContextMenu}
                            onReplyClick={(replyId) => {
                                const target = document.getElementById(`msg-${replyId}`); // Need to add id to bubble
                                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            onImageClick={(url) => setViewedImage(url)}
                            onUserClick={(uid) => setSelectedUserId(uid)}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* ... Input ... */}
            {/* Input */}
            <ChatInput
                onSend={handleSendMessage}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                editingMessage={editingMessage}
                onCancelEdit={() => setEditingMessage(null)}
                allowImages={isAdmin || isSenior}
            />

            {/* Context Menu Overlay */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={getMenuOptions()}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {/* Image Modal */}
            {viewedImage && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 100,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    flexDirection: 'column'
                }} onClick={() => setViewedImage(null)}>
                    <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 101 }}>
                        <button onClick={() => setViewedImage(null)} style={{ color: 'white', padding: '10px' }}>
                            {/* Close Icon manually or lucide */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <img
                        src={viewedImage}
                        style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', borderRadius: '4px' }}
                        onClick={(e) => e.stopPropagation()} // Click image shouldn't close? Actually clicking anywhere should likely close for ease roughly
                    />
                </div>
            )}

            {/* Modals */}
            <UserProfileModal userId={selectedUserId} isOpen={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
