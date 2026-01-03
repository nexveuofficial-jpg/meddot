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

    if (!user || !profile) return <div>Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Profile</h1>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block mb-1">Full Name</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1">College</label>
                    <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1">Year</label>
                    <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
