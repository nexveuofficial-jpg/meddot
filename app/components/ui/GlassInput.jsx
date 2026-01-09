"use client";

import React from 'react';

const GlassInput = ({ 
  className = "", 
  icon: Icon,
  error,
  ...props 
}) => {
  return (
    <div className="w-full">
      <div className={`
        relative flex items-center gap-3 
        bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 
        focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:border-cyan-500 
        transition-all duration-300
        ${error ? 'border-rose-500/50 ring-1 ring-rose-500/20' : ''}
        ${className}
      `}>
        {Icon && <Icon size={18} className="text-slate-400" />}
        <input 
          className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-400 text-base"
          {...props}
        />
      </div>
      {error && <p className="text-rose-400 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default GlassInput;
