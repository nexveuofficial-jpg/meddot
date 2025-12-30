"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../../admin/AdminDashboard.module.css";
import { Loader2, User, Shield, GraduationCap } from "lucide-react";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateRole = async (id, newRole) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', id);

        if (!error) fetchUsers();
    };

    if (loading) return <div className="p-4"><Loader2 className="animate-spin" /></div>;

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
                        {users.map((u) => (
                            <tr key={u.id}>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
