"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Loader from "@/app/components/ui/Loader";
import { MessageCircle } from "lucide-react";

export default function InboxPage() {
    const { user } = useAuth();
    // We don't need to fetch conversations here anymore as they are side-loaded in layout
    // This page acts as the "Select a Chat" placeholder state
    
    useEffect(() => {
        // Optional: Redirect to first conversation if desired, but "Empty State" is better UX for clarity
    }, [user]);

    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#0F1623]"><Loader /></div>;

    return (
        <div className="min-h-screen bg-[#0F1623] p-6 pb-20 md:pl-80"> 
             {/* Note: The main layout padding might need adjustment, assuming this renders in the main slot */}
            <div className="max-w-7xl mx-auto">
                
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 min-h-[50vh]">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-500">
                            <MessageCircle size={40} className="text-cyan-500/50" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Your Messages</h2>
                        <p className="max-w-md text-center">
                            Select a conversation from the sidebar to start chatting or search for someone new.
                        </p>
                    </div>
            </div>
        </div>
    );
}
