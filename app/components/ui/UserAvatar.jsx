"use client";

import { useMemo } from 'react';

/**
 * Reusable Avatar Component
 * Prioritizes:
 * 1. props.src (Manual override)
 * 2. props.user?.avatar_url (From profile object usually passed as 'user' or 'profile')
 * 3. props.user?.user_metadata?.avatar_url (From Auth metadata)
 * 4. Fallback to Initials
 * 
 * @param {Object} props
 * @param {Object} props.user - User or Profile object. Should try to contain full_name, email, avatar_url.
 * @param {string} [props.src] - Direct URL to image.
 * @param {string} [props.size] - Size in pixels (default 40px) or CSS value.
 * @param {string} [props.className]
 */
export default function UserAvatar({ user, src, size = "40px", className = "" }) {
    
    const avatarUrl = useMemo(() => {
        if (src) return src;
        // Check for direct avatar_url property (common in profile tables)
        if (user?.avatar_url) return user.avatar_url;
        // Check for nested metadata (supabase auth object)
        if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
        return null;
    }, [user, src]);

    const initials = useMemo(() => {
        const name = user?.full_name || user?.user_metadata?.full_name || user?.email || "?";
        return name.charAt(0).toUpperCase();
    }, [user]);

    // Cache-busting: If it's a supabase storage URL, we might want to ensure it doesn't cache stale versions if re-uploaded with same name.
    // However, usually we upload with unique names or rely on standard caching. 
    // If the user replaces the image but keeps the same URL (upsert), cache busting ?t=... is needed.
    // Our upload logic uses unique filenames `${user.id}-${Math.random()}`, so cache busting shouldn't be a huge issue unless we change strategy.
    // But let's add a simple check if it looks like a supbase storage url. 
    // Actually, simple unique filenames are safer. Let's stick to the URL provided.

    const sizeStyle = {
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: `calc(${String(size).replace("px", "")} * 0.4)` // Dynamic font size ~40% of container
    };

    if (avatarUrl) {
        return (
            <div className={className} style={{ ...sizeStyle, borderRadius: "50%", overflow: "hidden", position: "relative", backgroundColor: "#e2e8f0" }}>
                <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    onError={(e) => {
                        e.target.style.display = 'none'; // Hide broken image
                        e.target.parentElement.classList.add('broken-image-fallback'); // CSS hook if needed
                        // Note: A true fallback to initials requires state, which complicates this simple component.
                        // For now we assume if URL exists it's valid.
                    }}
                />
            </div>
        );
    }

    // Fallback
    return (
        <div 
            className={className} 
            style={{ 
                ...sizeStyle, 
                borderRadius: "50%", 
                background: "var(--accent, #e0f2fe)", 
                color: "var(--primary, #0284c7)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontWeight: 700,
                userSelect: 'none'
            }}
        >
            {initials}
        </div>
    );
}
