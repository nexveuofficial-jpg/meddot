"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const router = useRouter();

    // Fetch profile (role) for a given auth user
    const fetchProfile = async (sessionUser) => {
        if (!sessionUser || !supabase) return null;
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', sessionUser.id)
                .single();

            if (error) {
                console.warn("AuthContext: Profile fetch warning:", error.message);
                return { ...sessionUser, role: 'student' }; // Safe fallback
            }
            return { ...sessionUser, ...profile };
        } catch (err) {
            console.error("AuthContext: Profile fetch crash:", err);
            return { ...sessionUser, role: 'student' };
        }
    };

    // Initialize session
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            if (!supabase) {
                console.error("AuthContext: Supabase client missing.");
                if (mounted) {
                    setLoading(false);
                    setInitialized(true);
                }
                return;
            }

            try {
                // 1. Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (session?.user && mounted) {
                    const combinedUser = await fetchProfile(session.user);
                    if (mounted) setUser(combinedUser);
                }
            } catch (error) {
                console.error("AuthContext: Init error:", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                    setInitialized(true);
                }
            }
        };

        initAuth();

        if (!supabase) return;

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            console.log(`AuthContext: Auth event ${event}`);

            if (session?.user) {
                // If we already have the same user, skip fetch to prevent flickering
                // But if it's a new sign in, we MUST fetch profile
                if (event === 'SIGNED_IN' || event === 'ToKEN_REFRESHED' || event === 'USER_UPDATED') {
                    // Check if effective user changed or if we just need to refresh
                    const combinedUser = await fetchProfile(session.user);
                    if (mounted) setUser(combinedUser);
                }
            } else if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setUser(null);
                    // Do not redirect here blindly. Let layouts handle it.
                    // But for user convenience, if they explicitly signed out, we might want to.
                    // However, 'SIGNED_OUT' can fire on bad sessions too.
                }
            }

            if (mounted) {
                setLoading(false);
                setInitialized(true);
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        if (!supabase) return false;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            console.error("Login failed:", error.message);
            return { success: false, error: error.message };
        }

        if (data?.session?.user) {
            const combinedUser = await fetchProfile(data.session.user);
            setUser(combinedUser);
            return { success: true, user: combinedUser };
        }
        return { success: false, error: "No session created." };
    };

    const signup = async (name, email, password) => {
        if (!supabase) return false;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }
            }
        });
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    };

    const logout = async () => {
        if (!supabase) return;
        try {
            await supabase.auth.signOut();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Error signing out:", error);
            setUser(null); // Force local cleanup
            router.push('/login');
        }
    };

    if (!supabase) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f8fafc',
                color: '#1e293b',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>Configuration Error</h1>
                <p style={{ maxWidth: '400px', lineHeight: '1.6', color: '#64748b' }}>
                    The application is missing its backend configuration. <br />
                    If you are the administrator, please ensure <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set in your environment variables.
                </p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, initialized }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
