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

    // Chibi Doctor SVG
    const DoctorSVG = () => (
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shadow */}
            <ellipse cx="50" cy="95" rx="30" ry="5" fill="black" fillOpacity="0.1" />

            {/* Body (Coat) */}
            <motion.path
                d="M30 60 Q20 100 25 100 H75 Q80 100 70 60 L65 40 H35 L30 60 Z"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="2"
                initial={{ y: 0 }}
                animate={{ y: mood === 'focus' ? [0, 1, 0] : [0, 1.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Buttons */}
            <circle cx="50" cy="60" r="2" fill="#cbd5e1" />
            <circle cx="50" cy="75" r="2" fill="#cbd5e1" />

            {/* Head */}
            <motion.circle
                cx="50"
                cy="35"
                r="30"
                fill="#ffedd5" // Skin tone
                stroke={isHovered ? "#fb923c" : "none"}
                strokeWidth="2"
            />

            {/* Hair */}
            <path d="M20 30 Q20 5 50 5 Q80 5 80 30 Q80 40 75 35 Q75 10 50 10 Q25 10 25 35 Q20 40 20 30 Z" fill="#475569" />

            {/* Eyes - Blinking Logic */}
            <AnimatePresence>
                {!blink ? (
                    <g>
                        <circle cx="38" cy="35" r="3" fill="#1e293b" />
                        <circle cx="62" cy="35" r="3" fill="#1e293b" />
                    </g>
                ) : (
                    <g>
                        <path d="M35 35 H41" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                        <path d="M59 35 H65" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                    </g>
                )}
            </AnimatePresence>

            {/* Mouth */}
            {isHovered ? (
                <path d="M45 45 Q50 50 55 45" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            ) : (
                <path d="M48 45 H52" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            )}

            {/* Stethoscope */}
            <path d="M35 55 Q35 70 50 70 Q65 70 65 55" stroke="#0ea5e9" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="70" r="4" fill="#cbd5e1" stroke="#94a3b8" />
        </svg>
    );

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
                <DoctorSVG />
            </motion.div>
        </motion.div>
    );
}
