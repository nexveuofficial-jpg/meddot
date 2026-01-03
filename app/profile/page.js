"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
    const { user, profile } = useAuth(); // AuthContext provides profile too
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        college: "",
        year: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                college: profile.college || "",
                year: profile.year || ""
            });
        }
    }, [profile]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from("profiles")
            .update(formData)
            .eq("id", user.id);

        if (error) {
            alert("Error updating profile: " + error.message);
        } else {
            alert("Profile updated!");
            window.location.reload(); // Quick refresh to update context
        }
        setLoading(false);
    };

    if (!user || !profile) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
            Loading profile...
        </div>
    );

    return (
        <div style={{
            maxWidth: '800px',
            margin: '2rem auto',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '1.5rem',
                background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>My Profile</h1>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Full Name</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>College</label>
                    <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Year</label>
                    <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(to right, #2563eb, #6366f1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        marginTop: '1rem',
                        transition: 'opacity 0.2s'
                    }}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
