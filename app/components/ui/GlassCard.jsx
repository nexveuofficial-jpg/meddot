"use client";

import React from 'react';

const GlassCard = ({ children, className = "", hoverEffect = true }) => {
  return (
    <div className={`
      relative p-8 rounded-[2rem] 
      border border-white/5 bg-slate-900/40 backdrop-blur-xl 
      ${hoverEffect ? 'hover:border-cyan-500/20 transition-all duration-500 hover:-translate-y-1 shadow-xl hover:shadow-cyan-500/10' : ''}
      overflow-hidden
      ${className}
    `}>
      {/* Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"/>
      
      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
