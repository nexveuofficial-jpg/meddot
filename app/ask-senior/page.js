"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionCard from "@/app/components/qna/QuestionCard";
import { Plus, ArrowLeft } from "lucide-react";
import Loader from "../components/ui/Loader";
import { useAuth } from "@/app/context/AuthContext";
import { useFeature } from "@/app/context/FeatureFlagContext";
import RevealOnScroll from "../components/ui/RevealOnScroll";
import GlassButton from "../components/ui/GlassButton";

export default function AskSeniorPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { isEnabled, loading: featureLoading } = useFeature();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const categories = ["All", "Exam Strategy", "Anatomy", "Physiology", "Clinical Postings"];

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from("questions")
                    .select("*, profiles(username, full_name, role)")
                    .order("created_at", { ascending: false });
                
                if (selectedCategory !== "All") {
                   query = query.eq('category', selectedCategory);
                }

                const { data, error } = await query;

                if (error) throw error;

                const questionsData = data.map(doc => ({
                    ...doc,
                    profiles: Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles,
                    answers: [{ count: doc.answer_count || 0 }] 
                }));

                setQuestions(questionsData);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        if (isEnabled('enable_ask_senior')) {
            fetchQuestions();
        }
    }, [isEnabled, selectedCategory]);

    if (!isEnabled('enable_ask_senior') && !featureLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Feature Unavailable</h2>
                <p className="text-slate-400 mb-6">The "Ask Senior" feature is currently disabled.</p>
                <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    if (featureLoading || loading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Loader /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24">
            <RevealOnScroll>
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                            <ArrowLeft size={18} /> Back
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Ask Senior</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                            Get guidance, clear doubts, and learn directly from experienced seniors and alumni.
                        </p>
                    </div>

                    {user && (
                        <Link href="/ask-senior/ask">
                            <GlassButton variant="primary" className="!rounded-full px-6 shadow-xl shadow-cyan-500/20">
                                <Plus size={20} className="mr-2" />
                                Ask a Question
                            </GlassButton>
                        </Link>
                    )}
                </header>
            </RevealOnScroll>

            {/* Category Filter Chips */}
            <RevealOnScroll delay={100}>
                <div className="flex gap-3 overflow-x-auto pb-6 mb-8 scrollbar-hide">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                                    px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                                    ${isSelected 
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 scale-105' 
                                        : 'bg-[#1e293b]/50 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white hover:bg-[#1e293b]'}
                                `}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </RevealOnScroll>

            {questions.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 border border-dashed border-slate-700/50 rounded-3xl backdrop-blur-sm">
                    <p className="text-slate-400 text-lg">No questions found in this category.</p>
                    {selectedCategory !== 'All' && (
                        <button 
                            onClick={() => setSelectedCategory('All')}
                            className="mt-4 text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4"
                        >
                            View all questions
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {questions.map((q, index) => (
                        <RevealOnScroll key={q.id} delay={index * 50}>
                            <QuestionCard
                                question={q}
                                // Mock action - in real app, maybe open profile modal
                                onUserClick={(uid) => console.log("View user", uid)}
                            />
                        </RevealOnScroll>
                    ))}
                </div>
            )}
        </div>
    );
}
