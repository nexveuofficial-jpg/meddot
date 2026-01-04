"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabase";
import styles from "./profile.module.css";

export default function ProfilePage() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Avatar State
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        college: "",
        year_of_study: "",
        bio: "",
        phone: "",
        linkedin: "",
        website: "",
        specialty: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                college: profile.college || "",
                year_of_study: profile.year_of_study || "",
                bio: profile.bio || "",
                phone: profile.phone || "",
                linkedin: profile.linkedin || "",
                website: profile.website || "",
                specialty: profile.specialty || ""
            });
            setPreviewUrl(profile.avatar_url);
        }
    }, [profile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let avatar_url = profile?.avatar_url;

            // 1. Upload Avatar
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(filePath);
                    avatar_url = publicUrl;
                }
            }

            // 2. Update Profile Data
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    ...formData,
                    avatar_url: avatar_url,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id);

            if (updateError) throw updateError;

            alert("Profile updated successfully!");
            window.location.reload();

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile. (Did you add the new columns to Supabase?) " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user || !profile) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
            Loading profile...
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Navigation */}
            <a href="/dashboard" className={styles.backLink}>
                ← Back to Dashboard
            </a>

            <div className={styles.layout}>
                {/* Left Column: Identity Card */}
                <div className={`${styles.card} ${styles.leftCard}`}>
                    <div className={styles.avatarContainer}>
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#94a3b8' }}>
                                {formData.full_name?.[0] || 'U'}
                            </div>
                        )}
                    </div>

                    <label style={{
                        cursor: 'pointer',
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: '#f1f5f9',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#475569',
                        marginBottom: '1.5rem',
                        transition: 'background 0.2s'
                    }}>
                        Change Photo
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>{formData.full_name || 'Your Name'}</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{profile.role || 'Member'} • {formData.college || 'College'}</p>

                    <div style={{ textAlign: 'left', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About Me</p>
                        <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
                            {formData.bio || "No bio yet. Tell the world about yourself!"}
                        </p>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className={`${styles.card} ${styles.rightCard}`}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        marginBottom: '2rem',
                        background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Edit Profile</h1>

                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Section: Academic */}
                        <section>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📚 Academic Info
                            </h3>
                            <div className={styles.formGrid}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Full Name</label>
                                    <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Specialty / Interest</label>
                                    <input type="text" placeholder="e.g. Cardiology" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>College</label>
                                    <input type="text" value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Year of Study</label>
                                    <input type="text" value={formData.year_of_study} onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                                </div>
                            </div>
                        </section>

                        {/* Section: Contact & Social */}
                        <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🌐 Social & Contact
                            </h3>
                            <div className={styles.formGrid}>
                                <div style={{}}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Email (Read Only)</label>
                                    <input type="email" value={user?.email || ''} readOnly disabled
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#e2e8f0', cursor: 'not-allowed', color: '#64748b' }} />
                                </div>
                                <div style={{}}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Phone (Optional)</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                                </div>
                            </div>
                        </section>

                        <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us a bit about yourself..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1',
                                    background: '#f8fafc',
                                    resize: 'vertical'
                                }}
                            />
                        </section>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1rem 2rem',
                                background: 'linear-gradient(to right, #2563eb, #6366f1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                marginTop: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            {loading ? "Saving Changes..." : "Save Profile"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
