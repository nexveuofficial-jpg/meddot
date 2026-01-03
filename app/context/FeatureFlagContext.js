"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const FeatureFlagContext = createContext();

export function FeatureFlagProvider({ children }) {
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchFlags = async () => {
        try {
            const { data, error } = await supabase.from('feature_flags').select('*');
            if (error) throw error;

            const flagMap = {};
            data.forEach((flag) => {
                if (flag.key) {
                    flagMap[flag.key] = flag.is_enabled;
                }
            });

            // FORCE ENABLE FEATURES (Persist override) - REMOVED to allow Admin Toggle
            // flagMap['enable_chat'] = true;
            // flagMap['enable_uploads'] = true;
            // flagMap['enable_ask_senior'] = true;
            // flagMap['doctor_companion_enabled'] = true;

            setFlags(flagMap);
        } catch (error) {
            console.error('Error fetching flags:', error);
            // Default fallbacks
            setFlags({
                enable_chat: true,
                enable_uploads: true,
                enable_ask_senior: true,
                doctor_companion_enabled: true
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFlags();

        // Realtime subscription for flags
        const subscription = supabase
            .channel('public:feature_flags')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, () => {
                fetchFlags();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const isEnabled = (key) => !!flags[key];

    const toggleFlag = async (key, value) => {
        try {
            // Use upsert to handle cases where the flag row doesn't exist yet
            const { error } = await supabase
                .from('feature_flags')
                .upsert({ key: key, is_enabled: value }, { onConflict: 'key' });

            if (error) throw error;

            // Optimistically update local state to reflect change immediately (Realtime will confirm)
            setFlags(prev => ({ ...prev, [key]: value }));
        } catch (error) {
            console.error('Error updating flag:', error);
            alert('Failed to update feature flag: ' + error.message);
        }
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, isEnabled, toggleFlag, loading }}>
            {children}
        </FeatureFlagContext.Provider>
    );
}

export const useFeature = () => useContext(FeatureFlagContext);
