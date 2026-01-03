import styles from './LoadingSkeleton.module.css';

export function NoteCardSkeleton() {
    return (
        <div className={styles.cardSkeleton}>
            {/* Top Accent */}
            <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px" }} />

            {/* Header: Badge & Bookmark */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className={`${styles.skeleton} ${styles.badge}`} />
                <div className={`${styles.skeleton}`} style={{ width: 18, height: 18, borderRadius: '50%' }} />
            </div>

            {/* Title */}
            <div>
                <div className={`${styles.skeleton} ${styles.title}`} />
                <div className={`${styles.skeleton} ${styles.title}`} style={{ width: '60%' }} />
            </div>

            {/* Description */}
            <div>
                <div className={`${styles.skeleton} ${styles.desc}`} />
                <div className={`${styles.skeleton} ${styles.desc}`} />
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
