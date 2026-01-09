
import { useRef } from 'react';
import { CheckCheck, Reply } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';

export default function MessageBubble({ message, isOwn, onContextMenu, onReplyClick, onImageClick, onUserClick, style }) {
    let time = "";
    try {
        time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        time = "";
    }

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
        if (diff > 0 && diff < 80) {
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
            className={`flex flex-col mb-4 w-full group ${isOwn ? 'items-end' : 'items-start'}`}
            onContextMenu={(e) => onContextMenu(e, message)}
            style={style}
        >
            <div className={`flex items-end gap-2 max-w-[90%] md:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {!isOwn && (
                    <div onClick={() => onUserClick && onUserClick(message.user_id)} className="cursor-pointer mb-1">
                        <UserAvatar user={{ full_name: message.user_name, email: 'placeholder' }} size="28px" className="ring-2 ring-white/5" />
                    </div>
                )}

                <div 
                    ref={bubbleRef}
                    className={`
                        relative px-4 py-2.5 shadow-md flex-1 min-w-[60px] cursor-pointer
                        transition-all duration-200 ease-out select-none md:select-text
                        ${isOwn 
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-cyan-500/10' 
                            : 'bg-slate-800/80 backdrop-blur-md border border-white/10 text-slate-100 rounded-2xl rounded-tl-sm hover:bg-slate-800'
                        }
                    `}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Reply Indicator (Visible during swipe) */}
                    <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 text-slate-400 opacity-0 transition-opacity duration-200 -z-10">
                        <Reply size={20} />
                    </div>

                    {/* Reply Context */}
                    {message.reply_to && (
                        <div 
                            className={`
                                mb-2 p-2 rounded-lg text-xs cursor-pointer border-l-2 mb-2
                                ${isOwn 
                                    ? 'bg-black/20 border-white/30 text-white/90' 
                                    : 'bg-black/20 border-cyan-500/50 text-slate-300'
                                }
                            `}
                            onClick={(e) => {
                                e.stopPropagation();
                                onReplyClick(message.reply_to.id);
                            }}
                        >
                            <div className="font-bold mb-0.5 opacity-90 truncate">{message.reply_to.user_name}</div>
                            <div className="truncate opacity-75">{message.reply_to.content || 'Attachment'}</div>
                        </div>
                    )}

                    {/* Sender Name (Group Chat Only - Not for Own) */}
                    {!isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                             <span 
                                className="text-[10px] font-bold uppercase tracking-wide cursor-pointer hover:underline"
                                style={{ color: stringToColor(message.user_name) }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUserClick && onUserClick(message.user_id);
                                }}
                             >
                                {message.user_name}
                             </span>
                             {(message.role === 'admin' || message.role === 'senior') && (
                                <span className={`
                                    px-1 py-0.5 rounded-[4px] text-[8px] font-extrabold uppercase
                                    ${message.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}
                                `}>
                                    {message.role}
                                </span>
                             )}
                        </div>
                    )}

                    {/* Content */}
                    {message.image_url && (
                        <div className="mb-2 relative group-hover:brightness-110 transition-all rounded-lg overflow-hidden border border-black/10">
                            <img 
                                src={message.image_url} 
                                alt="Shared" 
                                className="max-w-full rounded-lg object-cover max-h-[300px]"
                                onClick={() => onImageClick && onImageClick(message.image_url)}
                            />
                        </div>
                    )}

                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                    </div>

                    {/* Metadata */}
                    <div className={`mt-1 flex items-center justify-end gap-1 ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
                        <span className="text-[10px] font-medium opacity-75">{time}</span>
                        {isOwn && <CheckCheck size={12} className="opacity-75" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to generate consistent colors from strings
function stringToColor(str) {
    if (!str) return '#9ca3af';
    const colors = ['#f472b6', '#fb7185', '#a78bfa', '#818cf8', '#60a5fa', '#34d399', '#facc15', '#fb923c'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
