"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../../admin/AdminDashboard.module.css";
import { Edit2, Trash2, Plus, Users, Shield, Save, X } from "lucide-react";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function AdminChatRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal / Form State
    const [isEditing, setIsEditing] = useState(false); // false = hidden, 'new' = create, 'edit' = update
    const [editData, setEditData] = useState({
        id: null,
        name: "",
        subject: "",
        description: "",
        icon: "MessageCircle",
        allowed_roles: [] // Array of strings e.g. ['senior']
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

            // Fix empty string arrays if any
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
        <div className={styles.section} style={{ minHeight: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <h2 className={styles.title} style={{ marginBottom: 0 }}>Study Rooms</h2>
                    <button
                        onClick={handleCreate}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <Plus size={16} /> New Room
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-10 flex justify-center"><Loader /></div>
            ) : rooms.length === 0 ? (
                <div className={styles.emptyState}>No chat rooms found.</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Access</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => {
                                const isRestricted = (room.allowed_roles && room.allowed_roles.length > 0);
                                return (
                                    <tr key={room.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{room.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{room.description?.substring(0, 50)}</div>
                                        </td>
                                        <td>{room.subject}</td>
                                        <td>
                                            {isRestricted ? (
                                                <span style={{
                                                    background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem',
                                                    borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
                                                }}>
                                                    <Shield size={10} /> Senior Only
                                                </span>
                                            ) : (
                                                <span style={{
                                                    background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem',
                                                    borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
                                                }}>
                                                    <Users size={10} /> Public
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(room)}
                                                className={styles.actionButton}
                                                style={{ background: '#e0f2fe', color: '#0369a1' }}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(room)}
                                                className={styles.actionButton}
                                                style={{ background: '#fee2e2', color: '#991b1b' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal - Rendered Inline to prevent focus loss */}
            {isEditing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 50, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{isEditing === 'new' ? 'Create Room' : 'Edit Room'}</h3>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Room Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a' }}
                                    placeholder="e.g. Anatomy Hall"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Subject / Category</label>
                                <input
                                    type="text"
                                    required
                                    value={editData.subject}
                                    onChange={e => setEditData({ ...editData, subject: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a' }}
                                    placeholder="e.g. Anatomy"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Description</label>
                                <textarea
                                    value={editData.description}
                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a' }}
                                    rows={3}
                                    placeholder="What is this room for?"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Access Control</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem',
                                    border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc', cursor: 'pointer'
                                }} onClick={() => toggleRole('senior')}>
                                    <input
                                        type="checkbox"
                                        checked={(editData.allowed_roles || []).includes('senior')}
                                        onChange={() => { }} // Handled by div click
                                        style={{ width: '1.2rem', height: '1.2rem' }}
                                    />
                                    <span style={{ fontWeight: 500, color: '#334155' }}>Restrict to Seniors & Admins Only</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    If unchecked, the room is public for all students.
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
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
