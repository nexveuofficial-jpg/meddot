"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FocusTimer() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState("focus"); // focus, shortBreak, longBreak

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            new Audio('/sounds/bell.mp3').play().catch(e => console.log("Audio play failed", e));
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (mode === "focus") setTimeLeft(25 * 60);
        else if (mode === "shortBreak") setTimeLeft(5 * 60);
        else setTimeLeft(15 * 60);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        if (newMode === "focus") setTimeLeft(25 * 60);
        else if (newMode === "shortBreak") setTimeLeft(5 * 60);
        else setTimeLeft(15 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
            color: "#333",
            position: "relative",
            fontFamily: "var(--font-geist-sans), sans-serif"
        }}>
            {/* Header / Exit */}
            <div style={{ position: "absolute", top: "2rem", left: "2rem" }}>
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#64748b",
                        fontSize: "0.9rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "2rem",
                        background: "white",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all 0.2s"
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    Exit Focus Mode
                </button>
            </div>

            {/* Mode Switcher */}
            <div style={{
                display: "flex",
                background: "white",
                padding: "0.25rem",
                borderRadius: "2rem",
                marginBottom: "3rem",
                boxShadow: "var(--shadow-sm)"
            }}>
                {[
                    { id: "focus", label: "Focus" },
                    { id: "shortBreak", label: "Short Break" },
                    { id: "longBreak", label: "Long Break" }
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => switchMode(m.id)}
                        style={{
                            padding: "0.5rem 1.25rem",
                            borderRadius: "1.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            color: mode === m.id ? "white" : "#64748b",
                            background: mode === m.id ? "var(--primary)" : "transparent",
                            transition: "all 0.2s ease"
                        }}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div style={{ position: "relative", marginBottom: "3rem", textAlign: "center" }}>
                <div style={{
                    fontSize: "8rem",
                    fontWeight: "200",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    color: "#1e293b",
                    textShadow: "0 4px 10px rgba(0,0,0,0.05)"
                }}>
                    {formatTime(timeLeft)}
                </div>
                <div style={{
                    marginTop: "1rem",
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    opacity: isActive ? 1 : 0.5,
                    transition: "opacity 0.3s"
                }}>
                    {isActive ? "Timer Running" : "Ready"}
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        width: "4.5rem",
                        height: "4.5rem",
                        borderRadius: "50%",
                        background: isActive ? "white" : "var(--primary)",
                        color: isActive ? "var(--primary)" : "white",
                        border: isActive ? "2px solid var(--border)" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "var(--shadow-lg)",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                >
                    {isActive ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    )}
                </button>

                <button
                    onClick={resetTimer}
                    style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "50%",
                        background: "white",
                        color: "#64748b",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "var(--shadow-sm)"
                    }}
                    title="Reset"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
            </div>

            <p style={{ position: "absolute", bottom: "2rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                Stay focused. Take breaks.
            </p>
        </div>
    );
}
