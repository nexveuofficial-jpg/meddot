"use client";

import Link from "next/link";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";

const getCategoryColor = (cat) => {
    switch(cat) {
        case 'Exam Strategy': return '#ef4444'; // Red
        case 'Anatomy': return '#ef4444'; // Red (as per user request)
        case 'Physiology': return '#3b82f6'; // Blue
        case 'Clinical Postings': return '#10b981'; // Emerald
        default: return 'var(--border)';
    }
};

export default function QuestionCard({ question, onUserClick }) {
    // Handle answers count structure depending on how it's fetched (array or count object)
    const answerCount = Array.isArray(question.answers)
        ? question.answers.length
        : (question.answers?.[0]?.count || 0);

    const categoryColor = getCategoryColor(question.category || question.subject);

    return (
        <Link
            href={`/ask-senior/${question.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            <div style={{
                background: "var(--card-bg)",
                padding: "1.5rem",
                borderRadius: "1rem",
                border: "1px solid var(--card-border)",
                borderLeft: `5px solid ${categoryColor}`, 
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
                        {question.subject || 'General'}
                    </span>
                    {question.is_resolved && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#16a34a' }}>
                            <CheckCircle size={14} /> Solved
                        </span>
                    )}
                </div>

                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.4 }}>
                    {question.title}
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {question.body}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                    <div
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: 'pointer', zIndex: 10 }}
                        onClick={(e) => {
                            e.preventDefault(); // Prevent Link navigation
                            e.stopPropagation();
                            onUserClick && onUserClick(question.author_id);
                        }}
                    >
                        <span style={{ textDecoration: 'underline' }}>
                            {question.profiles?.username || question.profiles?.full_name || question.author_name || 'Anonymous Student'}
                        </span>
                        {(question.profiles?.role === 'admin' || question.profiles?.role === 'senior') && (
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                background: question.profiles?.role === 'admin' ? '#fef3c7' : '#dbeafe',
                                color: question.profiles?.role === 'admin' ? '#b45309' : '#1e40af',
                                marginLeft: '0.25rem'
                            }}>
                                {question.profiles?.role}
                            </span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <MessageCircle size={14} /> {answerCount} answers
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
