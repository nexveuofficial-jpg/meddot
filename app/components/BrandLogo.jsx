import LogoIcon from "./LogoIcon";


export default function BrandLogo({ size = "2rem", showIcon = true, subtitle = "", className = "" }) {
    // Gradient matching the "Meddot.online" aesthetic (Blue -> Cyan/Teal)
    const gradientStyle = {
        background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent", // Fallback
        fontWeight: 800,
        fontSize: size,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.75rem", // Increased gap for the wider M logo
        letterSpacing: "-0.03em"
    };

    return (
        <div className={className} style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <div style={gradientStyle}>
                {showIcon && <LogoIcon size={parseFloat(size) ? `calc(${size} * 1.2)` : size} />} 
                {/* Scale icon slightly up relative to text height */}
                Meddot
            </div>
            {subtitle && (
                <span style={{ 
                    fontSize: `calc(${size} * 0.4)`, 
                    color: "#64748b", 
                    fontWeight: 600, 
                    marginTop: "0.2rem",
                    marginLeft: showIcon ? `calc(${size} * 1.5)` : "0" // Approx alignment
                }}>
                    {subtitle}
                </span>
            )}
        </div>
    );
}

// Named export for the textual style only if needed elsewhere
export const brandGradientClass = {
    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: 800
};
