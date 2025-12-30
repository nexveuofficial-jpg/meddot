"use client";

"use client";

import { useAuth } from "@/app/context/AuthContext";
import styles from "./AdminDashboard.module.css";
import AdminFeatures from "../components/admin/AdminFeatures";
import AdminUsers from "../components/admin/AdminUsers";
import AdminNotes from "../components/admin/AdminNotes";
import AdminAnnouncements from "../components/admin/AdminAnnouncements";
// UploadForm logic will be moved to Student Dashboard or Admin "Add Note" modal later

export default function AdminPage() {
    const { logout, user } = useAuth();

    // Safety check if not admin (though layout handles this mostly)
    if (user?.role !== 'admin') {
        // return <div className="p-10 text-center">Access Restricted</div>; 
        // Allow for now since simulated role might lag, or handle better
    }

    return (
        <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
            <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "3rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid var(--border)"
            }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--foreground)", marginBottom: "0.5rem" }}>Admin Command Center</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Welcome back, {user?.full_name || 'Admin'}</p>
                </div>
                <button
                    onClick={logout}
                    style={{
                        padding: "0.75rem 1.5rem",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        background: "white",
                        color: "var(--foreground)",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all 0.2s"
                    }}
                >
                    Logout
                </button>
            </header>

            <div className={styles.grid}>
                {/* Left Column: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <AdminFeatures />
                    <AdminAnnouncements />
                    <AdminUsers />
                </div>

                {/* Right Column: Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <AdminNotes />
                </div>
            </div>
        </div>
    );
}
