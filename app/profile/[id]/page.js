"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import UserAvatar from "@/app/components/ui/UserAvatar";
import NoteCard from "@/app/components/notes/NoteCard";
import GlassButton from "@/app/components/ui/GlassButton";
import { MessageCircle, Edit2, Calendar, MapPin, Link as LinkIcon, BookOpen } from "lucide-react";
import Link from "next/link";
import Loader from "@/app/components/ui/Loader";

export default function PublicProfilePage(props) {
    const params = use(props.params); // Next.js 14/15 Param handling
    const { user: currentUser } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [activeTab, setActiveTab] = useState("notes"); // 'notes' | 'about'

    useEffect(() => {
        const fetchProfile = async () => {
            if (!params.id) return;
            
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", params.id)
                    .single();
                
                if (error) throw error;
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [params.id]);

    useEffect(() => {
        const fetchNotes = async () => {
            if (!params.id) return;
            // Only fetch notes if we have a profile (optional optimization)
            
            try {
                // Fetch published notes by this author
                // We also fetch profile info again for the card, ensuring data integrity
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
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader /></div>;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                <h1 className="text-2xl font-bold mb-2">User not found</h1>
                <Link href="/dashboard" className="text-blue-500 hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    const isMe = currentUser?.id === profile.id;
    const joinedDate = new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* 1. Cover Banner */}
            <div className="h-48 md:h-64 w-full bg-gradient-to-r from-cyan-500 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10" style={{ backdropFilter: 'blur(0px)' }}></div>
                {/* Decorative circles */}
                <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[200%] bg-blue-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-16 sm:-mt-20 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    {/* 2. Avatar */}
                    <div className="relative group">
                        <div className="p-1 bg-white rounded-full shadow-lg">
                            <UserAvatar 
                                user={profile} 
                                size="128px" 
                                className="border-4 border-white shadow-sm"
                            />
                        </div>
                    </div>

                    {/* 3. Identity & Actions */}
                    <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 pb-2">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-3">
                            {profile.full_name}
                            {(profile.role === 'admin' || profile.role === 'senior') && (
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                    profile.role === 'admin' 
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                    {profile.role}
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 font-medium">@{profile.username || 'user'}</p>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 mb-4 sm:mb-2">
                        {isMe ? (
                            <Link href="/profile">
                                <GlassButton variant="secondary" className="bg-white/90 text-slate-800 hover:bg-white border-white/50">
                                    <Edit2 size={18} className="mr-2" />
                                    Edit Profile
                                </GlassButton>
                            </Link>
                        ) : (
                            <Link href={`/messages/${profile.id}`}>
                                <GlassButton variant="primary" className="shadow-lg shadow-blue-500/30">
                                    <MessageCircle size={18} className="mr-2" />
                                    Message
                                </GlassButton>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    {/* Left Column: Bio & Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">About</h3>
                            
                            {profile.bio ? (
                                <p className="text-slate-600 leading-relaxed mb-6">{profile.bio}</p>
                            ) : (
                                <p className="text-slate-400 italic mb-6">No bio yet.</p>
                            )}

                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-slate-400" />
                                    <span>Joined {joinedDate}</span>
                                </div>
                                {profile.college && (
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={18} className="text-slate-400" />
                                        <span>{profile.college} {profile.year_of_study ? `(Year ${profile.year_of_study})` : ''}</span>
                                    </div>
                                )}
                                {/* Add more fields if available in profile schema */}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tabs & Content */}
                    <div className="md:col-span-2">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
                            <button
                                onClick={() => setActiveTab("notes")}
                                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                    activeTab === "notes"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Notes ({notes.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("about")}
                                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors md:hidden ${
                                    activeTab === "about"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Info
                            </button>
                        </div>

                        {/* Content */}
                        {activeTab === "notes" && (
                            <div className="min-h-[300px]">
                                {loadingNotes ? (
                                    <div className="flex justify-center p-12"><Loader /></div>
                                ) : notes.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {notes.map(note => (
                                            <NoteCard key={note.id} note={note} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <BookOpen size={24} />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900">No notes published</h3>
                                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                            {isMe ? "You haven't uploaded any notes yet." : "This user hasn't published any notes yet."}
                                        </p>
                                        {isMe && (
                                            <Link href="/notes/upload" className="inline-block mt-4 text-blue-600 font-semibold hover:underline">
                                                Upload your first note
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Mobile Only About View for Tabs */}
                        {activeTab === "about" && (
                            <div className="md:hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Info</h3>
                                <p className="text-slate-600 mb-4">{profile.bio || "No bio available."}</p>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p><strong>Member since:</strong> {joinedDate}</p>
                                    {profile.college && <p><strong>College:</strong> {profile.college}</p>}
                                    {profile.specialty && <p><strong>Specialty:</strong> {profile.specialty}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
