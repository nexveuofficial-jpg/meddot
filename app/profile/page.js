"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2, User, Save, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        college: "",
        year_of_study: "",
        bio: "",
        avatar_url: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setFormData({
                        full_name: data.full_name || user.user_metadata?.full_name || "",
                        college: data.college || "",
                        year_of_study: data.year_of_study || "",
                        bio: data.bio || "",
                        avatar_url: data.avatar_url || "" // Not implementing upload yet, just placeholder
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else {
                fetchProfile();
            }
        }
    }, [user, authLoading, router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    college: formData.college,
                    year_of_study: formData.year_of_study,
                    bio: formData.bio,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return <div style={{ display: "flex", justifyContent: "center", padding: "10rem" }}><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--foreground)" }}>My Profile</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Manage your personal information.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="glass"
                        style={{
                            padding: "0.75rem 1.5rem",
                            borderRadius: "0.5rem",
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                            fontWeight: 600,
                            color: "var(--primary)",
                            cursor: "pointer"
                        }}
                    >
                        <Edit2 size={18} /> Edit Profile
                    </button>
                )}
            </header>

            <div className="glass" style={{ padding: "2.5rem", borderRadius: "1.5rem" }}>
                {/* Avatar Placeholder */}
                <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "3rem" }}>
                    <div style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        background: "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "4px solid white",
                        boxShadow: "var(--shadow-md)"
                    }}>
                        <User size={48} color="var(--muted-foreground)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{formData.full_name || "Student"}</h2>
                        <p style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--foreground)" }}>Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: isEditing ? "1px solid var(--primary)" : "1px solid var(--border)",
                                background: isEditing ? "var(--background)" : "var(--muted)",
                                color: "var(--foreground)",
                                transition: "all 0.2s"
                            }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--foreground)" }}>College / University</label>
                            <input
                                type="text"
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g. AIIMS Delhi"
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    borderRadius: "0.5rem",
                                    border: isEditing ? "1px solid var(--primary)" : "1px solid var(--border)",
                                    background: isEditing ? "var(--background)" : "var(--muted)",
                                    color: "var(--foreground)"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--foreground)" }}>Year of Study</label>
                            <select
                                name="year_of_study"
                                value={formData.year_of_study}
                                onChange={handleChange}
                                disabled={!isEditing}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    borderRadius: "0.5rem",
                                    border: isEditing ? "1px solid var(--primary)" : "1px solid var(--border)",
                                    background: isEditing ? "var(--background)" : "var(--muted)",
                                    color: "var(--foreground)"
                                }}
                            >
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="Intern">Intern</option>
                                <option value="Post Graduate">Post Graduate</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--foreground)" }}>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={4}
                            placeholder="Tell us about yourself..."
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: isEditing ? "1px solid var(--primary)" : "1px solid var(--border)",
                                background: isEditing ? "var(--background)" : "var(--muted)",
                                color: "var(--foreground)",
                                resize: "none"
                            }}
                        />
                    </div>

                    {isEditing && (
                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    borderRadius: "0.5rem",
                                    background: "var(--primary)",
                                    color: "white",
                                    fontWeight: 600,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Save Changes
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={saving}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    borderRadius: "0.5rem",
                                    background: "transparent",
                                    border: "1px solid var(--border)",
                                    color: "var(--muted-foreground)",
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
