import { useEffect, useRef } from 'react';
import { Reply, Copy, Trash2, Edit } from 'lucide-react';

export default function ContextMenu({ x, y, options, onClose }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Adjust position to not go off screen (basic logic)
    const style = {
        top: y,
        left: x,
    };

    // Simple boundary check could be added here

    return (
        <div className="context-menu-overlay" onClick={onClose}> {/* Overlay for easier closing */}
            <div
                ref={menuRef}
                className="context-menu glass"
                style={style}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking menu
            >
                {options.map((opt, idx) => (
                    <div
                        key={idx}
                        className={`context-menu-item ${opt.danger ? 'danger' : ''}`}
                        onClick={() => { opt.action(); onClose(); }}
                    >
                        {opt.icon}
                        <span>{opt.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
