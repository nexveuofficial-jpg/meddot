import { Shield } from "lucide-react";

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
        gap: "0.5rem",
        letterSpacing: "-0.03em"
    };

    const iconStyle = {
        color: "#3b82f6", // Fallback color or match gradient start
        // To make icon gradient is harder with SVG, usually fill with url(#gradient) or plain color.
        // Let's stick to a solid blue/cyan that matches.
        color: "#0ea5e9" 
    };

    return (
        <div className={className} style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <div style={gradientStyle}>
                {showIcon && <Shield size={parseFloat(size) * 16 || 24} style={iconStyle} strokeWidth={2.5} />}
                Meddot
            </div>
            {subtitle && (
                <span style={{ 
                    fontSize: `calc(${size} * 0.4)`, 
                    color: "#64748b", 
                    fontWeight: 600, 
                    marginTop: "0.2rem",
                    marginLeft: showIcon ? "2.5rem" : "0" // Align with text if icon exists
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
