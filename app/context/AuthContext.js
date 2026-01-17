"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Loader from "../components/ui/Loader";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [debugStatus, setDebugStatus] = useState("Checking Session..."); // Initial state
    const router = useRouter();

    // Fetch profile from 'profiles' table with timeout
    const fetchProfile = async (userId) => {
        try {
            // Optimistic Check: If we already have a profile in state, we might not need to do anything
            // but we usually want to revalidate in background.

            const fetchPromise = supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Profile fetch timeout")), 10000) // Increased to 10s
            );

            // Race against timeout
            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (error) {
                console.error("Error fetching profile:", error);
            } else {
                setProfile(data);
                // CACHE UPDATE: Update generic cache
                try {
                     localStorage.setItem(`meddot_profile_${userId}`, JSON.stringify(data));
                } catch (e) {
                    console.warn("Failed to cache profile", e);
                }
            }
        } catch (err) {
            console.error("Profile fetch crash/timeout:", err);
            // Fallback: If profile fetch fails, try to use metadata temporarily to avoid locking user out
            // We don't set 'profile' fully, but we can rely on isAdmin check falling back to metadata if we update the isAdmin logic below.
        }
    };

    useEffect(() => {
        let mounted = true;

        if (!supabase) {
            console.warn("AuthContext: Supabase client missing");
            setLoading(false);
            setDebugStatus("Supabase Client Missing");
            return;
        }

        const initializeAuth = async () => {
            try {
                setDebugStatus("Contacting Supabase Auth...");

                // Timeout wrapper for getSession
                const sessionPromise = supabase.auth.getSession();
                const sessionTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Session check timeout")), 5000));

                // 1. Get initial session with timeout
                const { data: { session } } = await Promise.race([sessionPromise, sessionTimeout]);

                if (mounted) {
                    if (session?.user) {
                        setDebugStatus("Session Found. Checking Cache...");
                        setUser(session.user);

                        // --- FAST PATH: Check Cache ---
                        try {
                            const cached = localStorage.getItem(`meddot_profile_${session.user.id}`);
                            if (cached) {
                                const parsed = JSON.parse(cached);
                                console.log("AuthContext: Loaded profile from cache (Fast Path)");
                                setProfile(parsed);
                                setLoading(false); // <--- CRITICAL: Stop loading immediately
                                setDebugStatus("Profile Loaded (Cache). Revalidating...");
                            }
                        } catch (e) {
                            console.warn("Cache read failed", e);
                        }

                        // --- BACKGROUND: Fetch Fresh ---
                        await fetchProfile(session.user.id);
                        setDebugStatus("Profile Synced.");
                    } else {
                        setDebugStatus("No Session Found.");
                    }
                }
            } catch (error) {
                console.error("Auth init error:", error);
                if (mounted) setDebugStatus(`Error: ${error.message}`);
            } finally {
                if (mounted) {
                    setLoading(false);
                    setDebugStatus((prev) => prev + " (Done)");
                }
            }
        };

        initializeAuth();

        // 2. Realtime Profile Sync
        const channel = supabase
            .channel(`profile_updates_${user?.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: user ? `id=eq.${user.id}` : undefined
                },
                (payload) => {
                    console.log("Realtime Profile Update:", payload.new);
                    setProfile(payload.new);
                    // Update cache on realtime update too
                     if (user?.id) {
                         localStorage.setItem(`meddot_profile_${user.id}`, JSON.stringify(payload.new));
                     }
                }
            )
            .subscribe();

        // 3. Listen for Auth State Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                // Optimistic update to prevent flicker, but fetch profile
                if (event === 'SIGNED_IN') {
                    // Try to load cache immediately on sign in too?
                    // Usually initializeAuth handles the initial load, this handles explicit sign-ins
                     try {
                        const cached = localStorage.getItem(`meddot_profile_${session.user.id}`);
                        if (cached) setProfile(JSON.parse(cached));
                    } catch(e) {}
                    
                    await fetchProfile(session.user.id);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            // Always set loading to false after processing an auth change
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [user]); // Re-run if user changes to update subscription filter

    // Safety Valve: Force loading to false after 7 seconds max to prevent infinite "Initializing..." screen
    useEffect(() => {
        const safetyTimer = setTimeout(() => {
            if (loading) {
                console.warn("Auth loading took too long. Forcing completion.");
                setLoading(false);
                setDebugStatus("Timed Out. Forcing Load.");
            }
        }, 7000);
        return () => clearTimeout(safetyTimer);
    }, [loading]);

    // Login
    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Signup
    const signup = async (name, email, password, studyYear) => {
        try {
            // 1. Create Auth User
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        year_of_study: studyYear,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            if (data?.user) {
                // 2. Manual Profile Creation (Ensure data is saved)
                const { error: profileError } = await supabase.from('profiles').upsert([{
                    id: data.user.id,
                    full_name: name,
                    email: email,
                    role: 'student',
                    year_of_study: studyYear
                }]);
                
                if (profileError) console.error("Manual profile creation failed:", profileError);
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Logout
    const logout = async () => {
        try {
            // Clear cache on logout
            if (user?.id) {
                localStorage.removeItem(`meddot_profile_${user.id}`);
            }
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            initialized: !loading, // Derived state for backward compatibility
            login,
            signup,
            logout,
            debugStatus, // Expose status
            isAdmin: profile?.role === 'admin' || user?.user_metadata?.role === 'admin',
            isSenior: ['senior', 'admin'].includes(profile?.role) || ['senior', 'admin'].includes(user?.user_metadata?.role)
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
