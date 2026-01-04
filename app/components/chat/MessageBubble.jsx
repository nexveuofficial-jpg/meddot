
import { CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isOwn, onContextMenu, onReplyClick, style }) {
    let time = "";
    try {
        time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        time = "Invalid Time";
    }


    // Determine colors for names (simple hash function for consistency)
    const getNameColor = (name) => {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
            '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div
            id={`msg-${message.id}`}
            className={`msg-row ${isOwn ? 'own' : 'other'}`}
            onContextMenu={(e) => onContextMenu(e, message)}
            style={{ paddingLeft: isOwn ? '20%' : '0', paddingRight: isOwn ? '0' : '20%', ...style }}
        >
            <div className={`msg-bubble ${isOwn ? 'own' : 'other'}`}>

                {/* Reply Snippet */}
                {message.reply_to && (
                    <div className="msg-reply-snippet" onClick={() => onReplyClick(message.reply_to.id)}>
                        <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{message.reply_to.user_name}</div>
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {message.reply_to.content}
                        </div>
                    </div>
                )}

                {/* Name (for others) */}
                {!isOwn && (
                    <div style={{
                        color: getNameColor(message.user_name),
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        marginBottom: '2px',
                        cursor: 'pointer'
                    }}>
                        {message.user_name}
                        {message.role === 'admin' && <span title="Admin" style={{ marginLeft: '4px' }}>★</span>}
                    </div>
                )}

                {/* Content */}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                </div>

                {/* Meta (Time + Status) */}
                <div className="msg-meta">
                    {message.is_edited && <span style={{ marginRight: '2px' }}>edited</span>}
                    <span>{time}</span>
                    {isOwn && (
                        <span style={{ marginLeft: '2px' }}>
                            <CheckCheck size={14} strokeWidth={2.5} /> {/* Assuming read receipt later, for now just tick */}
                        </span>
                    )}
                </div>

                {/* Tail Graphic (CSS shapes) */}
                {/* Note: Logic handled by CSS class 'msg-bubble own/other' mostly, 
                    but we can add an SVG here for pixel perfect telegram tail if we wanted. 
                    For now, CSS border radius hacks in telegram.css are used.
                */}
            </div>
        </div>
    );
}
