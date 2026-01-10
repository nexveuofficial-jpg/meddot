"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import Loader from "../../components/ui/Loader";

export default function MessageRedirect(props) {
    const params = use(props.params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
             router.replace("/login");
             return;
        }

        const redirectToChat = async () => {
            try {
                // Call RPC to get or create the DM room
                const { data: roomId, error } = await supabase.rpc('get_or_create_dm_room', { 
                    other_user_id: params.userId 
                });

                if (error) throw error;

                if (roomId) {
                    router.replace(`/chat/${roomId}`);
                } else {
                    throw new Error("Could not create chat room.");
                }
            } catch (err) {
                console.error("Redirect Error:", err);
                setError(err.message);
            }
        };

        redirectToChat();
    }, [user, authLoading, params.userId, router]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F1623] text-red-400">
                <p>Failed to load chat.</p>
                <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-white/5 rounded-lg text-white">Go Back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F1623]">
            <Loader size={40} />
            <p className="mt-4 text-slate-400 animate-pulse">Starting conversation...</p>
        </div>
    );
}
