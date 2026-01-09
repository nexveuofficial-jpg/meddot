
import { useRef } from 'react';
import { CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isOwn, onContextMenu, onReplyClick, onImageClick, onUserClick, style }) {
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

    const touchStart = useRef(0);
    const bubbleRef = useRef(null);

    const handleTouchStart = (e) => {
        touchStart.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e) => {
        if (!touchStart.current || !bubbleRef.current) return;
        const current = e.targetTouches[0].clientX;
        const diff = current - touchStart.current;

        // Limit swipe to right side only (positive diff) for reply
        if (diff > 0 && diff < 100) {
            bubbleRef.current.style.transform = `translateX(${diff}px)`;
        }
    };

    const handleTouchEnd = (e) => {
        if (!touchStart.current || !bubbleRef.current) return;
        const end = e.changedTouches[0].clientX;
        const distance = end - touchStart.current;

        if (distance > 50) {
            if (onReplyClick) onReplyClick(message.id);
        }

        if (bubbleRef.current) {
            bubbleRef.current.style.transform = 'translateX(0)';
        }
    };

    return (
        <div 
            className={`flex flex-col mb-4 w-full ${isOwn ? 'items-end' : 'items-start'}`}
            onContextMenu={(e) => onContextMenu(e, message)}
            style={style}
        >
            <div 
                ref={bubbleRef}
                className={`
                    max-w-[85%] md:max-w-[70%] lg:max-w-[60%] 
                    rounded-2xl px-5 py-3 shadow-md relative transition-transform duration-200 ease-out preserve-3d
                    ${isOwn 
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-800/80 backdrop-blur-sm border border-white/10 text-slate-100 rounded-tl-none hover:bg-slate-800 transition-colors'
                    }
                `}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Reply Context */}
                {message.reply_to && (
                    <div 
                        className={`
                            mb-2 p-2 rounded-lg text-xs cursor-pointer border-l-2
                            ${isOwn 
                                ? 'bg-white/10 border-white/50 text-white/90' 
                                : 'bg-slate-900/50 border-cyan-500/50 text-slate-300'
                            }
                        `}
                        onClick={() => onReplyClick(message.reply_to.id)}
                    >
                        <div className="font-bold mb-1 opacity-75">{message.reply_to.user_name}</div>
                        <div className="truncate opacity-75">{message.reply_to.content || 'Attachment'}</div>
                    </div>
                )}

                {/* Name (for others) */}
                {!isOwn && (
                    <div 
                        className="font-bold text-xs mb-1 cursor-pointer flex items-center hover:underline"
                        style={{ color: getNameColor(message.user_name) }}
                        onClick={() => onUserClick && onUserClick(message.user_id)}
                    >
                        {message.user_name}
                        {message.role === 'admin' && <span title="Admin" className="ml-1 text-yellow-400">★</span>}
                        {message.author_year && (
                            <span className="ml-2 px-1.5 py-0.5 text-[0.65rem] border border-slate-600 rounded bg-slate-700/50 text-slate-400">
                                {message.author_year} Yr
                            </span>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap break-words text-sm md:text-base leading-relaxed">
                    {message.content}
                </div>

                {/* Image Attachment */}
                {message.image_url && (
                    <div className="mt-2 mb-1">
                        <img
                            src={message.image_url}
                            alt="attachment"
                            className="max-w-full max-h-[300px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => onImageClick && onImageClick(message.image_url)}
                        />
                    </div>
                )}

                {/* Metadata */}
                <div className={`
                    flex items-center justify-end gap-1 mt-1 text-[0.65rem] font-medium
                    ${isOwn ? 'text-blue-100/70' : 'text-slate-400/70'}
                `}>
                    <span>{time}</span>
                    {message.is_edited && <span>(edited)</span>}
                    {isOwn && <CheckCheck size={14} className="opacity-80" />}
                </div>
            </div>
        </div>
    );
}
