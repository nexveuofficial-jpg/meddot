"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

import AdminFeatures from "../components/admin/AdminFeatures";
import AdminUsers from "../components/admin/AdminUsers";
import AdminNotes from "../components/admin/AdminNotes";
import AdminChatRooms from "../components/admin/AdminChatRooms";
import AdminAnnouncements from "../components/admin/AdminAnnouncements";
import { Users, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPage() {
    const { logout, user } = useAuth();
    const [stats, setStats] = useState({
        users: 0,
        notes: 0,
        pending: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            const [userRes, noteRes, pendingRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('notes').select('*', { count: 'exact', head: true }),
                supabase.from('notes').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            setStats({
                users: userRes.count || 0,
                notes: noteRes.count || 0,
                pending: pendingRes.count || 0
            });
        };
        fetchStats();
    }, []);

    const StatCard = ({ icon: Icon, label, value, color, delay }) => (
        <div 
            className="flex items-center gap-4 p-6 rounded-2xl border border-white/5 bg-[#1F2937]/30 backdrop-blur-md shadow-lg hover:border-white/10 transition-all duration-300 min-w-[240px]"
        >
            <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `${color}20`, color: color, boxShadow: `0 8px 20px -6px ${color}40` }}
            >
                <Icon size={28} strokeWidth={1.5} />
            </div>
            <div>
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                <div className="text-sm font-medium text-slate-400">{label}</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto pb-10">
            <header className="flex flex-wrap justify-between items-center mb-10 pb-6 border-b border-white/5 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                        Admin Command Center
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Welcome back, <span className="text-cyan-400">{user?.full_name || 'Administrator'}</span>
                    </p>
                </div>
                
                {/* Optional Top Actions */}
                <div className="flex gap-3">
                    {/* Add global actions here if needed */}
                </div>
            </header>

            {/* Stats Row */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <StatCard icon={Users} label="Total Users" value={stats.users} color="#3b82f6" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <StatCard icon={FileText} label="Total Notes" value={stats.notes} color="#10b981" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <StatCard icon={AlertCircle} label="Pending Review" value={stats.pending} color="#f59e0b" />
                </motion.div>
            </motion.div>

            {/* Main Grid Content */}
            <motion.div
                className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                {/* Left Column: Controls (2 cols wide on large screens) */}
                <div className="xl:col-span-1 space-y-8 flex flex-col">
                    <AdminFeatures />

                    <div id="rooms" className="scroll-mt-8">
                        <AdminChatRooms />
                    </div>

                    <div id="announcements" className="scroll-mt-8">
                        <AdminAnnouncements />
                    </div>

                    <div id="users" className="scroll-mt-8">
                        <AdminUsers />
                    </div>
                </div>

                {/* Right Column: Moderation (Takes more space) */}
                <div className="xl:col-span-2 space-y-8 flex flex-col">
                    <div id="moderation" className="scroll-mt-8 h-full">
                        <AdminNotes />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
