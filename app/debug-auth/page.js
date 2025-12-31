"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// We re-create the client here to ensure we are testing the env vars directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function DebugAuthPage() {
    const [status, setStatus] = useState("Idle");
    const [clients, setClients] = useState({ url: null, key: null });
    const [supabase, setSupabase] = useState(null);

    useEffect(() => {
        setClients({
            url: supabaseUrl ? "Found ✅" : "Missing ❌",
            key: supabaseKey ? "Found ✅" : "Missing ❌"
        });

        if (supabaseUrl && supabaseKey) {
            const client = createClient(supabaseUrl, supabaseKey);
            setSupabase(client);
        }
    }, []);

    const createUser = async (email, password, role) => {
        if (!supabase) return;
        setStatus(`Creating ${email}...`);

        // 1. Sign Up
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: role === 'admin' ? 'Admin User' : 'Test Student' }
            }
        });

        if (error) {
            setStatus(`Error creating ${email}: ${error.message}`);
            return;
        }

        if (data?.user) {
            setStatus(`User ${email} created! ID: ${data.user.id}. Now setting role...`);

            // 2. We can't easily set the role here if RLS blocks us, 
            // but the signup might have triggered triggers. 
            // Let's try to update the profile if possible, or just inform user.

            // Note: Update profile only works if the user is logged in as themselves usually.
            // Since we just signed up, we MIGHT have a session if email confirmation is disabled.
            // If email confirmation is enabled, we can't do much.

            if (data.session) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ role: role })
                    .eq('id', data.user.id);

                if (profileError) {
                    setStatus(`User created, but failed to set role: ${profileError.message}`);
                } else {
                    setStatus(`Success! ${email} created and role set to ${role}.`);
                }
            } else {
                setStatus(`User ${email} created! Please check your email to confirm if required, or disable email confirmation in Supabase.`);
            }
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <h1>Auth Debugger</h1>

            <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
                <h3>Environment Variables</h3>
                <p><strong>URL:</strong> {clients.url}</p>
                <p><strong>Key:</strong> {clients.key}</p>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
                <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
                    <h3>1. Create Student</h3>
                    <p>Email: student@meddot.com <br /> Password: password</p>
                    <button
                        onClick={() => createUser("student@meddot.com", "password", "student")}
                        style={{ padding: "0.5rem 1rem", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Create Student
                    </button>
                </div>

                <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
                    <h3>2. Create Admin</h3>
                    <p>Email: admin@meddot.com <br /> Password: admin</p>
                    <button
                        onClick={() => createUser("admin@meddot.com", "admin", "admin")}
                        style={{ padding: "0.5rem 1rem", background: "#ff4d4f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Create Admin
                    </button>
                </div>
            </div>

            <div style={{ marginTop: "2rem", padding: "1rem", background: "#333", color: "#fff", borderRadius: "8px" }}>
                <strong>Status:</strong> {status}
            </div>

            <div style={{ marginTop: "2rem" }}>
                <a href="/login" style={{ color: "#0070f3", textDecoration: "underline" }}>&larr; Back to Login</a>
            </div>
        </div>
    );
}
