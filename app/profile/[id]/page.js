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
import ProfileCard from "@/app/components/profile/ProfileCard";
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
            router.push(`/messages/room/${roomId}`);
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
                <ProfileCard profile={profile} stats={stats} isMe={isMe} />

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
