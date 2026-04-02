"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Database, ArrowLeft, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/services/api";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await axios.post(`${API_BASE}/register`, {
                email: email,
                password: password
            });
            setSuccess(true);
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen gradient-bg flex items-center justify-center p-4">
            <Link href="/" className="absolute top-8 left-8 flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Platform</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-xl mb-4 overflow-hidden">
                        <img src="/logo.png" alt="AgentIQ Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold glow-text">Create Account</h1>
                    <p className="text-white/40 text-sm mt-2">Join the AGENTIQ AI ecosystem</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm italic">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm italic">
                        Registration successful! Redirecting to login...
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                        <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
                    </button>
                </form>

                <p className="mt-8 text-center text-white/40 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-400 hover:underline">Sign In</Link>
                </p>
            </motion.div>
        </main>
    );
}
