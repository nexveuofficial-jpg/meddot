"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabase";

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

    // ... (lines 43-209 omitted for brevity, unchanged)

    <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Year of Study</label>
        <input type="text" value={formData.year_of_study} onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
    </div>
                        </div >
                    </section >

        {/* Section: Contact & Social */ }
        < section style = {{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }
}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🌐 Social & Contact
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Phone (Optional)</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>LinkedIn URL</label>
                                <input type="url" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Website / Portfolio</label>
                                <input type="url" placeholder="https://..." value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                            </div>
                        </div>
                    </section >

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
                </form >
            </div >
        </div >
    );
}
