"use client";
import { useState } from 'react';
import { sendEmail } from '../lib/email';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function ContactPage() {
    const { user, profile } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus("Sending...");

        const userEmail = user?.email || "Anonymous";
        const userName = profile?.full_name || "Unknown User";
        
        // Construct the email content
        const emailHtml = `
            <h2>New Contact Message from Meddot App</h2>
            <p><strong>From:</strong> ${userName} (${userEmail})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        try {
            const result = await sendEmail({
                to: 'nexveuofficial@gmail.com', // YuZii
                subject: `Meddot Contact: ${subject}`,
                html: emailHtml
            });

            if (result.error) {
                console.error("Email error:", result.error);
                setStatus("Error sending message. Please try again later or email directly.");
            } else {
                setStatus("Message sent successfully! We will get back to you soon.");
                setSubject('');
                setMessage('');
            }
        } catch (err) {
            console.error(err);
            setStatus("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <BrandLogo size="2.5rem" />
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0' }}>Contact Us</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Have a question, feedback, or feature request? We'd love to hear from you.
                </p>
            </div>

            <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '1rem', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>Direct Contact:</p>
                    <p style={{ color: '#64748b' }}>
                        You can also email us directly at <a href="mailto:nexveuofficial@gmail.com" style={{ color: '#0ea5e9', fontWeight: 500 }}>nexveuofficial@gmail.com</a> (YuZii).
                    </p>
                </div>

                <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>
                            Subject
                        </label>
                        <input 
                            type="text" 
                            required
                            placeholder="Feature Request: Dark Mode"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '0.75rem', 
                                borderRadius: '0.5rem', 
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                fontSize: '1rem'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>
                            Message
                        </label>
                        <textarea 
                            required
                            placeholder="Tell us what's on your mind..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            style={{ 
                                width: '100%', 
                                padding: '0.75rem', 
                                borderRadius: '0.5rem', 
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            padding: '1rem',
                            background: loading ? '#94a3b8' : '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                    
                    {status && (
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '0.5rem', 
                            background: status.includes('success') ? '#f0fdf4' : '#fef2f2',
                            color: status.includes('success') ? '#166534' : '#991b1b',
                            border: `1px solid ${status.includes('success') ? '#bbf7d0' : '#fecaca'}`,
                            textAlign: 'center'
                        }}>
                            {status}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
