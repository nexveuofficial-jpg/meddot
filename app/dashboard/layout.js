"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Home, Book, Clock, User, HelpCircle, Shield, Mail, LogOut, Users, MessageCircle } from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";
import Link from "next/link";
import Loader from "../components/ui/Loader";
import BrandLogo from "../components/BrandLogo";
import UserAvatar from "../components/ui/UserAvatar";

const NavLink = ({ href, pathname, children, icon: Icon, setIsMobileMenuOpen }) => {
    const isActive = pathname === href;
    return (
        <Link
            href={href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
            `}
        >
            {Icon && <Icon size={20} strokeWidth={1.5} className={`transition-colors ${isActive ? 'text-cyan-400' : 'group-hover:text-white'}`} />}
            <span className="font-medium">{children}</span>
        </Link>
    );
};

export default function DashboardLayout({ children }) {
    const { user, loading, initialized, logout, isAdmin, isSenior, profile } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (initialized && !loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, initialized, router]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    if (!initialized || loading) {
        return <Loader fullScreen />;
    }

    if (!user) return null;

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-[#0B1120] text-slate-200 flex overflow-hidden">
                
                {/* Mobile Toggle Button */}
                <button
                    className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-full bg-[#0F1623]/80 backdrop-blur-md border border-white/10 text-white shadow-lg"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed md:relative inset-y-0 left-0 w-72 bg-[#0F1623]/90 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-6 border-b border-white/5 bg-[#0F1623]">
                        <div className="flex items-center gap-4 mb-6">
                             <UserAvatar user={profile || user} size="48px" className="ring-2 ring-white/10 shadow-lg" />
                             <div className="overflow-hidden">
                                 <h3 className="text-white font-bold truncate">{profile?.full_name?.split(' ')[0] || 'Student'}</h3>
                                 <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">{profile?.role || 'Member'}</span>
                             </div>
                        </div>
                        <BrandLogo size="1.25rem" subtitle="Portal" />
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                        <NavLink href="/dashboard" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={Home}>Dashboard</NavLink>
                        <NavLink href="/notes" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={Book}>Notes Library</NavLink>
                        
                        <div className="my-2 h-px bg-white/5 mx-2"></div>
                        
                        <NavLink href="/ask-senior" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={HelpCircle}>Ask Senior</NavLink>
                        <NavLink href="/chat" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={Users}>Study Groups</NavLink>
                        <NavLink href="/chat" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={MessageCircle}>Inbox</NavLink>
                        <NavLink href="/focus" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={Clock}>Focus Mode</NavLink>
                        
                        <div className="my-2 h-px bg-white/5 mx-2"></div>
                        
                        <NavLink href="/profile" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={User}>My Profile</NavLink>
                        <NavLink href="/contact" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={Mail}>Contact Support</NavLink>

                        {isAdmin && (
                            <>
                                <div className="my-2 h-px bg-white/5 mx-2"></div>
                                <NavLink href="/admin" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={Shield}>Admin Panel</NavLink>
                            </>
                        )}
                        
                        {(isSenior || isAdmin) && (
                            <>
                                <div className="my-2 h-px bg-white/5 mx-2"></div>
                                <NavLink href="/senior" pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} icon={Shield}>Senior Panel</NavLink>
                            </>
                        )}
                    </nav>

                    <div className="p-4 border-t border-white/5 bg-[#0F1623]">
                        <button 
                            onClick={logout} 
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-hidden relative w-full">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
                         backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                    }}></div>
                    
                    <div className="relative z-10 h-screen overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>
        </ErrorBoundary>
    );
}
