"use client";

export default function Loader({ fullScreen = false, size = 48, className = "" }) {
    return (
        <div
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: fullScreen ? 'fixed' : 'relative',
                inset: fullScreen ? 0 : 'auto',
                zIndex: fullScreen ? 9999 : 'auto',
                background: fullScreen ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
                backdropFilter: fullScreen ? 'blur(4px)' : 'none',
            }}
        >
            <div className="svg-loader">
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ overflow: 'visible' }}
                >
                    {/* Glow Filter */}
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Outer Static track (optional, low opacity) */}
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeOpacity="0.1"
                    />

                    {/* Animated Ring */}
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="var(--primary, #3b82f6)" /* Fallback blue if var missing */
                        strokeWidth="4"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        className="spinner-ring"
                    />
                </svg>
            </div>
        </div>
    );
}
