"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { User, Users, Shield, GraduationCap } from "lucide-react";
import Loader from "../ui/Loader";
import { motion } from "framer-motion";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching users:", error);
            } else {
                setUsers(data || []);
            }
        } catch (error) {
            console.error("Crash fetching users:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [actionLoading, setActionLoading] = useState(null);

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

    if (loading) return <div className="p-8 flex justify-center"><Loader /></div>;

    return (
        <div className="bg-[#1F2937]/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:col-span-1 max-h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users size={20} className="text-cyan-400" />
                User Database <span className="text-slate-500 text-sm font-normal">({users.length})</span>
            </h2>
            
            <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0F1623] z-10 shadow-sm">
                        <tr>
                            <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">User</th>
                            <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Role</th>
                            <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((u, index) => (
                            <motion.tr
                                key={u.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group hover:bg-white/5 transition-colors"
                            >
                                <td className="p-3">
                                    <div className="font-semibold text-white text-sm">{u.full_name || 'Unknown'}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-0.5 max-w-[120px] truncate" title={u.email}>{u.email}</div>
                                </td>
                                <td className="p-3">
                                    <span className={`
                                        px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                                        ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                          u.role === 'senior' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                                          'bg-slate-700/30 text-slate-400 border-slate-600/30'}
                                    `}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => updateRole(u.id, 'admin')}
                                                className="p-1.5 rounded bg-white/5 hover:bg-amber-500/20 hover:text-amber-500 transition-colors"
                                                title="Promote to Admin"
                                            >
                                                <Shield size={14} />
                                            </button>
                                        )}
                                        {u.role !== 'senior' && (
                                            <button
                                                onClick={() => updateRole(u.id, 'senior')}
                                                className="p-1.5 rounded bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                                                title="Make Senior"
                                            >
                                                <GraduationCap size={14} />
                                            </button>
                                        )}
                                        {u.role !== 'student' && (
                                            <button
                                                onClick={() => updateRole(u.id, 'student')}
                                                className="p-1.5 rounded bg-white/5 hover:bg-slate-500/20 hover:text-slate-400 transition-colors"
                                                title="Demote to Student"
                                            >
                                                <User size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
