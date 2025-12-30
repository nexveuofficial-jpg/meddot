"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // { id, email, role, full_name, ... }
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch profile (role) for a given auth user
    const fetchProfile = async (sessionUser) => {
        if (!sessionUser) return null;
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            // Fallback object if profile missing (shouldn't happen with triggers)
            return { ...sessionUser, role: 'student' };
        }
        return { ...sessionUser, ...profile };
    };

    // Initialize session
    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const combinedUser = await fetchProfile(session.user);
                setUser(combinedUser);
            }
            setLoading(false);
        };
        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const combinedUser = await fetchProfile(session.user);
                setUser(combinedUser);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                router.push('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            alert(error.message);
            return false;
        }

        // Critical: Set user state immediately to prevent redirect race condition
        if (data?.session?.user) {
            const combinedUser = await fetchProfile(data.session.user);
            setUser(combinedUser);
        }

        return true;
    };

    const signup = async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });
        if (error) {
            alert(error.message);
            return false;
        }
        alert("Signup successful! Please log in.");
        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        // Redirect handled by listener
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
