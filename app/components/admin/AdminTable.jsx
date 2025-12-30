"use client";

import styles from "../../admin/AdminDashboard.module.css";

export default function AdminTable({ notes, onDelete }) {
    if (!notes || notes.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1rem", opacity: 0.5 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="18"></line>
                </svg>
                <p>No notes uploaded yet.</p>
                <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "0.5rem" }}>Use the form to add your first note.</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Year</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notes.map((note) => {
                        const isNew = new Date(note.date).toDateString() === new Date().toDateString();

                        return (
                            <tr key={note.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{note.title}</div>
                                    {isNew && <span className={`${styles.badge} ${styles.badgeNew}`} style={{ marginTop: "0.25rem" }}>New</span>}
                                </td>
                                <td>{note.subject}</td>
                                <td>{note.year}</td>
                                <td style={{ color: "var(--muted-foreground)" }}>{note.date}</td>
                                <td>
                                    <button
                                        onClick={() => onDelete(note.id)}
                                        className={styles.deleteButton}
                                        title="Delete Note"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
