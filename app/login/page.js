"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import GlassButton from "../components/ui/GlassButton";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.error || "Invalid credentials. Try student@meddot.com / password");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs (Inherited from Layout, but ensured here for isolation) */}
            
            <div className="w-full max-w-md relative z-10">
                <div className="flex justify-center mb-8">
                    <BrandLogo size="3rem" showIcon={true} />
                </div>
                
                <GlassCard className="p-8 border-slate-700/50 bg-slate-900/60 backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400">Sign in to continue your medical journey</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <GlassInput 
                            icon={Mail}
                            placeholder="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
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
                                autoComplete="current-password"
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

                        <div className="flex justify-end">
                            <Link 
                                href="/forgot-password" 
                                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <GlassButton 
                            type="submit" 
                            variant="primary" 
                            className="w-full"
                            loading={isLoading}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </GlassButton>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
