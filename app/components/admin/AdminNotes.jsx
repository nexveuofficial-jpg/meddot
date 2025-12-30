"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../../admin/AdminDashboard.module.css";
import { Loader2, Check, X, FileText, Eye } from "lucide-react";

export default function AdminNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved

    const fetchNotes = async () => {
        setLoading(true);
        let query = supabase
            .from('notes')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (error) console.error(error);
        else setNotes(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotes();

        // Realtime subscription
        const sub = supabase
            .channel('admin_notes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
                fetchNotes();
            })
            .subscribe();

        return () => supabase.removeChannel(sub);
    }, [filter]);

    const updateStatus = async (id, status) => {
        const { error } = await supabase
            .from('notes')
            .update({ status })
            .eq('id', id);

        if (error) alert("Error updating status");
        // Realtime will auto-refresh
    };

    return (
        <div className={styles.section} style={{ minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className={styles.title} style={{ marginBottom: 0 }}>Content Moderation</h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={styles.select}
                    style={{ width: 'auto' }}
                >
                    <option value="all">All Notes</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Published</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : notes.length === 0 ? (
                <div className={styles.emptyState}>No notes found.</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Author</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.map((note) => (
                                <tr key={note.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{note.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{new Date(note.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td>{note.subject}</td>
                                    <td>{note.profiles?.full_name || 'Unknown'}</td>
                                    <td>
                                        <span className={styles.badge} style={{
                                            background: note.status === 'approved' ? '#dcfce7' : note.status === 'pending' ? '#fef9c3' : '#fee2e2',
                                            color: note.status === 'approved' ? '#166534' : note.status === 'pending' ? '#854d0e' : '#991b1b',
                                            border: `1px solid ${note.status === 'approved' ? '#bbf7d0' : note.status === 'pending' ? '#fde047' : '#fecaca'}`
                                        }}>
                                            {note.status}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className={styles.actionButton} style={{ background: 'var(--muted)', color: 'var(--foreground)' }} title="View">
                                            <Eye size={14} />
                                        </button>
                                        {note.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(note.id, 'approved')}
                                                    className={styles.actionButton}
                                                    style={{ background: '#dcfce7', color: '#166534' }}
                                                    title="Approve"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(note.id, 'rejected')}
                                                    className={styles.actionButton}
                                                    style={{ background: '#fee2e2', color: '#991b1b' }}
                                                    title="Reject"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        )}
                                        {note.status === 'approved' && (
                                            <button
                                                onClick={() => updateStatus(note.id, 'rejected')}
                                                className={styles.actionButton}
                                                style={{ background: '#fee2e2', color: '#991b1b' }}
                                                title="Unpublish"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
