"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import UserAvatar from "@/app/components/ui/UserAvatar";

export default function GlassNavbar() {
  const { user, profile } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0B1120]/70 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 font-bold text-xl tracking-tight text-white cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                    <span className="font-bold text-lg">M</span>
                </div>
                Meddot
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-5 py-2.5 w-96 focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all group">
                  <Search size={18} strokeWidth={2} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                      type="text" 
                      placeholder="Search for notes..." 
                      className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
                  />
              </div>
            )}

            <div className="flex items-center gap-6">
                {user ? (
                   <>
                     <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative group">
                        <Bell size={22} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-[#0B1120]"></span>
                    </button>
                    <Link href="/profile">
                        <UserAvatar user={profile || user} size="40px" className="border-2 border-white/10 shadow-lg shadow-purple-500/20" />
                    </Link>
                   </>
                ) : (
                  <div className="flex gap-4">
                     <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 transition-colors">Login</Link>
                     <Link href="/login" className="text-sm font-semibold text-slate-950 bg-white px-4 py-2 rounded-full hover:bg-cyan-50 transition-colors">Sign Up</Link>
                  </div>
                )}
            </div>
        </div>
      </nav>
  );
}
