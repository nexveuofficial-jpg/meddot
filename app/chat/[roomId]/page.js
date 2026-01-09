"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { ArrowLeft, MoreVertical, Search, User } from "lucide-react";
import Loader from "../../components/ui/Loader";
import Link from "next/link";
import UserProfileModal from "@/app/components/UserProfileModal";
import ToastContainer from "@/app/components/ui/Toast";

// New Components
import MessageBubble from "@/app/components/chat/MessageBubble";
import ChatInput from "@/app/components/chat/ChatInput";
import ContextMenu from "@/app/components/chat/ContextMenu";

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
    const [contextMenu, setContextMenu] = useState(null);

    // Reply & Edit State
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [viewedImage, setViewedImage] = useState(null);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (messages.length > 0) scrollToBottom("smooth");
    }, [messages.length]);

    // Fetch Data
    useEffect(() => {
        if (!params?.roomId) return;

        const fetchData = async () => {
            if (!supabase) {
                console.error("Supabase client not initialized");
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

                // DM Logic
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
                            roomData.friendId = friendId;
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
                            if (prev.find(m => m.id === payload.new.id)) return prev;

                            if (payload.new.user_id === user.id) {
                                const optimisticMatch = prev.find(m =>
                                    m.user_id === user.id &&
                                    m.content === payload.new.content &&
                                    (m.id.length < 20)
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
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED' && user) {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [params.roomId, user]);

    // Send Message
    const handleSendMessage = async (text, file = null) => {
        if (!user) return;

        const isStaff = user.role === 'admin' || user.role === 'senior';
        if (!isStaff && room?.type !== 'dm') {
            const now = Date.now();
            if (now - lastMessageTime.current < 9000) {
                addToast("Please wait a few seconds before sending another message.", 'warning');
                return;
            }
            lastMessageTime.current = now;
        }

        const optimisticId = Date.now().toString();

        if (editingMessage && !file) {
            const updatedContent = text;
            setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content: updatedContent, is_edited: true } : m));
            setEditingMessage(null);
            try {
                await supabase.from("chat_messages").update({ content: updatedContent, is_edited: true }).eq("id", editingMessage.id);
            } catch (error) {
                addToast("Failed to edit.", "error");
            }
            return;
        }

        const newMessageObj = {
            id: optimisticId,
            room_id: params.roomId,
            user_id: user.id,
            user_name: profile?.username || profile?.full_name || user.email || 'You',
            role: profile?.role || user.role || 'student',
            author_year: profile?.year_of_study,
            content: text || (file ? ' Sent an image' : ''),
            image_url: file ? URL.createObjectURL(file) : null,
            created_at: new Date().toISOString(),
            reply_to_id: replyTo ? replyTo.id : null,
            reply_to: replyTo ? { id: replyTo.id, user_name: replyTo.user_name, content: replyTo.content } : null
        };

        setMessages(prev => [...prev, newMessageObj]);
        setReplyTo(null);

        try {
            let publicUrl = null;
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${params.roomId}/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('chat-uploads').upload(filePath, file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('chat-uploads').getPublicUrl(filePath);
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

            const { data, error } = await supabase.from("chat_messages").insert([insertPayload]).select("*, image_url").single();
            if (error) throw error;
            setMessages(prev => prev.map(m => m.id === optimisticId ? data : m));
        } catch (error) {
            console.error("Send Error:", error);
            addToast("Failed to send.", "error");
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
        }
    };

    const handleContextMenu = (e, msg) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, message: msg });
    };

    const deleteMessage = async (msgId) => {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        try { await supabase.from("chat_messages").delete().eq("id", msgId); } catch (err) { }
    };

    const handleDirectMessage = async (targetUserId) => {
        try {
            if (!user) return addToast("Please login first", "error");
            const { data: roomId, error } = await supabase.rpc('get_or_create_dm_room', { other_user_id: targetUserId });
            if (error) throw error;
            if (roomId) router.push(`/chat/${roomId}`);
        } catch (error) { addToast("Failed to start chat", "error"); }
    };

    const getMenuOptions = () => {
        if (!contextMenu) return [];
        const { message } = contextMenu;
        const isOwn = message.user_id === user?.id;
        const isAdminUser = user?.role === 'admin' || user?.role === 'senior';
        const options = [
             { label: 'Reply', action: () => setReplyTo(message) },
             { label: 'Copy', action: () => navigator.clipboard.writeText(message.content) }
        ];
        if (!isOwn) options.push({ label: 'Message', action: () => handleDirectMessage(message.user_id) });
        if (isOwn) options.push({ label: 'Edit', action: () => setEditingMessage(message) });
        if (isOwn || isAdminUser) options.push({ label: 'Delete', danger: true, action: () => deleteMessage(message.id) });
        return options;
    };

    const processedMessages = messages.map(m => {
        if (m.reply_to) return m;
        if (m.reply_to_id) {
            const parent = messages.find(p => p.id === m.reply_to_id);
            if (parent) return { ...m, reply_to: parent };
        }
        return m;
    });

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

    if (loading) return <div className="flex h-full items-center justify-center"><Loader /></div>;
    if (!room) return <div className="p-10 text-center text-slate-400">Room not found</div>;

    return (
        <div className="flex flex-col h-full bg-[#0B1120]">
            {/* Header */}
            <header className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#0F1623]/80 backdrop-blur-md sticky top-0 z-20">
                <Link href="/chat" className="md:hidden text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                
                <div 
                    className="flex-1 cursor-pointer flex items-center gap-3" 
                    onClick={() => setSelectedUserId(room.friendId || room.created_by || null)}
                >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                        {room.image ? (
                            <img src={room.image} alt="room" className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} className="text-slate-400" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white leading-tight">{room.name}</h1>
                        <span className="text-xs font-medium text-cyan-400">
                            {room.type === 'dm' ? 'Direct Message' : `${onlineCount} active`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><Search size={20} /></button>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {groupedMessages.map(item => {
                    if (item.type === 'date') {
                        return (
                            <div key={item.id} className="flex justify-center my-6">
                                <div className="bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">
                                    {item.date}
                                </div>
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
                                const target = document.getElementById(`msg-${replyId}`);
                                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            onImageClick={(url) => setViewedImage(url)}
                            onUserClick={(uid) => setSelectedUserId(uid)}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

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
                <div 
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setViewedImage(null)}
                >
                    <button onClick={() => setViewedImage(null)} className="absolute top-6 right-6 text-white/50 hover:text-white p-2">
                        <ArrowLeft size={32} className="rotate-45" />
                    </button>
                    <img
                        src={viewedImage}
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <UserProfileModal userId={selectedUserId} isOpen={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
