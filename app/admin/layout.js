"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFeature } from "@/app/context/FeatureFlagContext";
import Link from 'next/link';

import { Users, FileText, MessageSquare, Megaphone, Home, LogOut, Shield, Menu, X } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import UserAvatar from "../components/ui/UserAvatar";

const SidebarLink = ({ href, icon: Icon, label, onClick }) => (
    <a
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group"
    >
        <span className="p-1 rounded-lg bg-white/5 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
            <Icon size={18} />
        </span>
        <span className="font-medium">{label}</span>
    </a>
);

export default function AdminLayout({ children }) {
    const { user, loading, initialized, isAdmin, profile } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!initialized || loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (isAdmin) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    }, [user, loading, initialized, isAdmin, router]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [router]);

    if (!initialized || loading || isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
                <div className="flex flex-col items-center gap-4">
                     <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
                     <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing Admin Core...</p>
                </div>
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] text-white gap-6 p-4">
                <Shield size={64} className="text-red-500 mb-4" />
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Access Denied</h1>
                <p className="text-slate-400 text-center max-w-md">
                    You do not have the required clearance level (Admin) to access this secure terminal.
                </p>
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors shadow-lg shadow-cyan-500/20"
                    >
                        Return to Dashboard
                    </button>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-white/10"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 flex overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F1623]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <BrandLogo size="1.25rem" subtitle="Admin" showIcon={false} />
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 w-72 bg-[#0F1623]/50 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col
                    transform transition-transform duration-300 ease-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="p-6 h-20 flex items-center justify-between border-b border-white/5 bg-[#0F1623]/50">
                    <BrandLogo subtitle="Admin Panel" />
                    <button className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Application
                    </div>
                    <SidebarLink href="/dashboard" icon={Home} label="Return to App" onClick={() => setSidebarOpen(false)} />
                    
                    <div className="my-4 h-px bg-white/5 mx-4" />
                    
                    <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Management
                    </div>
                    <SidebarLink href="#users" icon={Users} label="User Database" onClick={() => setSidebarOpen(false)} />
                    <SidebarLink href="#moderation" icon={FileText} label="Content Moderation" onClick={() => setSidebarOpen(false)} />
                    <SidebarLink href="#announcements" icon={Megaphone} label="Announcements" onClick={() => setSidebarOpen(false)} />
                    <SidebarLink href="#rooms" icon={MessageSquare} label="Chat Rooms" onClick={() => setSidebarOpen(false)} />
                </nav>

                <div className="p-4 border-t border-white/5 bg-[#0F1623]/30">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <UserAvatar user={profile || user} size="36px" className="ring-2 ring-white/10" />
                        <div className="flex flex-col overflow-hidden">
                             <span className="text-sm font-bold text-white truncate">{user?.full_name || 'Administrator'}</span>
                             <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Super Admin</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/login')} 
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 text-slate-400 transition-all duration-200 text-sm font-medium"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-[#0B1120] relative flex flex-col h-screen overflow-hidden">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8 scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
}
