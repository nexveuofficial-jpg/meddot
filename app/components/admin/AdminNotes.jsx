"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../../admin/AdminDashboard.module.css";
import { Check, X, Eye, Trash2 } from "lucide-react";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function AdminNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // Default to pending for better workflow

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

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
                toast.error("Failed to fetch notes");
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
            toast.success(`Note marked as ${status}`);
        } catch (error) {
            toast.error("Error updating status: " + error.message);
        }
    };

    const confirmDelete = (note) => {
        setNoteToDelete(note);
        setDeleteModalOpen(true);
    };

    const handleDeleteNote = async () => {
        if (!noteToDelete) return;
        setDeleting(true);

        try {
            // Step 1: Get File Path (Already in note object, but good to double check or use existing)
            const filePath = noteToDelete.file_path; // 'user_id/filename.pdf' typically

            // Step 2: Delete from Storage
            if (filePath) {
                const { error: storageError } = await supabase
                    .storage
                    .from('notes_documents')
                    .remove([filePath]);

                if (storageError) {
                    console.warn("Storage delete warning:", storageError.message);
                    // Don't block DB delete if file missing, but log it
                }
            }

            // Step 3: Delete from Database
            const { error: dbError } = await supabase
                .from("notes")
                .delete()
                .eq("id", noteToDelete.id);

            if (dbError) throw dbError;

            // Step 4: Update UI Immediately
            setNotes(prev => prev.filter(n => n.id !== noteToDelete.id));
            toast.success("Note and file permanently deleted.");
            setDeleteModalOpen(false);
            setNoteToDelete(null);

        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete note: " + error.message);
        } finally {
            setDeleting(false);
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
                <div className="p-10 flex justify-center"><Loader /></div>
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
                                <th>Category</th>
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
                                    <td>
                                        <span style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', color: '#475569' }}>
                                            {note.category || 'Other'}
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
                                        {/* Hard Delete Button */}
                                        <button
                                            onClick={() => confirmDelete(note)}
                                            className={styles.actionButton}
                                            style={{ background: '#ef4444', color: 'white', marginLeft: 'auto' }}
                                            title="Permanently Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
            }

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteNote}
                title="Delete Note Permanently"
                description={`Are you sure you want to delete "${noteToDelete?.title}"? This will remove the file from storage and cannot be undone.`}
                confirmText="Yes, delete it"
                isDestructive={true}
                isLoading={deleting}
            />
        </div >
    );
}
