"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
                setTimeout(() => reject(new Error("Profile fetch timeout")), 4000)
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
            // Non-blocking: allow app to load even if profile fails
        }
    };

    useEffect(() => {
        let mounted = true;

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
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("Auth init error:", error);
                if (mounted) setDebugStatus(`Error: ${error.message}`);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
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
            login,
            signup,
            logout,
            debugStatus, // Expose status
            isAdmin: profile?.role === 'admin',
            isSenior: profile?.role === 'senior'
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
