export default function LogoIcon({ size = 24, className = "", style = {} }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
        >
            <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan-400 */}
                    <stop offset="100%" stopColor="#2563eb" /> {/* Blue-600 */}
                </linearGradient>
            </defs>
            
            {/* The "M" Shape (Matching app/icon.tsx logic but in SVG) */}
            {/* A thick, modern M. */}
            <path
                d="M6 26 V6 L16 16 L26 6 V26"
                stroke="url(#logoGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
