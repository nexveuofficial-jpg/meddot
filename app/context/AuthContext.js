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
                        setDebugStatus("Session Found. Fetching Profile...");
                        setUser(session.user);
                        await fetchProfile(session.user.id);
                        setDebugStatus("Profile Fetched. Finalizing...");
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

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                // Optimistic update to prevent flicker, but fetch profile
                await fetchProfile(session.user.id);
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
        };
    }, []);

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
    const signup = async (name, email, password) => {
        try {
            // 1. Create Auth User
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            if (data?.user) {
                // 2. Manual Profile Creation (If no trigger exists)
                // Just in case, we can try to insert. If trigger handles it, this might fail or conflict, but 'upsert' is safer.
                /*
                const { error: profileError } = await supabase.from('profiles').upsert([{
                    id: data.user.id,
                    full_name: name,
                    email: email,
                    role: 'student'
                }]);
                */
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Logout
    const logout = async () => {
        try {
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
            isSenior: profile?.role === 'senior' || user?.user_metadata?.role === 'senior'
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
