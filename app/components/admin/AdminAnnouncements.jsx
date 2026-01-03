"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../../admin/AdminDashboard.module.css";
import { Loader2, Plus, Trash2, Megaphone } from "lucide-react";

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [newContent, setNewContent] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching announcements:", error);
            } else {
                setAnnouncements(data || []);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [priority, setPriority] = useState('normal');

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newContent.trim()) return;

        try {
            const { error } = await supabase.from("announcements").insert([{
                content: newContent,
                type: priority,
                priority: priority,
                is_active: true,
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;

            setNewContent("");
            setPriority("normal");
            fetchData();
        } catch (error) {
            alert("Failed to post announcement: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            const { error } = await supabase
                .from("announcements")
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            alert("Failed to delete: " + error.message);
        }
    };

    return (
        <div className={styles.section}>
            <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={20} /> Announcements
            </h2>

            <form onSubmit={handlePost} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="New announcement..."
                    style={{ flex: 1, minWidth: '200px', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)' }}
                >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent 🚨</option>
                </select>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Plus size={18} />
                </button>
            </form>

            {loading ? <Loader2 className="animate-spin" /> : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {announcements.map(item => (
                        <li key={item.id} style={{
                            background: 'var(--muted)',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.9rem'
                        }}>
                            <span>{item.content}</span>
                            <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                    {announcements.length === 0 && <li style={{ color: 'var(--muted-foreground)', fontStyle: 'italic', fontSize: '0.9rem' }}>No active announcements</li>}
                </ul>
            )}
        </div>
    );
}
