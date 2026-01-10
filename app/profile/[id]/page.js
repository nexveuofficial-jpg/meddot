"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import UserAvatar from "@/app/components/ui/UserAvatar";
import NoteCard from "@/app/components/notes/NoteCard";
import GlassButton from "@/app/components/ui/GlassButton";
import { MessageCircle, Edit2, Calendar, MapPin, Link as LinkIcon, BookOpen, GraduationCap, Award, School, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "@/app/components/ui/Loader";
import RevealOnScroll from "@/app/components/ui/RevealOnScroll";

export default function PublicProfilePage(props) {
    const params = use(props.params); 
    const { user: currentUser } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [notes, setNotes] = useState([]);
    const [stats, setStats] = useState({ notesCount: 0, answersCount: 0 });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [activeTab, setActiveTab] = useState("notes"); // 'notes' | 'about'
    
    // Message Logic
    const [loadingMessage, setLoadingMessage] = useState(false);
    const router = useRouter();

    const handleMessage = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }
        
        try {
            setLoadingMessage(true);
            const { data: roomId, error } = await supabase.rpc('get_or_create_dm_room', { 
                other_user_id: profile.id 
            });

            if (error) throw error;
            router.push(`/chat/${roomId}`);
        } catch (error) {
            console.error("Error creating DM:", error);
            alert("Failed to start chat. " + error.message);
        } finally {
            setLoadingMessage(false);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!params.id) return;
            
            try {
                // 1. Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", params.id)
                    .single();
                
                if (profileError) throw profileError;
                setProfile(profileData);

                // 2. Fetch Stats (Parallel)
                const [notesRes, answersRes] = await Promise.all([
                    supabase.from("notes").select("id", { count: 'exact', head: true }).eq("author_id", params.id).eq("status", "published"),
                    supabase.from("answers").select("id", { count: 'exact', head: true }).eq("responder_id", params.id)
                ]);

                setStats({
                    notesCount: notesRes.count || 0,
                    answersCount: answersRes.count || 0
                });

            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfileData();
    }, [params.id]);

    useEffect(() => {
        const fetchNotes = async () => {
            if (!params.id) return;
            
            try {
                const { data, error } = await supabase
                    .from("notes")
                    .select("*, profiles(username, full_name, role)")
                    .eq("author_id", params.id)
                    .eq("status", "published")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setNotes(data || []);
            } catch (error) {
                console.error("Error fetching notes:", error);
            } finally {
                setLoadingNotes(false);
            }
        };
        
        fetchNotes();
    }, [params.id]);


    if (loadingProfile) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0F1623]"><Loader /></div>;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F1623] text-slate-500">
                <h1 className="text-2xl font-bold mb-2">User not found</h1>
                <Link href="/dashboard" className="text-cyan-400 hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    const isMe = currentUser?.id === profile.id;
    const joinedDate = new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#0F1623] pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                {/* Profile Card */}
                <div className="bg-[#151e2e]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Left Column: Avatar & Info */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="p-1 rounded-full border-2 border-slate-700/50">
                                        <UserAvatar 
                                            user={profile} 
                                            size="120px" 
                                            className="shadow-2xl"
                                        />
                                    </div>
                                    <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-[#151e2e] ${profile.role === 'online' ? 'bg-green-500' : 'bg-green-500'}`}></div>
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

                                    {/* Stats Row */}
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
                                    
                                    {/* Bio */}
                                    <p className="text-slate-400 leading-relaxed max-w-xl text-center sm:text-left mb-6">
                                        {profile.bio || `Final year medical student passionate about Cardiology and MedTech. Building the future of medical education at Meddot.`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & Achievements */}
                        <div className="w-full md:w-80 flex flex-col items-center sm:items-end gap-6">
                             {/* Actions */}
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

                            {/* Achievements Card */}
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

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-white/5 mb-8">
                    <button 
                        onClick={() => setActiveTab('notes')}
                        className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
                            activeTab === 'notes' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        Posted Notes
                        {activeTab === 'notes' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full" />
                        )}
                    </button>
                    <button 
                         onClick={() => setActiveTab('about')}
                         className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
                            activeTab === 'about' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        About
                        {activeTab === 'about' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full" />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'notes' ? (
                        loadingNotes ? (
                            <div className="text-center py-20"><Loader /></div>
                        ) : notes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notes.map((note, idx) => (
                                    <RevealOnScroll key={note.id} delay={idx * 0.05}>
                                        <NoteCard note={note} />
                                    </RevealOnScroll>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No notes published yet</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    {profile.full_name} hasn't uploaded any notes to the library yet.
                                </p>
                            </div>
                        )
                    ) : (
                        // ABOUT TAB
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Bio Column */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-[#151e2e] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        About Me
                                    </h3>
                                    {profile.bio ? (
                                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                                            {profile.bio}
                                        </p>
                                    ) : (
                                        <p className="text-slate-600 italic">No bio added yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Info Column */}
                            <div className="space-y-6">
                                <div className="bg-[#151e2e] border border-white/5 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                                        Details
                                    </h3>
                                    
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 p-1.5 bg-slate-800 rounded-lg text-slate-400">
                                            <School size={16} />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">College</p>
                                            <p className="text-white font-medium">{profile.college || "Not specified"}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 p-1.5 bg-slate-800 rounded-lg text-slate-400">
                                            <Award size={16} />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Year</p>
                                            <p className="text-white font-medium">{profile.year_of_study || "Not specified"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 p-1.5 bg-slate-800 rounded-lg text-slate-400">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Joined</p>
                                            <p className="text-white font-medium">{joinedDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
