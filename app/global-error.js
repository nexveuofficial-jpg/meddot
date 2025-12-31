"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error("Global application error:", error);
    }, [error]);

    return (
        <html>
            <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc', color: '#1e293b' }}>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: '#dc2626' }}>System Error</h1>
                        <p style={{ marginBottom: '2rem', color: '#64748b', lineHeight: '1.6' }}>
                            We encountered a critical error. This might be due to a network issue or an unexpected bug.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => reset()}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    transition: 'background 0.2s'
                                }}
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = "/"}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    background: 'white',
                                    color: '#1e293b',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Return Home
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <pre style={{ marginTop: '2rem', padding: '1rem', background: '#f1f5f9', borderRadius: '0.5rem', overflowX: 'auto', textAlign: 'left', fontSize: '0.8rem', color: '#ef4444' }}>
                                {error.message}
                            </pre>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
