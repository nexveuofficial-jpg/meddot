"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { Edit2, Trash2, Plus, Users, Shield, BookOpen, X } from "lucide-react";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function AdminChatRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal / Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        id: null,
        name: "",
        subject: "",
        description: "",
        icon: "MessageCircle",
        allowed_roles: []
    });

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("chat_rooms")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            setRooms(data || []);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            toast.error("Failed to fetch chat rooms");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleEdit = (room) => {
        setEditData({
            id: room.id,
            name: room.name,
            subject: room.subject,
            description: room.description || "",
            icon: room.icon || "MessageCircle",
            allowed_roles: room.allowed_roles || []
        });
        setIsEditing('edit');
    };

    const handleCreate = () => {
        setEditData({
            id: null,
            name: "",
            subject: "",
            description: "",
            icon: "MessageCircle",
            allowed_roles: []
        });
        setIsEditing('new');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: editData.name,
                subject: editData.subject,
                description: editData.description,
                icon: editData.icon,
                allowed_roles: editData.allowed_roles,
                is_active: true
            };

            if (!payload.allowed_roles) payload.allowed_roles = [];

            let error;
            if (isEditing === 'new') {
                const { error: insertError } = await supabase.from('chat_rooms').insert([payload]);
                error = insertError;
            } else {
                const { error: updateError } = await supabase.from('chat_rooms').update(payload).eq('id', editData.id);
                error = updateError;
            }

            if (error) throw error;

            toast.success(isEditing === 'new' ? "Room created!" : "Room updated!");
            setIsEditing(false);
            fetchRooms();

        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to save room: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (room) => {
        setRoomToDelete(room);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!roomToDelete) return;
        setDeleting(true);
        try {
            const { error } = await supabase.from("chat_rooms").delete().eq("id", roomToDelete.id);
            if (error) throw error;

            toast.success("Room deleted successfully");
            setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
            setDeleteModalOpen(false);
            setRoomToDelete(null);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete room: " + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const toggleRole = (role) => {
        setEditData(prev => {
            const roles = prev.allowed_roles || [];
            if (roles.includes(role)) {
                return { ...prev, allowed_roles: roles.filter(r => r !== role) };
            } else {
                return { ...prev, allowed_roles: [...roles, role] };
            }
        });
    };

    return (
        <div className="bg-[#1F2937]/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                         <BookOpen size={20} className="text-cyan-400" /> Study Rooms
                    </h2>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-cyan-500/20"
                >
                    <Plus size={16} /> New Room
                </button>
            </div>

            {loading ? (
                <div className="p-10 flex justify-center"><Loader /></div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white/5 rounded-xl border border-dashed border-white/10">
                    No chat rooms found.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Name</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Subject</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Access</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rooms.map((room) => {
                                const isRestricted = (room.allowed_roles && room.allowed_roles.length > 0);
                                return (
                                    <tr key={room.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-semibold text-white">{room.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5 md:hidden truncate max-w-[100px]">{room.description}</div>
                                            <div className="text-xs text-slate-400 mt-0.5 hidden md:block truncate max-w-[200px]">{room.description}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-300">{room.subject}</td>
                                        <td className="p-4">
                                            {isRestricted ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-wide">
                                                    <Shield size={10} /> Senior Only
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-wide">
                                                    <Users size={10} /> Public
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(room)}
                                                    className="p-1.5 rounded bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(room)}
                                                    className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Glass Modal for Editing */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0F1623] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-xl font-bold text-white">{isEditing === 'new' ? 'Create Room' : 'Edit Room'}</h3>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Room Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full bg-[#1F2937] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="e.g. Anatomy Hall"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Subject / Category</label>
                                <input
                                    type="text"
                                    required
                                    value={editData.subject}
                                    onChange={e => setEditData({ ...editData, subject: e.target.value })}
                                    className="w-full bg-[#1F2937] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="e.g. Anatomy"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                                <textarea
                                    value={editData.description}
                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full bg-[#1F2937] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all min-h-[100px] placeholder:text-slate-600"
                                    placeholder="What is this room for?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Access Control</label>
                                <div 
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border border-white/10 cursor-pointer transition-all
                                        ${(editData.allowed_roles || []).includes('senior') ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 hover:bg-white/10'}
                                    `}
                                    onClick={() => toggleRole('senior')}
                                >
                                    <div className={`
                                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                                        ${(editData.allowed_roles || []).includes('senior') ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-slate-500'}
                                    `}>
                                        {(editData.allowed_roles || []).includes('senior') && <Plus size={12} strokeWidth={4} />}
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">Restrict to Seniors & Admins Only</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 px-1">
                                    {(editData.allowed_roles || []).includes('senior') ? 'Only verified seniors can access this room.' : 'This room is currently public for all students.'}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Room"
                description={`Are you sure you want to delete "${roomToDelete?.name}"? All messages in this room will be lost.`}
                confirmText="Delete Room"
                isDestructive={true}
                isLoading={deleting}
            />
        </div>
    );
}
