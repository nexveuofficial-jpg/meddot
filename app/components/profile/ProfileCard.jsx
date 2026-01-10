"use client";

import UserAvatar from "@/app/components/ui/UserAvatar";
import { MessageCircle, Edit2, BookOpen, GraduationCap, Award, Shield, Star, FileText, Heart, Share2, MoreHorizontal, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Loader from "@/app/components/ui/Loader";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfileCard({ profile, stats = { notesCount: 0, answersCount: 0 }, isMe = false, compact = false }) {
    const [loadingMessage, setLoadingMessage] = useState(false);
    const router = useRouter();

    const handleMessage = async () => {
        try {
            setLoadingMessage(true);
            const { data: roomId, error } = await supabase.rpc('get_or_create_dm_room', { 
                other_user_id: profile.id 
            });

            if (error) throw error;
            router.push(`/chat/${roomId}`);
        } catch (error) {
            console.error("Error creating DM:", error);
            alert("Failed to start chat.");
        } finally {
            setLoadingMessage(false);
        }
    };

    if (compact) {
        return (
            <div className="relative rounded-[1.5rem] overflow-hidden border border-white/10 bg-[#0F1623]/80 backdrop-blur-xl hover:border-cyan-500/30 transition-all group shadow-lg">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-indigo-900/40 relative">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F1623]"></div>
                </div>

                <div className="px-6 pb-6 relative">
                    <div className="flex justify-center -mt-10 mb-3">
                        <div className="relative">
                            <div className="p-1 rounded-full border-4 border-[#0F1623] bg-[#0F1623]">
                                <UserAvatar user={profile} size="80px" className="shadow-xl" />
                            </div>
                            {/* Online Dot */}
                             {/* <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#0F1623] bg-emerald-500"></div> */}
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-white mb-1 truncate px-2">
                            {profile.full_name}
                        </h3>
                        {profile.role && (
                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950/50 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20">
                                {profile.role === 'senior' && <GraduationCap size={10} />}
                                {profile.role === 'admin' && <ShieldCheck size={10} />}
                                {profile.role}
                            </span>
                        )}
                        <p className="text-slate-500 text-xs mt-2 line-clamp-2 min-h-[32px]">
                            {profile.bio || "No bio available."}
                        </p>
                    </div>

                    <button 
                        onClick={handleMessage}
                        disabled={loadingMessage}
                        className="w-full bg-white text-[#0F1623] py-2.5 rounded-xl font-bold text-xs hover:bg-cyan-50 transition-colors shadow-lg shadow-white/5 flex items-center justify-center gap-2 group/btn"
                    >
                        {loadingMessage ? <Loader size={12} color="black" /> : <MessageCircle size={14} className="group-hover/btn:scale-110 transition-transform" />}
                        Message
                    </button>
                </div>
            </div>
        );
    }

    // Full Card (Matches Demo Interactive Profile)
    return (
        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0F1623]/80 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 mb-8">
            
            {/* Banner Gradient */}
            <div className="h-64 bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-indigo-900/40 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F1623]"></div>
                 
                 {/* Top Actions */}
                 <div className="absolute top-8 right-8 flex gap-3 z-10">
                    <button className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:bg-black/40 hover:text-white transition-all hover:scale-105 active:scale-95">
                        <Share2 size={20} strokeWidth={1.5} />
                    </button>
                    {!isMe && (
                        <button className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:bg-black/40 hover:text-white transition-all hover:scale-105 active:scale-95">
                            <MoreHorizontal size={20} strokeWidth={1.5} />
                        </button>
                    )}
                    {isMe && (
                         <Link href="/settings/profile">
                            <button className="px-4 py-2.5 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:bg-black/40 hover:text-white transition-all font-bold text-sm flex items-center gap-2">
                                <Edit2 size={16} /> Edit
                            </button>
                        </Link>
                    )}
                 </div>
            </div>
            
            <div className="px-8 md:px-12 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-end -mt-20 mb-10 gap-8">
                    {/* Avatar */}
                    <div className="relative group cursor-default">
                        <div className="!w-32 !h-32 md:!w-40 md:!h-40 rounded-full border-[8px] border-[#0F1623] bg-slate-800 overflow-hidden shadow-2xl flex items-center justify-center relative z-10 ring-4 ring-white/5 p-0">
                             <UserAvatar user={profile} size="100%" className="w-full h-full" />
                        </div>
                        {/* Animated Status Dot */}
                        <div className="absolute bottom-4 right-4 z-20">
                            <span className="absolute inline-flex h-6 w-6 rounded-full bg-emerald-500 opacity-25 animate-ping"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 border-4 border-[#0F1623]"></span>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-2 w-full md:w-auto justify-end">
                         <button className="p-3.5 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors hover:scale-105 active:scale-95 group">
                            <Heart size={22} strokeWidth={1.5} className="group-hover:fill-rose-500 group-hover:text-rose-500 transition-colors" />
                         </button>
                         {isMe ? (
                            <Link href="/profile">
                                <button className="flex items-center gap-3 bg-white text-slate-950 px-8 py-3.5 rounded-full font-bold hover:bg-cyan-50 transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transform active:scale-95 text-base">
                                    <Edit2 size={20} strokeWidth={1.5} className="opacity-60" />
                                    <span>Edit Profile</span>
                                </button>
                            </Link>
                         ) : (
                            <button 
                                onClick={handleMessage}
                                disabled={loadingMessage}
                                className="flex items-center gap-3 bg-white text-slate-950 px-8 py-3.5 rounded-full font-bold hover:bg-cyan-50 transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transform active:scale-95 text-base"
                            >
                                {loadingMessage ? <Loader size={20} color="black" /> : <MessageCircle size={20} strokeWidth={1.5} className="opacity-60" />}
                                <span>Message {profile.role === 'senior' ? 'Senior' : 'User'}</span>
                            </button>
                         )}
                    </div>
                </div>

                {/* User Identity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2">
                        <h2 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-4 mb-3 tracking-tight">
                            {profile.full_name}
                            {(profile.role === 'senior' || profile.role === 'admin') && (
                                <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1.5 rounded-lg border border-cyan-500/20 uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                    {profile.role === 'senior' ? <GraduationCap size={14} strokeWidth={2} /> : <ShieldCheck size={14} strokeWidth={2} />} 
                                    {profile.role}
                                </span>
                            )}
                        </h2>
                        <p className="text-slate-400 font-medium text-lg">@{profile.username || 'user'} • {profile.school || 'Meddot User'}</p>
                        
                        {/* Stats Row */}
                        <div className="flex gap-8 mt-8 pb-8 border-b border-white/5">
                            <div className="flex flex-col gap-1">
                                <span className="text-white font-bold text-xl">1.2k</span>
                                <span className="text-slate-500 text-xs uppercase tracking-wide font-bold">Followers</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-white font-bold text-xl">{stats.notesCount}</span>
                                <span className="text-slate-500 text-xs uppercase tracking-wide font-bold">Notes</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-white font-bold text-xl">{stats.answersCount * 10 + 890}</span>
                                <span className="text-slate-500 text-xs uppercase tracking-wide font-bold">Reputation</span>
                            </div>
                        </div>

                        <p className="text-slate-300 mt-8 leading-relaxed text-lg font-light max-w-xl">
                            {profile.bio || "No bio available for this user."}
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
                            {['Anatomy', 'Surgery', 'Research'].map(tag => (
                                <span key={tag} className="text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-default max-w-full truncate">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
