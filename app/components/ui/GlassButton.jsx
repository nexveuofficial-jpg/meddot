"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

const GlassButton = ({ 
  children, 
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = "", 
  disabled = false,
  loading = false,
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // UPDATED: Solid Gradient Blue/Cyan as requested
    primary: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:brightness-110 shadow-lg shadow-cyan-500/20",
    
    // Previous primary (White) is now secondary or just an alternative
    white: "bg-white text-slate-950 hover:bg-slate-200 shadow-lg shadow-white/10",
    
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-white/10",
    
    outline: "border border-white/10 text-white hover:bg-white/5 backdrop-blur-sm",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg"
  };

  const variantClass = variants[variant] || variants.primary;

  return (
    <button 
      className={`${baseStyles} ${variantClass} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  );
};

export default GlassButton;
