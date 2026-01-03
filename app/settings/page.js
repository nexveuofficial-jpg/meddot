"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2, Camera, Save, User, Mail, Shield } from "lucide-react";

export default function SettingsPage() {
    const { user, profile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url);

    const [formData, setFormData] = useState({
        full_name: "",
        bio: "",
        college: "",
        year_of_study: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                bio: profile.bio || "",
                college: profile.college || "",
                year_of_study: profile.year_of_study || ""
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

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let avatar_url = profile?.avatar_url;

            // 1. Upload Avatar if changed
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatar_url = publicUrl;
            }

            // 2. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    bio: formData.bio,
                    college: formData.college,
                    year_of_study: formData.year_of_study,
                    avatar_url: avatar_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            alert("Settings updated successfully!");
            window.location.reload();

        } catch (error) {
            console.error("Error updating settings:", error);
            alert("Failed to update settings: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="glass p-8 rounded-xl">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <User size={40} />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                                <Camera size={16} /> Change Photo
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full p-2 rounded-lg bg-background border border-border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">College</label>
                            <input
                                type="text"
                                value={formData.college}
                                onChange={e => setFormData({ ...formData, college: e.target.value })}
                                className="w-full p-2 rounded-lg bg-background border border-border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Year of Study</label>
                            <input
                                type="text"
                                value={formData.year_of_study}
                                onChange={e => setFormData({ ...formData, year_of_study: e.target.value })}
                                className="w-full p-2 rounded-lg bg-background border border-border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-muted-foreground">
                                <Shield size={16} />
                                <span className="capitalize">{profile?.role || 'User'}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full p-2 rounded-lg bg-background border border-border h-32 resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
