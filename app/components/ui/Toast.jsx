"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X, Info } from "lucide-react";

export function ToastProvider({ children }) {
    // Basic implementation for local usage or could be expanded to context
    // For now we just export the UI component to be used locally in pages with state
    return <>{children}</>;
}

export default function ToastContainer({ toasts, removeToast }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none' // Allow clicks through container areas
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove();
        }, toast.duration || 3000);
        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    const bgMap = {
        success: '#f0fdf4',
        error: '#fef2f2',
        info: '#f0f9ff',
        warning: '#fffbeb'
    };

    const borderMap = {
        success: '#86efac',
        error: '#fca5a5',
        info: '#7dd3fc',
        warning: '#fcd34d'
    };

    const iconMap = {
        success: <CheckCircle2 size={18} color="#16a34a" />,
        error: <AlertCircle size={18} color="#dc2626" />,
        info: <Info size={18} color="#0284c7" />,
        warning: <AlertCircle size={18} color="#d97706" />
    };

    return (
        <div style={{
            background: bgMap[toast.type] || 'white',
            border: `1px solid ${borderMap[toast.type] || '#e2e8f0'}`,
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '100%',
            pointerEvents: 'auto',
            animation: 'slideIn 0.3s ease-out'
        }}>
            {iconMap[toast.type] || iconMap.info}
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: '#1e293b' }}>
                    {toast.message}
                </p>
            </div>
            <button
                onClick={onRemove}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', padding: '4px', display: 'flex'
                }}
            >
                <X size={14} />
            </button>
            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
