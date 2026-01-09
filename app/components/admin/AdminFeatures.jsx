"use client";

import { useState } from "react";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { ToggleLeft, ToggleRight, Settings } from "lucide-react";
import Loader from "../ui/Loader";
import { toast } from "sonner";

export default function AdminFeatures() {
    const { flags, toggleFlag, loading } = useFeature();
    const [updating, setUpdating] = useState(null);

    const handleToggle = async (key, value) => {
        setUpdating(key);
        try {
            await toggleFlag(key, value);
        } catch (err) {
            toast.error("Failed to toggle feature");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader /></div>;

    const features = [
        { key: 'enable_chat', label: 'Global Chat System', desc: 'Enable subject-wise chat rooms' },
        { key: 'enable_uploads', label: 'Student Uploads', desc: 'Allow students to upload notes' },
        { key: 'enable_ask_senior', label: 'Ask Senior Q&A', desc: 'Enable Q&A section' },
        { key: 'enable_private_messages', label: 'Private Messaging', desc: 'Enable 1-to-1 chat between users' },
        { key: 'enable_focus_rooms', label: 'Focus Rooms', desc: 'Enable public Pomodoro study rooms' },
    ];

    return (
        <div className="bg-[#1F2937]/30 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings size={20} className="text-cyan-400" />
                System Control
            </h2>
            <div className="space-y-4">
                {features.map((feat) => (
                    <div key={feat.key} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div>
                            <div className="font-semibold text-white text-sm">{feat.label}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{feat.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={flags[feat.key] || false}
                                onChange={(e) => handleToggle(feat.key, e.target.checked)}
                                disabled={updating === feat.key}
                            />
                            <div className={`
                                w-11 h-6 bg-slate-700/50 rounded-full peer 
                                peer-focus:ring-2 peer-focus:ring-cyan-500/50 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:border-gray-300 after:border after:rounded-full 
                                after:h-5 after:w-5 after:transition-all 
                                peer-checked:bg-cyan-600
                                ${updating === feat.key ? 'opacity-50 cursor-wait' : ''}
                            `}></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
