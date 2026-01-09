"use client";

import { useState } from "react";

export default function UploadForm({ onUpload }) {
    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        year: "1st Year",
        description: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.subject) return;

        // Pass visual data up
        onUpload({
            ...formData,
            id: Date.now().toString(), // Mock ID
            date: new Date().toLocaleDateString(),
            author: "Admin"
        });

        // Reset
        setFormData({
            title: "",
            subject: "",
            year: "1st Year",
            description: "",
        });
    };

    const inputBaseStyle = "bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-400";

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-400">Note Title</label>
                <input
                    name="title"
                    className={inputBaseStyle}
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Cardiac Anatomy"
                    required
                />
            </div>

            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-400">Subject</label>
                <select
                    name="subject"
                    className={inputBaseStyle}
                    value={formData.subject}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Subject</option>
                    <option value="Anatomy">Anatomy</option>
                    <option value="Physiology">Physiology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Pathology">Pathology</option>
                </select>
            </div>

            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-400">Year</label>
                <select
                    name="year"
                    className={inputBaseStyle}
                    value={formData.year}
                    onChange={handleChange}
                >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                </select>
            </div>

            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea
                    name="description"
                    className={`${inputBaseStyle} min-h-[100px]`}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief details..."
                />
            </div>

            <div className="flex flex-col space-y-2 opacity-60">
                <label className="text-sm font-medium text-slate-400">File (Mock)</label>
                <input 
                    type="file" 
                    className="bg-slate-900/80 border border-slate-700 rounded-lg p-2 text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-not-allowed" 
                    disabled 
                    title="Upload disabled for prototype" 
                />
            </div>

            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 mt-4"
            >
                Upload Note
            </button>
        </form>
    );
}
