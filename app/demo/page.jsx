"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Library,        // Changed from BookOpen for "Smart Notes"
  MessageCircle, 
  ShieldCheck,    // Changed from Shield for "Verified"
  Users,          // Changed from MessageCircle for "Community"
  ArrowRight, 
  Bell, 
  Search, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Star, 
  FileText,
  GraduationCap   // Added for Senior Badge
} from 'lucide-react';

// --- Internal Component for Scroll Reveal Animation ---
const RevealOnScroll = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Only animate once
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: "0px 0px -50px 0px" 
      } 
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 cubic-bezier(0.17, 0.55, 0.55, 1) transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function DesignDemo() {
  const [activeTab, setActiveTab] = useState('notes');

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* 1. "Living" Background (Breathable Animation) */}
      <div className="fixed top-[-20%] left-[-10%] w-[900px] h-[900px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0B1120]/70 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                    <span className="font-bold text-lg">M</span>
                </div>
                Meddot
            </div>
            
            <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-5 py-2.5 w-96 focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all group">
                <Search size={18} strokeWidth={2} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search for notes..." 
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
                />
            </div>

            <div className="flex items-center gap-6">
                <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative group">
                    <Bell size={22} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-[#0B1120]"></span>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-white/10 cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"></div>
            </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-32">
        
        {/* Header Section */}
        <RevealOnScroll>
          <div className="text-center mb-32 space-y-10">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:bg-cyan-500/10 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              v2.0 Design System
            </span>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-tight">
              The Future of <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text animate-gradient-x bg-[length:200%_auto]">
                Medical Learning
              </span>
            </h1>
            
            <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed font-light">
              A premium, distraction-free environment for medical students. 
              Connect with verified seniors and access high-yield notes.
            </p>

            <div className="flex justify-center gap-6 pt-8">
              <button className="bg-white text-slate-950 px-10 py-4 rounded-full font-bold hover:bg-cyan-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-3 text-lg">
                  Get Started
                  <ArrowRight size={20} strokeWidth={2} />
              </button>
              <button className="px-10 py-4 rounded-full font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3 text-lg backdrop-blur-sm">
                  Explore Demo
              </button>
            </div>
          </div>
        </RevealOnScroll>

        {/* 2. Glass Cards Grid - Staggered Animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
          
          {/* Card 1: Library */}
          <RevealOnScroll delay={0}>
            <div className="group relative p-10 rounded-[2rem] border border-white/5 bg-slate-900/30 backdrop-blur-md hover:border-cyan-500/20 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-cyan-500/10 overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>
              
              <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                      {/* Improved Icon: Library instead of BookOpen */}
                      <Library className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Smart Notes</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 font-light">
                      Read PDFs in a secure, high-performance reader designed for deep focus.
                  </p>
                  
                  <div className="flex items-center text-cyan-400 text-sm font-bold group/link cursor-pointer tracking-wide uppercase">
                      Browse Library 
                      <ArrowRight size={16} strokeWidth={2} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                  </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 2: Verified */}
          <RevealOnScroll delay={150}>
            <div className="group relative p-10 rounded-[2rem] border border-white/5 bg-slate-900/30 backdrop-blur-md hover:border-violet-500/20 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-violet-500/10 overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>
              
              <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                      {/* Improved Icon: ShieldCheck instead of Shield */}
                      <ShieldCheck className="text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Verified Answers</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 font-light">
                      Only verified seniors can answer academic questions, ensuring 100% accuracy.
                  </p>
                  <div className="flex items-center text-violet-400 text-sm font-bold group/link cursor-pointer tracking-wide uppercase">
                      Ask a Senior 
                      <ArrowRight size={16} strokeWidth={2} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                  </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 3: Community */}
          <RevealOnScroll delay={300}>
            <div className="group relative p-10 rounded-[2rem] border border-white/5 bg-slate-900/30 backdrop-blur-md hover:border-pink-500/20 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-pink-500/10 overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>
              
              <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-600/10 border border-pink-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(236,72,153,0.15)]">
                      {/* Improved Icon: Users instead of MessageCircle */}
                      <Users className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]" size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Med Community</h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-8 font-light">
                      Connect with peers, form study groups, and share clinical experiences.
                  </p>
                  <div className="flex items-center text-pink-400 text-sm font-bold group/link cursor-pointer tracking-wide uppercase">
                      Join Discussion 
                      <ArrowRight size={16} strokeWidth={2} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                  </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* 3. Profile Card */}
        <RevealOnScroll className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-6 mb-12 opacity-60">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-32"></div>
                <div className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold">New: Interactive Profiles</div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-32"></div>
            </div>
            
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0F1623]/80 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
                
                {/* Banner Gradient */}
                <div className="h-64 bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-indigo-900/40 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F1623]"></div>
                     
                     {/* Top Actions */}
                     <div className="absolute top-8 right-8 flex gap-3 z-10">
                        <button className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:bg-black/40 hover:text-white transition-all hover:scale-105 active:scale-95">
                            <Share2 size={20} strokeWidth={1.5} />
                        </button>
                        <button className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:bg-black/40 hover:text-white transition-all hover:scale-105 active:scale-95">
                            <MoreHorizontal size={20} strokeWidth={1.5} />
                        </button>
                     </div>
                </div>
                
                <div className="px-12 pb-12">
                    <div className="flex flex-col md:flex-row justify-between items-end -mt-20 mb-10 gap-8">
                        {/* Avatar */}
                        <div className="relative group cursor-pointer">
                            <div className="w-40 h-40 rounded-full border-[8px] border-[#0F1623] bg-slate-800 overflow-hidden shadow-2xl flex items-center justify-center relative z-10 ring-4 ring-white/5">
                                <img 
                                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                                  alt="User Avatar" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="absolute bottom-4 right-4 z-20">
                                <span className="absolute inline-flex h-6 w-6 rounded-full bg-emerald-500 opacity-25 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 border-4 border-[#0F1623]"></span>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-2">
                             <button className="p-3.5 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors hover:scale-105 active:scale-95 group">
                                <Heart size={22} strokeWidth={1.5} className="group-hover:fill-rose-500 group-hover:text-rose-500 transition-colors" />
                             </button>
                             <button className="flex items-center gap-3 bg-white text-slate-950 px-8 py-3.5 rounded-full font-bold hover:bg-cyan-50 transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transform active:scale-95 text-base">
                                <MessageCircle size={20} strokeWidth={1.5} className="opacity-60" />
                                <span>Message Senior</span>
                            </button>
                        </div>
                    </div>

                    {/* User Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2">
                            <h2 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-4 mb-3 tracking-tight">
                                Dr. Sambhav Raj 
                                <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1.5 rounded-lg border border-cyan-500/20 uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                    <GraduationCap size={14} strokeWidth={2} /> Senior
                                </span>
                            </h2>
                            <p className="text-slate-400 font-medium text-lg">@sambhav_dev • AIIMS Delhi</p>
                            
                            {/* Stats Row */}
                            <div className="flex gap-8 mt-8 pb-8 border-b border-white/5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-bold text-xl">1.2k</span>
                                    <span className="text-slate-500 text-xs uppercase tracking-wide font-bold">Followers</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-bold text-xl">45</span>
                                    <span className="text-slate-500 text-xs uppercase tracking-wide font-bold">Notes</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-bold text-xl">890</span>
                                    <span className="text-slate-500 text-xs uppercase tracking-wide font-bold">Reputation</span>
                                </div>
                            </div>

                            <p className="text-slate-300 mt-8 leading-relaxed text-lg font-light max-w-xl">
                                Final year medical student passionate about <span className="text-cyan-400 font-normal">Cardiology</span> and <span className="text-cyan-400 font-normal">MedTech</span>. 
                                Building the future of medical education at Meddot.
                            </p>
                        </div>

                        {/* Badges Column */}
                        <div className="bg-slate-900/40 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Achievements</h4>
                            <div className="flex flex-wrap gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-[2px] shadow-lg shadow-orange-500/10" title="Top Contributor">
                                    <div className="w-full h-full bg-[#0B1120] rounded-full flex items-center justify-center">
                                        <Star size={20} className="text-yellow-500 fill-yellow-500/80 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 p-[2px] shadow-lg shadow-cyan-500/10" title="Verified Senior">
                                    <div className="w-full h-full bg-[#0B1120] rounded-full flex items-center justify-center">
                                        <ShieldCheck size={20} className="text-cyan-500 fill-cyan-500/20 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-[2px] shadow-lg shadow-emerald-500/10" title="Note Writer">
                                    <div className="w-full h-full bg-[#0B1120] rounded-full flex items-center justify-center">
                                        <FileText size={20} className="text-green-500 fill-green-500/20 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    </div>
                                </div>
                            </div>
                            
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-8 mb-4">Focus Areas</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-default">Anatomy</span>
                                <span className="text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-default">Surgery</span>
                                <span className="text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-default">Research</span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Tabs - Cleaner */}
                    <div className="mt-14">
                        <div className="flex gap-10 border-b border-white/5 relative">
                            {['notes', 'about', 'answers'].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-5 text-sm font-bold capitalize transition-colors relative tracking-wide ${
                                        activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    {tab === 'notes' ? 'Uploaded Notes (12)' : tab}
                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        <div className="py-10">
                            {activeTab === 'notes' && (
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Note Card 1 */}
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/10">
                                                <FileText size={24} strokeWidth={1.5} />
                                            </div>
                                            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">2d ago</span>
                                        </div>
                                        <h4 className="font-bold text-white text-lg mb-2 group-hover:text-cyan-400 transition-colors">Cardiology Basics - Part 1</h4>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span>PDF</span>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                            <span>2.4 MB</span>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                            <span className="flex items-center gap-1"><ArrowRight size={12} strokeWidth={2} /> 120 downloads</span>
                                        </div>
                                    </div>

                                     {/* Note Card 2 */}
                                     <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/10">
                                                <FileText size={24} strokeWidth={1.5} />
                                            </div>
                                            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">1w ago</span>
                                        </div>
                                        <h4 className="font-bold text-white text-lg mb-2 group-hover:text-cyan-400 transition-colors">Neuroanatomy Cheat Sheet</h4>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span>PDF</span>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                            <span>1.1 MB</span>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                            <span className="flex items-center gap-1"><ArrowRight size={12} strokeWidth={2} /> 85 downloads</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab !== 'notes' && (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                    <p className="text-slate-500 text-sm">No content available for {activeTab} yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
