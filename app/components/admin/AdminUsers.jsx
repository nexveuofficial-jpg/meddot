"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../../admin/AdminDashboard.module.css";
import { User, Shield, GraduationCap } from "lucide-react";
import Loader from "../ui/Loader";
import { motion } from "framer-motion";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Revert: Use Supabase 'profiles' table
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching users:", error);
            } else {
                setUsers(data);
            }
        } catch (error) {
            console.error("Crash fetching users:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [actionLoading, setActionLoading] = useState(null); // ID of user being updated

    const updateRole = async (id, newRole) => {
        if (!confirm(`Are you sure you want to promote/demote this user to ${newRole}?`)) return;

        setActionLoading(id);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", id);

            if (error) throw error;

            alert(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (error) {
            alert("Failed to update role: " + error.message);
        }
        setActionLoading(null);
    };

    if (loading) return <div className="p-4"><Loader /></div>;

    return (
        <div className={styles.section} style={{ maxHeight: '500px' }}>
            <h2 className={styles.title}>User Management ({users.length})</h2>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, index) => (
                            <motion.tr
                                key={u.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <td>
                                    <div style={{ fontWeight: 600 }}>{u.full_name || 'Unknown'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{u.email}</div>
                                </td>
                                <td>
                                    <span className={styles.badge} style={{
                                        background: u.role === 'admin' ? '#fef3c7' : u.role === 'senior' ? '#dbeafe' : 'var(--muted)',
                                        color: u.role === 'admin' ? '#b45309' : u.role === 'senior' ? '#1e40af' : 'inherit'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ display: 'flex', gap: '0.5rem' }}>
                                    {u.role !== 'admin' && (
                                        <button
                                            onClick={() => updateRole(u.id, 'admin')}
                                            className={styles.actionButton}
                                            title="Make Admin"
                                        >
                                            <Shield size={14} />
                                        </button>
                                    )}
                                    {u.role !== 'senior' && (
                                        <button
                                            onClick={() => updateRole(u.id, 'senior')}
                                            className={styles.actionButton}
                                            title="Make Senior"
                                        >
                                            <GraduationCap size={14} />
                                        </button>
                                    )}
                                    {u.role !== 'student' && (
                                        <button
                                            onClick={() => updateRole(u.id, 'student')}
                                            className={styles.actionButton}
                                            title="Demote to Student"
                                        >
                                            <User size={14} />
                                        </button>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
