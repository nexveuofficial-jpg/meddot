"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../../admin/AdminDashboard.module.css";
import { Loader2, Check, X, Eye } from "lucide-react";

export default function AdminNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // Default to pending for better workflow

    const fetchNotes = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("notes")
                .select("*")
                .order("created_at", { ascending: false });

            if (filter !== 'all') {
                query = query.eq("status", filter);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching notes:", error);
            } else {
                setNotes(data || []);
            }
        } catch (error) {
            console.error("Crash fetching notes:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotes();
        // Setup realtime listener for 'notes' table
        const subscription = supabase
            .channel('admin_notes_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
                fetchNotes();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [filter]);

    const updateStatus = async (id, status) => {
        if (!confirm(`Are you sure you want to mark this note as ${status}?`)) return;

        try {
            const { error } = await supabase
                .from("notes")
                .update({ status })
                .eq("id", id);

            if (error) throw error;
            // Realtime listener will handle UI update
        } catch (error) {
            alert("Error updating status: " + error.message);
        }
    };

    return (
        <div className={styles.section} style={{ minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <h2 className={styles.title} style={{ marginBottom: 0 }}>Content Moderation</h2>
                    <a href="/notes/upload" style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        boxShadow: 'var(--shadow-sm)'
                    }}>+ Upload Official Note</a>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={styles.select}
                    style={{ width: 'auto' }}
                >
                    <option value="all">All Notes</option>
                    <option value="pending">Pending Review</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : notes.length === 0 ? (
                <div className={styles.emptyState}>No notes found in this category.</div>
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
                                    <td>{note.author_name || 'Anonymous'}</td>
                                    <td>
                                        <span className={styles.badge} style={{
                                            background: note.status === 'published' ? '#dcfce7' : note.status === 'pending' ? '#fef9c3' : '#fee2e2',
                                            color: note.status === 'published' ? '#166534' : note.status === 'pending' ? '#854d0e' : '#991b1b',
                                            border: `1px solid ${note.status === 'published' ? '#bbf7d0' : note.status === 'pending' ? '#fde047' : '#fecaca'}`
                                        }}>
                                            {note.status}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <a
                                            href={note.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.actionButton}
                                            style={{ background: 'var(--muted)', color: 'var(--foreground)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="View PDF"
                                        >
                                            <Eye size={14} />
                                        </a>
                                        {note.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(note.id, 'published')}
                                                    className={styles.actionButton}
                                                    style={{ background: '#dcfce7', color: '#166534' }}
                                                    title="Approve & Publish"
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
                                        {note.status === 'published' && (
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
