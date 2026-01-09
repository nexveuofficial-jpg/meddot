"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { Plus, Trash2, Megaphone, AlertCircle } from "lucide-react";
import Loader from "../ui/Loader";

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
        <div className="bg-[#1F2937]/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Megaphone size={20} className="text-cyan-400" /> Announcements
            </h2>

            <form onSubmit={handlePost} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="New announcement..."
                    className="flex-1 min-w-[150px] bg-[#0F1623] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 text-sm"
                />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="bg-[#0F1623] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                </select>
                <button 
                    type="submit" 
                    className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-3 flex items-center justify-center transition-colors shadow-lg hover:shadow-cyan-500/20"
                >
                    <Plus size={20} />
                </button>
            </form>

            {loading ? <div className="flex justify-center p-4"><Loader /></div> : (
                <ul className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-white/10">
                    {announcements.map(item => (
                        <li key={item.id} className={`
                            relative flex justify-between items-start p-3 rounded-xl border transition-all group
                            ${item.priority === 'urgent' 
                                ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/30' 
                                : 'bg-white/5 border-white/5 hover:border-white/10'}
                        `}>
                            <div className="flex gap-3">
                                {item.priority === 'urgent' && <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                                <span className={`text-sm ${item.priority === 'urgent' ? 'text-red-100' : 'text-slate-300'}`}>{item.content}</span>
                            </div>
                            <button 
                                onClick={() => handleDelete(item.id)} 
                                className="text-slate-500 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        </li>
                    ))}
                    {announcements.length === 0 && (
                        <li className="text-center py-8 text-slate-500 text-sm italic border border-dashed border-white/10 rounded-xl">
                            No active announcements
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
