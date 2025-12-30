"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function UploadNotePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        description: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);

        const { error } = await supabase.from('notes').insert({
            title: formData.title,
            subject: formData.subject,
            description: formData.description,
            author_id: user.id,
            status: 'pending'
        });

        setSubmitting(false);

        if (error) {
            alert("Error uploading note: " + error.message);
        } else {
            alert("Note submitted for review!");
            router.push('/notes');
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/notes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={18} />
                Back to Library
            </Link>

            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Upload Note</h1>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
                    Share your knowledge with the community. All notes are reviewed by admins before publishing.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Cranial Nerves Summary"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Subject</label>
                            <select
                                required
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white' }}
                            >
                                <option value="">Select a Subject</option>
                                <option>Anatomy</option>
                                <option>Physiology</option>
                                <option>Biochemistry</option>
                                <option>Pharmacology</option>
                                <option>Pathology</option>
                                <option>Microbiology</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description / Summary</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Brief description of what this note covers..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                        />
                    </div>

                    <div style={{ background: 'var(--muted)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                        PDF Upload is disabled for this prototype. (Metadata only)
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {submitting && <Loader2 className="animate-spin" size={20} />}
                        {submitting ? 'Submitting...' : 'Submit to Community'}
                    </button>
                </form>
            </div>
        </div>
    );
}
