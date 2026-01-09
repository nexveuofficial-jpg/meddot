"use client";

import { useState } from "react";


export default function UploadForm({ onUpload }) {
    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        year: "1st Year",
        description: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.subject) return;

        // Pass visual data up
        onUpload({
            ...formData,
            id: Date.now().toString(), // Mock ID
            date: new Date().toLocaleDateString(),
            author: "Admin"
        });

        // Reset
        setFormData({
            title: "",
            subject: "",
            year: "1st Year",
            description: "",
        });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Note Title</label>
                <input
                    name="title"
                    className={styles.input}
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Cardiac Anatomy"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Subject</label>
                <select
                    name="subject"
                    className={styles.select}
                    value={formData.subject}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Subject</option>
                    <option value="Anatomy">Anatomy</option>
                    <option value="Physiology">Physiology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Pathology">Pathology</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Year</label>
                <select
                    name="year"
                    className={styles.select}
                    value={formData.year}
                    onChange={handleChange}
                >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                    name="description"
                    className={styles.textarea}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief details..."
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>File (Mock)</label>
                <input type="file" className={styles.input} disabled title="Upload disabled for prototype" />
            </div>

            <button type="submit" className={styles.submitButton}>Upload Note</button>
        </form>
    );
}
