"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLongLoadingMessage(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 500, marginBottom: '1rem' }}>Loading Meddot...</p>

        {showLongLoadingMessage && (
          <div style={{ maxWidth: '400px', animation: 'fadeIn 0.5s', color: '#dc2626', background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fee2e2' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Taking longer than expected?</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>We are having trouble connecting to the database. This usually means the Vercel Environment Variables are missing.</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.3rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Reload Page
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: "2rem",
      textAlign: "center",
      padding: "2rem"
    }}>
      <div style={{
        padding: "3rem",
        borderRadius: "1.5rem",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}>
        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: 800,
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em"
        }}>
          Meddot
        </h1>
        <p style={{
          fontSize: "1.25rem",
          color: "#64748b",
          maxWidth: "40ch",
          marginBottom: "2.5rem",
          lineHeight: 1.6
        }}>
          The community platform for medical students. <br />
          <span style={{ fontWeight: 600, color: "#0f172a" }}>Notes, Q&A, and Realtime Groups.</span>
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/login" style={{
            padding: "0.875rem 2rem",
            borderRadius: "1rem",
            border: "1px solid #e2e8f0",
            background: "white",
            color: "#0f172a",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.2s",
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
          }}>
            Login
          </Link>
          <Link href="/signup" style={{
            padding: "0.875rem 2rem",
            borderRadius: "1rem",
            background: "#0ea5e9",
            color: "white",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 6px -1px rgba(14, 165, 233, 0.3)",
            transition: "all 0.2s"
          }}>
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
