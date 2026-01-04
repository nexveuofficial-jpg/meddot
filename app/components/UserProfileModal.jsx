"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { X, MessageCircle, UserPlus, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UserProfileModal({ userId, isOpen, onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState(null); // 'none', 'pending', 'accepted', 'received'
    const { user: currentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
            if (currentUser) fetchFriendStatus();
        }
    }, [isOpen, userId]);

    const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) console.error("Error fetching profile:", error);
        else setProfile(data);
        setLoading(false);
    };

    const fetchFriendStatus = async () => {
        // Check if I sent request
        const { data: sent } = await supabase
            .from("friendships")
            .select("*")
            .eq("user_id", currentUser.id)
            .eq("friend_id", userId)
            .single();

        if (sent) {
            setFriendStatus(sent.status === 'accepted' ? 'accepted' : 'pending');
            return;
        }

        // Check if they sent request
        const { data: received } = await supabase
            .from("friendships")
            .select("*")
            .eq("user_id", userId)
            .eq("friend_id", currentUser.id)
            .single();

        if (received) {
            setFriendStatus(received.status === 'accepted' ? 'accepted' : 'received');
            return;
        }

        setFriendStatus('none');
    };

    const handleAddFriend = async () => {
        try {
            const { error } = await supabase
                .from("friendships")
                .insert([{ user_id: currentUser.id, friend_id: userId, status: 'pending' }]);

            if (error) throw error;
            setFriendStatus('pending');
            toast.success("Friend request sent!");
        } catch (error) {
            toast.error("Failed to add friend: " + error.message);
        }
    };

    const handleAcceptFriend = async () => {
        try {
            // We need to update the row where THEY are user_id and WE are friend_id
            const { error } = await supabase
                .from("friendships")
                .update({ status: 'accepted' })
                .eq("user_id", userId)
                .eq("friend_id", currentUser.id);

            if (error) throw error;
            setFriendStatus('accepted');
            toast.success("Friend request accepted!");
        } catch (error) {
            toast.error("Failed to accept: " + error.message);
        }
    };

    const handleMessage = async () => {
        try {
            if (!currentUser) return alert("Please login first");

            // Call our RPC function
            const { data: roomId, error } = await supabase.rpc('get_or_create_dm_room', {
                other_user_id: userId
            });

            if (error) throw error;

            if (roomId) {
                onClose();
                router.push(`/chat/${roomId}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to start chat");
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px',
                padding: '2rem', position: 'relative', margin: '1rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                animation: 'modalSlideIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                    background: '#f1f5f9', border: 'none', borderRadius: '50%',
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b'
                }}>
                    <X size={18} />
                </button>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader2 className="animate-spin" />
                    </div>
                ) : profile ? (
                    <div style={{ textAlign: 'center' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '96px', height: '96px', borderRadius: '50%', margin: '0 auto 1.5rem',
                            background: '#e2e8f0', overflow: 'hidden', border: '4px solid white',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}>
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#94a3b8' }}>
                                    {profile.full_name?.[0] || 'U'}
                                </div>
                            )}
                        </div>

                        {/* Name & Role */}
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#1e293b' }}>
                            {profile.full_name || 'User'}
                            {(profile.role === 'admin' || profile.role === 'senior') && (
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                    padding: '0.1rem 0.5rem', borderRadius: '99px',
                                    background: profile.role === 'admin' ? '#fef3c7' : '#dbeafe',
                                    color: profile.role === 'admin' ? '#b45309' : '#1e40af'
                                }}>
                                    {profile.role}
                                </span>
                            )}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>@{profile.username}</p>

                        {/* Bio */}
                        {profile.bio && (
                            <p style={{ background: '#f8fafc', padding: '1rem', borderRadius: '1rem', color: '#334155', fontSize: '0.95rem', marginBottom: '2rem' }}>
                                {profile.bio}
                            </p>
                        )}

                        {/* Actions */}
                        {currentUser && currentUser.id !== userId && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    onClick={handleMessage}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.75rem', borderRadius: '12px', border: 'none',
                                        background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    <MessageCircle size={18} />
                                    Message
                                </button>

                                {friendStatus === 'none' && (
                                    <button onClick={handleAddFriend} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        background: 'white', color: '#0f172a', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <UserPlus size={18} />
                                        Add Friend
                                    </button>
                                )}
                                {friendStatus === 'pending' && (
                                    <button disabled style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        background: '#f1f5f9', color: '#64748b', fontWeight: 600, cursor: 'not-allowed'
                                    }}>
                                        Pending...
                                    </button>
                                )}
                                {friendStatus === 'received' && (
                                    <button onClick={handleAcceptFriend} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.75rem', borderRadius: '12px', border: 'none',
                                        background: '#22c55e', color: 'white', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <Check size={18} />
                                        Accept
                                    </button>
                                )}
                                {friendStatus === 'accepted' && (
                                    <button disabled style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        background: '#f0fdf4', color: '#16a34a', fontWeight: 600
                                    }}>
                                        <Check size={18} />
                                        Friends
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p>User not found</p>
                )}
            </div>
        </div>
    );
}
