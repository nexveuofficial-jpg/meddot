"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, User, Shield, GraduationCap } from "lucide-react";

export default function UserProfileModal({ userId, onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // First try fetching from profiles table
                let { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (error && error.code !== 'PGRST116') { // Ignore "not found" error for now
                    console.error("Error fetching profile:", error);
                }

                if (!data) {
                    // Fallback to minimal info if we can't get full profile (or if profiles table row doesn't exist)
                    // We might not be able to get email/metadata easily without admin rights depending on RLS,
                    // but usually we rely on the 'profiles' public table.
                    setProfile({ full_name: "Unknown User", role: "student" });
                } else {
                    setProfile(data);
                }
            } catch (err) {
                console.error(err);
                setProfile({ full_name: "Error loading user", role: "student" });
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    if (!userId) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                animation: 'scaleIn 0.2s ease-out'
            }} onClick={e => e.stopPropagation()}>

                {/* Header / Banner */}
                <div style={{
                    height: '100px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '10px', right: '10px',
                            background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white',
                            borderRadius: '50%', width: '30px', height: '30px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '0 1.5rem 1.5rem', marginTop: '-50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'white', padding: '4px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%',
                            background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#94a3b8'
                        }}>
                            {/* Placeholder Avatar if no image */}
                            <User size={48} />
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ textAlign: 'center', marginTop: '1rem', width: '100%' }}>
                        {loading ? (
                            <div className="animate-pulse">
                                <div style={{ height: '24px', background: '#e2e8f0', borderRadius: '4px', width: '60%', margin: '0 auto 8px' }}></div>
                                <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px', width: '40%', margin: '0 auto' }}></div>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>
                                    {profile?.full_name || "Anonymous User"}
                                </h2>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {profile?.role === 'admin' && (
                                        <span style={{
                                            background: '#fee2e2', color: '#dc2626', padding: '2px 8px',
                                            borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            <Shield size={12} /> Admin
                                        </span>
                                    )}
                                    {profile?.role === 'senior' && (
                                        <span style={{
                                            background: '#dbeafe', color: '#2563eb', padding: '2px 8px',
                                            borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            <GraduationCap size={12} /> Senior
                                        </span>
                                    )}
                                    {(!profile?.role || profile.role === 'student') && (
                                        <span style={{
                                            background: '#f1f5f9', color: '#64748b', padding: '2px 8px',
                                            borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                                        }}>
                                            Student
                                        </span>
                                    )}
                                </div>

                                <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>About</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0 }}>
                                        {profile?.bio || "No bio available."}
                                    </p>
                                </div>

                                {profile?.joined_at && (
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
                                        Joined {new Date(profile.joined_at).toLocaleDateString()}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
