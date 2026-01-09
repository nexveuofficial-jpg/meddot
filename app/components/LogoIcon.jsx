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
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
            
            {/* The M Pulse Shape */}
            {/* Starts bottom left, goes up, down middle, up right, down right - forming an M, then transitions to a pulse and flat line ending in a dot */}
            {/* Actually, let's keep it simple: A Pulse line that looks like an M */}
            
            <path
                d="M4 16 H8 L12 6 L16 26 L20 6 L24 16 H26"
                stroke="url(#logoGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
            {/* The Dot at the end */}
            <circle cx="28" cy="16" r="3" fill="url(#logoGradient)" />
        </svg>
    );
}
