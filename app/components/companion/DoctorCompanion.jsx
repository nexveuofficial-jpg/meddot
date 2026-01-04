"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { MESSAGES, getRandomMessage } from "./messages";
import { useFeature } from "@/app/context/FeatureFlagContext";

export default function DoctorCompanion({ mood = "idle", context = "dashboard" }) {
    const { isEnabled } = useFeature();
    const [message, setMessage] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Initial delay to not overwhelm
    useEffect(() => {
        // Wait for feature flag loading, defaults to true here for safety if undefined but usually guarded
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVisible(true);

        // Initial message
        const timer = setTimeout(() => {
            if (mood === 'focus') {
                setMessage(getRandomMessage('focus', 'start'));
            } else if (context === 'empty') {
                setMessage(getRandomMessage('empty'));
            } else {
                setMessage(getRandomMessage(context));
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [context, mood]);

    // Random blinking effect
    const [blink, setBlink] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }, 4000 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, []);

    if (!isEnabled('doctor_companion_enabled')) return null;



    return (
        <motion.div
            className="doctor-companion"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
                position: 'fixed', // Default fixed, can be overridden by parent layout context if needed
                bottom: '2rem',
                right: '2rem',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'end',
                pointerEvents: 'auto',
                cursor: 'pointer'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setMessage(getRandomMessage(context == 'empty' ? 'empty' : context))}
        >
            {/* Message Bubble */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            background: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '1rem',
                            borderRadiusBottomRight: '0.2rem', // Speech bubble tail
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            marginBottom: '0.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            border: '1px solid var(--border)',
                            maxWidth: '200px',
                            textAlign: 'right'
                        }}
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Avatar */}
            <motion.div
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                <DoctorSVG mood={mood} isHovered={isHovered} blink={blink} />
            </motion.div>
        </motion.div>
    );
}
