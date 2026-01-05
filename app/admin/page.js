"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import styles from "./AdminDashboard.module.css";
import AdminFeatures from "../components/admin/AdminFeatures";
import AdminUsers from "../components/admin/AdminUsers";
import AdminNotes from "../components/admin/AdminNotes";
import AdminChatRooms from "../components/admin/AdminChatRooms";
import AdminAnnouncements from "../components/admin/AdminAnnouncements";
import { Users, FileText, AlertCircle, MessageSquare } from "lucide-react";
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

    // Safety check if not admin (though layout handles this mostly)
    if (user?.role !== 'admin') {
        // return <div className="p-10 text-center">Access Restricted</div>; 
        // Allow for now since simulated role might lag, or handle better
    }

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '240px'
        }}>
            <div style={{
                background: `${color}20`,
                padding: '1rem',
                borderRadius: '0.75rem',
                color: color
            }}>
                <Icon size={24} />
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1 }}>{value}</div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', fontWeight: 500 }}>{label}</div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
            <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid var(--border)"
            }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#1e293b", marginBottom: "0.5rem" }}>Admin Command Center</h1>
                    <p style={{ color: "#64748b" }}>Welcome back, {user?.full_name || 'Admin'}</p>
                </div>
                <button
                    onClick={logout}
                    style={{
                        padding: "0.75rem 1.5rem",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        background: "white",
                        color: "var(--foreground)",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all 0.2s"
                    }}
                >
                    Logout
                </button>
            </header>

            {/* Stats Row */}
            <motion.div
                style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <StatCard icon={Users} label="Total Users" value={stats.users} color="#3b82f6" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <StatCard icon={FileText} label="Total Notes" value={stats.notes} color="#10b981" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <StatCard icon={AlertCircle} label="Pending Review" value={stats.pending} color="#f59e0b" />
                </motion.div>
            </motion.div>

            <motion.div
                className={styles.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                {/* Left Column: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <AdminFeatures />

                    <div id="rooms" style={{ scrollMarginTop: '2rem' }}>
                        <AdminChatRooms />
                    </div>

                    <div id="announcements" style={{ scrollMarginTop: '2rem' }}>
                        <AdminAnnouncements />
                    </div>

                    <div id="users" style={{ scrollMarginTop: '2rem' }}>
                        <AdminUsers />
                    </div>
                </div>

                {/* Right Column: Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div id="moderation" style={{ scrollMarginTop: '2rem' }}>
                        <AdminNotes />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
