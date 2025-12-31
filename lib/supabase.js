import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isClient = typeof window !== 'undefined';
const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
    console.warn('Meddot: Missing Supabase environment variables. Auth will not work.');
}

// Create client only if configured to avoid crashes
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true, // Let supabase handle persistence
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null;
