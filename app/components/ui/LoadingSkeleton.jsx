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

// Grid wrapper for convenience
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
