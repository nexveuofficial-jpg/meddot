"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useFeature } from "@/app/context/FeatureFlagContext";
import { supabase } from "@/lib/supabase";
import { UploadCloud, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import Loader from "../../components/ui/Loader";
import Link from "next/link";

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
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Uploads are currently disabled.</h2>
                <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Back to Dashboard</Link>
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
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <Link href="/notes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '2rem', textDecoration: 'none' }}>
                <ArrowLeft size={18} /> Back to Library
            </Link>

            <div style={{ background: "#fff", borderRadius: "1rem", padding: "2.5rem", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
                <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem", background: "linear-gradient(135deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Contribute Note
                    </h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Share your knowledge with the Meddot community.</p>
                </div>

                {error && (
                    <div style={{ padding: "1rem", background: "#fef2f2", color: "#ef4444", borderRadius: "0.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #fecaca" }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpload} style={{ display: "grid", gap: "1.5rem" }}>
                    {/* File Upload Zone */}
                    <div style={{
                        border: "2px dashed var(--border)",
                        borderRadius: "1rem",
                        padding: "3rem 1rem",
                        textAlign: "center",
                        cursor: "pointer",
                        background: file ? "#f0fdf4" : "transparent",
                        borderColor: file ? "#22c55e" : "var(--border)",
                        transition: "all 0.2s"
                    }} onClick={() => fileInputRef.current?.click()}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                            {file ? <FileText size={48} color="#22c55e" /> : <UploadCloud size={48} color="var(--muted-foreground)" />}
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{file ? file.name : "Click to select PDF"}</h3>
                                <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
                                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Max file size: 10MB"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Fields */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Cranial Nerves Summary"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Subject (Broad) *</label>
                            <select
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                style={inputStyle}
                                required
                            >
                                <option value="">Select Subject</option>
                                <optgroup label="First Year (Pre-Clinical)">
                                    <option value="Anatomy">Anatomy</option>
                                    <option value="Physiology">Physiology</option>
                                    <option value="Biochemistry">Biochemistry</option>
                                </optgroup>
                                <optgroup label="Second Year (Para-Clinical)">
                                    <option value="Pathology">Pathology</option>
                                    <option value="Pharmacology">Pharmacology</option>
                                    <option value="Microbiology">Microbiology</option>
                                    <option value="Forensic Medicine">Forensic Medicine</option>
                                </optgroup>
                                <optgroup label="Third Year">
                                    <option value="Community Medicine">Community Medicine</option>
                                    <option value="Ophthalmology">Ophthalmology</option>
                                    <option value="ENT">ENT</option>
                                </optgroup>
                                <optgroup label="Final Year (Clinical)">
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
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Topic / Sub-Category</label>
                        <input
                            type="text"
                            placeholder="e.g. Neuroanatomy, CVS, etc."
                            value={formData.category} // Storing specific topic in category
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Description</label>
                        <textarea
                            rows="3"
                            placeholder="Brief description of what this note covers..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        style={{
                            padding: "1rem",
                            borderRadius: "0.75rem",
                            background: "var(--foreground)",
                            color: "var(--background)",
                            fontWeight: 600,
                            fontSize: "1rem",
                            border: "none",
                            cursor: uploading ? "not-allowed" : "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginTop: "1rem",
                            opacity: uploading ? 0.7 : 1
                        }}
                    >
                        {uploading ? <>Uploading... <Loader size={20} /></> : "Submit Note"}
                    </button>

                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                        Note: All uploads are reviewed by Key Seniors or Admins before publishing.
                    </p>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    fontSize: "0.95rem",
    background: "var(--background)",
    color: "var(--foreground)"
};
