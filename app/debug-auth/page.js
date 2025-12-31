"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugAuth() {
    const [status, setStatus] = useState("Testing connection...");
    const [envCheck, setEnvCheck] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkConnection = async () => {
            // Check Env Vars (safely)
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            setEnvCheck({
                hasUrl: !!url,
                urlPrefix: url ? url.substring(0, 8) + "..." : "MISSING",
                hasKey: !!key,
                keyLen: key ? key.length : 0
            });

            if (!supabase) {
                setStatus("FAILED: Supabase client is null.");
                return;
            }

            const start = Date.now();
            try {
                // Try a simple public query (or auth check)
                const { error: authError } = await supabase.auth.getSession();
                if (authError) throw authError;

                setStatus(`SUCCESS: Connection established in ${Date.now() - start}ms`);
            } catch (err) {
                console.error(err);
                setStatus("FAILED: " + err.message);
                setError(err);
            }
        };

        checkConnection();
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Supabase Connectivity Diagnostic</h1>
            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <strong>Status:</strong> <span style={{ color: status.includes("SUCCESS") ? "green" : "red" }}>{status}</span>
            </div>

            <h3>Environment Variables</h3>
            <pre>{JSON.stringify(envCheck, null, 2)}</pre>

            {error && (
                <div style={{ marginTop: '1rem', color: 'red' }}>
                    <strong>Full Error:</strong>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            <div style={{ marginTop: '2rem' }}>
                <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login</a>
            </div>
        </div>
    );
}
