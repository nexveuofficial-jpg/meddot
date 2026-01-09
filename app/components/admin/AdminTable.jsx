"use client";

import { Trash2 } from "lucide-react";

export default function AdminTable({ notes, onDelete }) {
    if (!notes || notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white/5 rounded-xl border border-dashed border-white/10">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="18"></line>
                </svg>
                <p className="font-medium">No notes uploaded yet.</p>
                <p className="text-sm opacity-70 mt-1">Use the form to add your first note.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/5">
                    <tr>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Title</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Subject</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Year</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">Date</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {notes.map((note) => {
                        const isNew = new Date(note.date).toDateString() === new Date().toDateString();

                        return (
                            <tr key={note.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-semibold text-white">{note.title}</div>
                                    {isNew && <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wide">New</span>}
                                </td>
                                <td className="p-4 text-sm text-slate-300">{note.subject}</td>
                                <td className="p-4 text-sm text-slate-300">{note.year}</td>
                                <td className="p-4 text-sm text-slate-400 font-mono">{note.date}</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => onDelete(note.id)}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Note"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
