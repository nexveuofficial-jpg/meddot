"use client";

import Link from "next/link";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";
// No other imports


export default function QuestionCard({ question }) {
    return (
        <Link
            href={`/ask-senior/${question.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "1rem",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--primary)",
                        background: "var(--accent)",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "99px"
                    }}>
                        {question.topic}
                    </span>
                    {question.status === 'closed' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#16a34a' }}>
                            <CheckCircle size={14} /> Solved
                        </span>
                    )}
                </div>

                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.4 }}>
                    {question.content}
                </h3>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {/* Avatar could go here */}
                        <span>{question.profiles?.full_name || 'Anonymous Student'}</span>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <MessageCircle size={14} /> {question.answers?.length || 0} answers
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={14} /> {new Date(question.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
