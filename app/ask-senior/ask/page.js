"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function AskQuestionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        content: "",
        topic: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);

        const { error } = await supabase.from('questions').insert({
            content: formData.content,
            topic: formData.topic,
            author_id: user.id
        });

        setSubmitting(false);

        if (error) {
            alert("Error posting question: " + error.message);
        } else {
            router.push('/ask-senior');
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/ask-senior" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={18} />
                Back to Q&A
            </Link>

            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Ask a Question</h1>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
                    Seniors are here to help. Keep your question clear and concise.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Topic</label>
                        <select
                            required
                            value={formData.topic}
                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white' }}
                        >
                            <option value="">Select a Topic</option>
                            <option>Exam Prep</option>
                            <option>Clinical Skills</option>
                            <option>Career Guidance</option>
                            <option>Research</option>
                            <option>General Advice</option>
                            <option>Subject Specific</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Your Question</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="Type your question here..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                        />
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
                        {submitting ? 'Posting...' : 'Post Question'}
                    </button>
                </form>
            </div>
        </div>
    );
}
