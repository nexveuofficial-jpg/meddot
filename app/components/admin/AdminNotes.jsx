"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { Check, X, Eye, Trash2 } from "lucide-react";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function AdminNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("notes")
                .select("*, profiles(username, full_name, role)")
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
            const filePath = noteToDelete.file_path;

            if (filePath) {
                const { error: storageError } = await supabase
                    .storage
                    .from('notes_documents')
                    .remove([filePath]);

                if (storageError) {
                    console.warn("Storage delete warning:", storageError.message);
                }
            }

            const { error: dbError } = await supabase
                .from("notes")
                .delete()
                .eq("id", noteToDelete.id);

            if (dbError) throw dbError;

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
        <div className="bg-[#1F2937]/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 min-h-[400px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <h2 className="text-xl font-bold text-white tracking-tight">Content Moderation</h2>
                    <a href="/notes/upload" className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-cyan-500/20">
                        + Upload Official Note
                    </a>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-[#0F1623] border border-white/10 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 block p-2.5 outline-none min-w-[150px]"
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
                <div className="text-center py-12 text-slate-400 bg-white/5 rounded-xl border border-dashed border-white/10">
                    No notes found in this category.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Title</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Subject</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Author</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Category</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {notes.map((note) => (
                                <tr key={note.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-white">{note.title}</div>
                                        <div className="text-xs text-slate-500 mt-1">{new Date(note.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-300">{note.subject}</td>
                                    <td className="p-4 text-sm text-slate-300 font-medium">
                                        {note.profiles?.username || note.profiles?.full_name || note.author_name || 'Anonymous'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`
                                            px-2.5 py-1 rounded-md text-xs font-bold border
                                            ${note.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                              note.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                              'bg-red-500/10 text-red-400 border-red-500/20'}
                                        `}>
                                            {note.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-white/5">
                                            {note.category || 'Other'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={note.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                                title="View PDF"
                                            >
                                                <Eye size={16} />
                                            </a>
                                            {note.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(note.id, 'published')}
                                                        className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(note.id, 'rejected')}
                                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {note.status === 'published' && (
                                                <button
                                                    onClick={() => updateStatus(note.id, 'rejected')}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                                                    title="Unpublish"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => confirmDelete(note)}
                                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors ml-2"
                                                title="Delete Permanently"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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
        </div>
    );
}
