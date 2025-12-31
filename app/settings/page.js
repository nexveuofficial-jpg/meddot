"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2, Camera, Save, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./settings.module.css";

export default function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Form States
    const [fullName, setFullName] = useState("");
    const [college, setCollege] = useState("");
    const [year, setYear] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setFullName(data.full_name || "");
            setCollege(data.college || "");
            setYear(data.year_of_study || "");
            setBio(data.bio || "");
            setAvatarUrl(data.avatar_url || "");
        }
        setLoading(false);
    };

    const handleAvatarUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error) {
            alert('Error uploading avatar: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const updates = {
            id: user.id,
            full_name: fullName,
            college,
            year_of_study: year,
            bio,
            avatar_url: avatarUrl,
            updated_at: new Date()
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(updates);

        if (error) {
            alert('Error updating profile: ' + error.message);
        } else {
            alert('Profile updated successfully!');
            router.refresh();
            // Also force a re-fetch of the session to update the context immediately
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Trigger an update event manually or just let the router refresh handle it
            }
        }
        setSaving(false);
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className={styles.container}>
            <Link href="/dashboard" className={styles.backLink}>
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <div className={styles.grid}>

                {/* Left: Preview Card */}
                <div>
                    <div className={`${styles.card} ${styles.profileCard}`}>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "50%",
                                background: "#f0f9ff",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "4px solid white",
                                boxShadow: "var(--shadow-md)"
                            }}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <User size={48} color="var(--primary)" />
                                )}
                            </div>
                            <label style={{
                                position: "absolute",
                                bottom: "0",
                                right: "0",
                                background: "var(--primary)",
                                color: "white",
                                padding: "0.5rem",
                                borderRadius: "50%",
                                cursor: "pointer",
                                boxShadow: "var(--shadow-md)"
                            }}>
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{fullName || "Your Name"}</h2>
                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{user?.role}</p>
                        </div>

                        {(college || year) && (
                            <div style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", background: "var(--muted)", padding: "0.5rem 1rem", borderRadius: "0.5rem", width: "100%" }}>
                                {year && <span>{year} • </span>}
                                {college && <span>{college}</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Edit Form */}
                <div className={styles.card}>
                    <h1 className={styles.title}>Profile Settings</h1>

                    <form onSubmit={handleSave} style={{ display: "grid", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className={styles.input}
                                placeholder="Dr. Future One"
                            />
                        </div>

                        <div className={styles.formGrid}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Medical College</label>
                                <input
                                    type="text"
                                    value={college}
                                    onChange={e => setCollege(e.target.value)}
                                    className={styles.input}
                                    placeholder="AIIMS Delhi"
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Year of Study</label>
                                <select
                                    value={year}
                                    onChange={e => setYear(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="">Select Year</option>
                                    <option value="1st Year">1st Year (MBBS)</option>
                                    <option value="2nd Year">2nd Year (MBBS)</option>
                                    <option value="3rd Year">3rd Year (MBBS)</option>
                                    <option value="4th Year">4th Year (MBBS)</option>
                                    <option value="Intern">Intern</option>
                                    <option value="Post-Grad">Post-Grad</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Bio</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className={styles.input}
                                rows="3"
                                placeholder="Tell us about your medical interests..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={styles.saveButton}
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
