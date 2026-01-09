"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { supabase } from "@/lib/supabase";
import { UploadCloud, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import Loader from "../../components/ui/Loader";
import Link from "next/link";
import GlassCard from "@/app/components/ui/GlassCard";
import GlassButton from "@/app/components/ui/GlassButton";
import GlassInput from "@/app/components/ui/GlassInput";

export default function UploadNotePage() {
    const { user, profile } = useAuth();
    const { isEnabled } = useFeature();
    const router = useRouter();

    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        category: "", // Default empty
        description: ""
    });
    const [error, setError] = useState("");

    // Gate access
    if (!isEnabled('enable_uploads') && user?.role !== 'admin') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Uploads are currently disabled.</h2>
                <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "application/pdf") {
            setFile(selected);
            setError("");
        } else {
            setFile(null);
            setError("Only PDF files are allowed.");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        console.log("Handle Upload Triggered", formData);

        if (!file || !formData.title || !formData.subject) {
            const msg = "Please fill in all required fields (Title, Subject) and select a PDF file.";
            setError(msg);
            alert(msg);
            return;
        }

        setUploading(true);
        setError("");

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`; // Folder structure: user_id/filename

            const { error: uploadError } = await supabase.storage
                .from('notes_documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('notes_documents')
                .getPublicUrl(filePath);

            const userRole = profile?.role || 'student';
            const status = userRole === 'admin' || userRole === 'senior' ? 'published' : 'pending';

            // 2. Insert into Supabase DB
            const { error: dbError } = await supabase.from("notes").insert([{
                title: formData.title,
                description: formData.description,
                subject: formData.subject,
                category: formData.category,
                file_path: filePath,
                file_url: publicUrl,
                author_id: user.id, // Fixed: DB expects author_id
                author_name: profile?.full_name || user?.email || 'Anonymous',
                status: status,
                author_role: userRole,
                created_at: new Date().toISOString()
            }]);

            if (dbError) throw dbError;

            // Success
            alert("Note uploaded successfully!");

            if (status === 'published') {
                router.push("/notes");
            } else {
                router.push("/notes"); // Or maybe dashboard saying pending
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <Link href="/notes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={18} /> Back to Library
            </Link>

            <GlassCard className="p-8 border-slate-700/50 bg-slate-900/60 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Contribute Note
                    </h1>
                    <p className="text-slate-400">Share your knowledge with the Meddot community.</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 mb-6">
                        <AlertCircle size={20} className="shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-6">
                    {/* File Upload Zone */}
                    <div 
                        className={`
                            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                            ${file 
                                ? 'bg-green-500/5 border-green-500/50' 
                                : 'bg-slate-900/40 border-slate-700 hover:border-slate-600 hover:bg-slate-900/60'}
                        `}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-4">
                            {file ? (
                                <FileText size={48} className="text-green-500" />
                            ) : (
                                <UploadCloud size={48} className="text-slate-500" />
                            )}
                            <div>
                                <h3 className={`text-lg font-semibold ${file ? 'text-green-400' : 'text-slate-300'}`}>
                                    {file ? file.name : "Click to select PDF"}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Max file size: 10MB"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Title *</label>
                            <GlassInput
                                type="text"
                                placeholder="e.g. Cranial Nerves Summary"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="bg-slate-900/80 border-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Subject (Broad) *</label>
                            <select
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                required
                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all appearance-none"
                            >
                                <option value="" className="bg-slate-900">Select Subject</option>
                                <optgroup label="First Year (Pre-Clinical)" className="bg-slate-900">
                                    <option value="Anatomy">Anatomy</option>
                                    <option value="Physiology">Physiology</option>
                                    <option value="Biochemistry">Biochemistry</option>
                                </optgroup>
                                <optgroup label="Second Year (Para-Clinical)" className="bg-slate-900">
                                    <option value="Pathology">Pathology</option>
                                    <option value="Pharmacology">Pharmacology</option>
                                    <option value="Microbiology">Microbiology</option>
                                    <option value="Forensic Medicine">Forensic Medicine</option>
                                </optgroup>
                                <optgroup label="Third Year" className="bg-slate-900">
                                    <option value="Community Medicine">Community Medicine</option>
                                    <option value="Ophthalmology">Ophthalmology</option>
                                    <option value="ENT">ENT</option>
                                </optgroup>
                                <optgroup label="Final Year (Clinical)" className="bg-slate-900">
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="General Surgery">General Surgery</option>
                                    <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Anesthesiology">Anesthesiology</option>
                                    <option value="Radiology">Radiology</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Topic / Sub-Category</label>
                        <GlassInput
                            type="text"
                            placeholder="e.g. Neuroanatomy, CVS, etc."
                            value={formData.category} // Storing specific topic in category
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="bg-slate-900/80 border-slate-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                        <textarea
                            rows="3"
                            placeholder="Brief description of what this note covers..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-500 resize-none"
                        />
                    </div>

                    <GlassButton
                        type="submit"
                        disabled={uploading}
                        className="w-full"
                        variant="primary"
                        loading={uploading}
                    >
                        {uploading ? "Uploading..." : "Submit Note"}
                    </GlassButton>

                    <p className="text-xs text-slate-500 text-center">
                        Note: All uploads are reviewed by Key Seniors or Admins before publishing.
                    </p>
                </form>
            </GlassCard>
        </div>
    );
}
