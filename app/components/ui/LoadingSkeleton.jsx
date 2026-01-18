import styles from './LoadingSkeleton.module.css';

export function NoteCardSkeleton() {
    return (
        <div className={styles.cardSkeleton}>
            {/* Top Accent */}
            <div className={styles.skeleton} style={{ height: "4px", borderRadius: "2px", width: "100%", marginBottom: "0.5rem" }} />

            {/* Header: Badge & Bookmark */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                <div className={`${styles.skeleton} ${styles.badge}`} />
                <div className={`${styles.skeleton}`} style={{ width: 28, height: 28, borderRadius: '50%' }} />
            </div>

            {/* Title */}
            <div style={{ margin: "0.5rem 0" }}>
                <div className={`${styles.skeleton} ${styles.title}`} />
                <div className={`${styles.skeleton} ${styles.title}`} style={{ width: '60%' }} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "1rem" }}>
                <div className={`${styles.skeleton} ${styles.desc}`} />
                <div className={`${styles.skeleton} ${styles.desc}`} style={{ width: '80%' }} />
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <div className={`${styles.skeleton} ${styles.iconText}`} />
                <div className={`${styles.skeleton} ${styles.iconText}`} />
            </div>
        </div>
    );
}

// ... existing code ...

export function SidebarSkeleton() {
    return (
        <div className="space-y-4 p-4">
             {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className={`${styles.skeleton}`} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                    <div className="flex-1 space-y-2">
                        <div className={`${styles.skeleton}`} style={{ width: '60%', height: 16, borderRadius: 4 }} />
                        <div className={`${styles.skeleton}`} style={{ width: '40%', height: 12, borderRadius: 4 }} />
                    </div>
                </div>
             ))}
        </div>
    );
}

// ... existing SkeletonGrid ...
export function SkeletonGrid({ count = 8 }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "2rem",
            paddingTop: "2rem"
        }}>
            {Array(count).fill(0).map((_, i) => (
                <NoteCardSkeleton key={i} />
            ))}
        </div>
    );
}
