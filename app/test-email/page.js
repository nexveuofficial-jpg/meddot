"use client";
import { useState } from 'react';
import { sendEmail } from '../../lib/email';

export default function TestEmailPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Test Email from Meddot');
  const [html, setHtml] = useState('<h1>Hello!</h1><p>This is a test email from your Meddot application.</p>');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending...');

    try {
      const result = await sendEmail({ to, subject, html });
      if (result.error) {
        setStatus(`Error: ${JSON.stringify(result.error)}`);
      } else {
        setStatus('Email sent successfully!');
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Test Email Functionality</h1>
      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>To:</label>
          <input
            itemType="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: '#fff' }}
            placeholder="recipient@example.com"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Subject:</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>HTML Content:</label>
          <textarea
            required
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: '#fff' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            background: loading ? '#555' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>
      {status && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#333', borderRadius: '4px' }}>
          {status}
        </div>
      )}
    </div>
  );
}
