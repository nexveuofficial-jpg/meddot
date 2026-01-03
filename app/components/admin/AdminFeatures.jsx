"use client";

import { useState } from "react";
import { useFeature } from "@/app/context/FeatureFlagContext";
import styles from "../../admin/AdminDashboard.module.css";
import { ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

export default function AdminFeatures() {
    const { flags, toggleFlag, loading } = useFeature();
    const [updating, setUpdating] = useState(null); // Key being updated

    const handleToggle = async (key, value) => {
        setUpdating(key);
        import { toast } from "sonner";

        // ... inside function ...
        try {
            await toggleFlag(key, value);
        } catch (err) {
            toast.error("Failed to toggle feature");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="p-4"><Loader2 className="animate-spin" /></div>;

    const features = [
        { key: 'enable_chat', label: 'Global Chat System', desc: 'Enable subject-wise chat rooms' },
        { key: 'enable_uploads', label: 'Student Uploads', desc: 'Allow students to upload notes' },
        { key: 'enable_ask_senior', label: 'Ask Senior Q&A', desc: 'Enable Q&A section' },
        { key: 'enable_private_messages', label: 'Private Messaging', desc: 'Enable 1-to-1 chat between users' },
        { key: 'enable_focus_rooms', label: 'Focus Rooms', desc: 'Enable public Pomodoro study rooms' },
    ];

    return (
        <div className={styles.section}>
            <h2 className={styles.title}>System Control (Feature Flags)</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {features.map((feat) => (
                    <div key={feat.key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'white', // Ensure white bg
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{feat.label}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{feat.desc}</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={flags[feat.key] || false}
                                onChange={(e) => handleToggle(feat.key, e.target.checked)}
                                disabled={updating === feat.key}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 40px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: var(--primary);
                }
                input:checked + .slider:before {
                    transform: translateX(16px);
                }
            `}</style>
        </div>
    );
}
