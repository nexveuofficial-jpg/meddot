import styles from "./DashboardCard.module.css";

export default function DashboardCard({ title, description, icon, accentColor, delay = 0 }) {
    // accentColor should be a hex or css var string suitable for specific manipulation if needed
    // For simplicity, we'll pass it as a CSS variable to the style

    // We'll generate a lighter background version of the accent
    // Note: manipulating hex in JS strictly for minimal dependency is complex, 
    // so we'll assume accentColor is provided as a specific color value 
    // and we might rely on opacity in CSS or predefined utility classes if we had them.
    // Instead, let's use the provided accentColor directly for the icon/border.

    const cardStyle = {
        "--card-accent": accentColor,
        "--card-accent-bg": `${accentColor}20`, // Simple hex opacity hack (requires 6-digit hex)
        animationDelay: `${delay}s`
    };

    return (
        <div className={styles.cardContainer}>
            <div className={styles.card} style={cardStyle}>
                <div className={styles.iconWrapper}>
                    {icon}
                </div>
                <div>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>
        </div>
    );
}
