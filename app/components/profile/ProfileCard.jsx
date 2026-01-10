"use client";

import UserAvatar from "@/app/components/ui/UserAvatar";
import GlassButton from "@/app/components/ui/GlassButton";
import { MessageCircle, Edit2, BookOpen, GraduationCap, Award, Shield } from "lucide-react";
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
            <div className="bg-[#151e2e]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center transition-all hover:border-cyan-500/30 group">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative mb-4">
                     <div className="p-1 rounded-full border-2 border-slate-700/50 group-hover:border-cyan-500/50 transition-colors">
                        <UserAvatar user={profile} size="80px" className="shadow-xl" />
                    </div>
                     {/* Online Indicator */}
                     {/* <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#151e2e] bg-green-500"></div> */}
                </div>

                <h3 className="text-xl font-bold text-white mb-1">
                    {profile.full_name}
                </h3>
                <div className="mb-4">
                    {profile.role && (
                         <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-500/30">
                            {profile.role}
                        </span>
                    )}
                </div>

                <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                    {profile.bio || "No bio available."}
                </p>

                <button 
                    onClick={handleMessage}
                    disabled={loadingMessage}
                    className="w-full bg-white text-[#0F1623] py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                >
                    {loadingMessage ? <Loader size={14} color="black" /> : <MessageCircle size={16} />}
                    Message
                </button>
            </div>
        );
    }

    // Full Card (Original)
    return (
        <div className="bg-[#151e2e]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

            <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                        <div className="relative group">
                            <div className="p-1 rounded-full border-2 border-slate-700/50">
                                <UserAvatar user={profile} size="120px" className="shadow-2xl" />
                            </div>
                        </div>

                        <div className="text-center sm:text-left pt-2">
                            <h1 className="text-4xl font-extrabold text-white mb-2 flex flex-col sm:flex-row items-center sm:items-end gap-3">
                                {profile.full_name}
                                {(profile.role === 'admin' || profile.role === 'senior') && (
                                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 mb-2 sm:mb-1">
                                        {profile.role}
                                    </span>
                                )}
                            </h1>
                            <p className="text-slate-400 font-medium mb-6">@{profile.username || 'user'} • {profile.school || 'Meddot User'}</p>

                            <div className="flex items-center justify-center sm:justify-start gap-12 mb-8">
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-xl font-bold text-white">1.2k</span>
                                    <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Followers</span>
                                </div>
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-xl font-bold text-white">{stats.notesCount}</span>
                                    <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Notes</span>
                                </div>
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-xl font-bold text-white max-w-[100px] truncate">{stats.answersCount * 10 + 890}</span>
                                    <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Reputation</span>
                                </div>
                            </div>
                            
                            <p className="text-slate-400 leading-relaxed max-w-xl text-center sm:text-left mb-6">
                                {profile.bio || `Final year medical student passionate about Cardiology and MedTech. Building the future of medical education at Meddot.`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-80 flex flex-col items-center sm:items-end gap-6">
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                            <Shield size={18} />
                        </button>
                        {isMe ? (
                            <Link href="/profile">
                                <button className="bg-white text-[#0F1623] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2">
                                    <Edit2 size={16} />
                                    Edit Profile
                                </button>
                            </Link>
                        ) : (
                            <button 
                                onClick={handleMessage}
                                disabled={loadingMessage}
                                className="bg-white text-[#0F1623] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
                            >
                                {loadingMessage ? <Loader size={16} color="black" /> : <MessageCircle size={18} />}
                                Message {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
                            </button>
                        )}
                    </div>

                    <div className="w-full bg-[#0F1623]/60 rounded-2xl p-5 border border-white/5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Achievements</h3>
                        <div className="flex gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full border border-amber-500/50 text-amber-500 flex items-center justify-center bg-amber-500/10" title="Top Contributor">
                                <Award size={18} />
                            </div>
                            <div className="w-10 h-10 rounded-full border border-cyan-500/50 text-cyan-500 flex items-center justify-center bg-cyan-500/10" title="Verified Senior">
                                <Shield size={18} />
                            </div>
                            <div className="w-10 h-10 rounded-full border border-emerald-500/50 text-emerald-500 flex items-center justify-center bg-emerald-500/10" title="Note Author">
                                <BookOpen size={18} />
                            </div>
                        </div>

                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Focus Areas</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Anatomy', 'Surgery', 'Research'].map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-white/5">
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
