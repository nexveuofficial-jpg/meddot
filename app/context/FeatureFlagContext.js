"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const FeatureFlagContext = createContext();

export function FeatureFlagProvider({ children }) {
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchFlags = async () => {
        const { data, error } = await supabase
            .from('feature_flags')
            .select('*');

        if (error) {
            console.error('Error fetching flags:', error);
            // Default fallbacks
            setFlags({
                enable_chat: true,
                enable_uploads: true,
                enable_ask_senior: true,
                doctor_companion_enabled: true
            });
        } else {
            const flagMap = data.reduce((acc, flag) => {
                acc[flag.key] = flag.is_enabled;
                return acc;
            }, {});

            // FORCE ENABLE FEATURES (User Request)
            flagMap['enable_chat'] = true;
            flagMap['enable_uploads'] = true;
            flagMap['enable_ask_senior'] = true;
            flagMap['doctor_companion_enabled'] = true;

            setFlags(flagMap);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFlags();

        // Realtime subscription for flags
        const subscription = supabase
            .channel('feature_flags')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, (payload) => {
                console.log('Flag update:', payload);
                fetchFlags();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const isEnabled = (key) => !!flags[key];

    // Admin helper to toggle flags
    const toggleFlag = async (key, value) => {
        const { error } = await supabase
            .from('feature_flags')
            .update({ is_enabled: value })
            .eq('key', key);

        if (error) {
            console.error('Error updating flag:', error);
            alert('Failed to update feature flag');
        }
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, isEnabled, toggleFlag, loading }}>
            {children}
        </FeatureFlagContext.Provider>
    );
}

export const useFeature = () => useContext(FeatureFlagContext);
