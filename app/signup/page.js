"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, ArrowLeft, CheckCircle } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import GlassButton from "../components/ui/GlassButton";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [studyYear, setStudyYear] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signup(name, email, password, studyYear);

            if (result.success) {
                if (result.data?.session) {
                    router.push('/dashboard');
                } else {
                    setShowSuccess(true);
                }
            } else {
                setError(result.error || "Signup failed");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Signup Crash:", err);
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                <div className="w-full max-w-md relative z-10">
                    <GlassCard className="p-8 text-center border-green-500/30 bg-slate-900/80">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            We've sent a confirmation link to<br/> <span className="text-white font-semibold">{email}</span>.
                        </p>
                        <p className="text-sm text-slate-500 mb-8">
                            Please check your inbox (and spam folder) and click the link to verify your account.
                        </p>
                        <Link href="/login">
                            <GlassButton variant="primary" className="w-full">
                                Back to Login
                            </GlassButton>
                        </Link>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
             
            <div className="w-full max-w-md relative z-10">
                <div className="flex justify-center mb-8">
                    <BrandLogo size="3rem" showIcon={true} />
                </div>
                
                <GlassCard className="p-8 border-slate-700/50 bg-slate-900/60 backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-slate-400">Join the future of medical education</p>
                    </div>

                    {error && (
                         <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <GlassInput 
                            icon={User}
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-slate-900/80 border-slate-700"
                        />

                        <GlassInput 
                            icon={Mail}
                            placeholder="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-900/80 border-slate-700"
                        />

                        <GlassInput 
                            icon={GraduationCap}
                            placeholder="Study Year (e.g. 1)"
                            type="number"
                            min="1"
                            max="6"
                            value={studyYear}
                            onChange={(e) => setStudyYear(e.target.value)}
                            required
                            className="bg-slate-900/80 border-slate-700"
                        />

                        <div className="relative">
                            <GlassInput 
                                icon={Lock}
                                placeholder="Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-900/80 border-slate-700"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <GlassButton 
                            type="submit" 
                            variant="primary" 
                            className="w-full mt-4"
                            loading={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </GlassButton>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
