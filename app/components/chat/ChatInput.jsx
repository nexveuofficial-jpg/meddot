import { useState, useRef, useEffect } from 'react';
import { Send, X, Paperclip, Mic } from 'lucide-react';

export default function ChatInput({ onSend, replyTo, onCancelReply, editingMessage, onCancelEdit, allowImages }) {
    const [text, setText] = useState("");
    const textareaRef = useRef(null);

    // Sync for Edit
    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.content);
            if (textareaRef.current) textareaRef.current.focus();
        }
    }, [editingMessage]);

    // Auto-grow
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [text]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSend(e);
        }
    };

    return (
        <div className="chat-input-area">
            {/* Attachments (Visual Only) - Restricted to Admin/Senior */}
            {allowImages && (
                <button style={{ color: '#64748b', padding: '8px' }} title="Send Image">
                    <Paperclip size={22} />
                </button>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Reply / Edit Preview */}
                {(replyTo || editingMessage) && (
                    <div className="reply-preview-bar">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="reply-preview-name" style={{ color: editingMessage ? 'var(--primary)' : 'var(--primary)' }}>
                                {editingMessage ? 'Editing Message' : `Reply to ${replyTo.user_name}`}
                            </span>
                            <button onClick={() => {
                                if (editingMessage) { onCancelEdit(); setText(""); }
                                else onCancelReply();
                            }} style={{ padding: '2px' }}>
                                <X size={14} color="#64748b" />
                            </button>
                        </div>
                        <div className="reply-preview-content">
                            {editingMessage ? editingMessage.content : replyTo.content}
                        </div>
                    </div>
                )}

                <div className="chat-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        placeholder="Message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                </div>
            </div>

            {text.trim() ? (
                <button
                    onClick={handleSend}
                    style={{
                        color: 'var(--primary)',
                        padding: '8px',
                        transform: 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Send size={24} fill="currentColor" />
                </button>
            ) : (
                <button style={{ color: '#64748b', padding: '8px' }}>
                    <Mic size={24} />
                </button>
            )}
        </div>
    );
}
