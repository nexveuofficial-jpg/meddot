"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BrandLogo from "./components/BrandLogo";
import Loader from "./components/ui/Loader";
import RevealOnScroll from "./components/ui/RevealOnScroll";
import GlassButton from "./components/ui/GlassButton";
import GlassNavbar from "./components/ui/GlassNavbar";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0B1120]">
        <GlassNavbar />
        <div className="flex flex-col items-center gap-6">
          <BrandLogo size="3rem" />
          <Loader />
          <p className="text-slate-500 animate-pulse">Initializing Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      <GlassNavbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        <RevealOnScroll>
          <div className="space-y-8 max-w-4xl mx-auto">
            
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:bg-cyan-500/10 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              v2.0 Design System
            </span>

            {/* Headline */}
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.1]">
              The Future of <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text animate-gradient-x bg-[length:200%_auto]">
                Medical Learning
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed font-light">
              A premium, distraction-free environment for medical students. 
              Connect with verified seniors and access high-yield notes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Link href="/login">
                <GlassButton size="lg" className="min-w-[200px]">
                  Get Started
                  <ArrowRight size={20} strokeWidth={2} />
                </GlassButton>
              </Link>
              <Link href="/demo">
                <GlassButton variant="outline" size="lg" className="min-w-[200px]">
                  Explore Demo
                </GlassButton>
              </Link>
            </div>

            {/* Feature List (Optional, for trust) */}
            <div className="pt-12 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-cyan-500" />
                    <span>Verified Seniors</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-cyan-500" />
                    <span>Curated Notes</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-cyan-500" />
                    <span>Realtime Chat</span>
                </div>
            </div>

          </div>
        </RevealOnScroll>
        
      </div>
    </div>
  );
}
