"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabase";
import { 
  Mail, Lock, ArrowRight, Loader2, Sparkles, AlertCircle, CheckCircle2
} from "lucide-react";
import Link from "next/link";

interface AuthPageProps {
  view: "login" | "signup";
}

export default function AuthPage({ view }: AuthPageProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  useEffect(() => {
    setRedirectUrl(`${window.location.origin}/auth/callback`);
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) router.push("/dashboard");
    });
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (view === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (signUpError) throw signUpError;
        setSuccessMsg("Account created! Please check your email to verify your account.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            throw new Error("Account not found or password incorrect. Please register if you are new.");
          }
          throw signInError;
        }

        try {
          await fetch('/api/auth/sync-user', { method: 'POST' });
        } catch (syncErr) {
          console.error("Login sync warning:", syncErr);
        }
        
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Auth Logic Error:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Network error. Please check your connection.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FDF2F8] relative overflow-hidden font-sans text-slate-900">
      
      {/* --- Animated Background Elements --- */}
      {/* Updated to canonical Tailwind classes: w-200 (800px), w-150 (600px) */}
      <div className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-purple-200/40 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-150 h-150 bg-pink-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto flex items-center justify-center p-4 relative z-10">
        
        {/* Updated min-h-[600px] to min-h-150 */}
        <div className="grid lg:grid-cols-2 w-full bg-white/60 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-purple-900/10 border border-white/50 overflow-hidden min-h-150">
          
          {/* --- LEFT SIDE: Visuals --- */}
          {/* Updated bg-gradient-to-br to bg-linear-to-br */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-indigo-600 to-purple-700 relative text-white overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
             
             <Link href="/" className="relative z-10 flex items-center gap-2 group w-fit">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Sparkles size={16} />
                </div>
                <span className="font-bold tracking-tight text-lg">DO GRIT OR QUIT</span>
             </Link>

             <div className="relative z-10 space-y-6">
                <h2 className="text-4xl font-black leading-tight">
                  {view === 'login' ? "Welcome back, builder." : "Start your journey."}
                </h2>
                <p className="text-indigo-100 text-lg leading-relaxed max-w-sm">
                  {view === 'login' 
                    ? "Your roadmap is waiting. Let's pick up where you left off and ship something great today."
                    : "Join thousands of developers turning chaotic ideas into executed plans with AI."}
                </p>
             </div>

             <div className="relative z-10 text-sm text-indigo-200 font-medium">
               © 2026 PlannerAI. Built for shippers.
             </div>
          </div>

          {/* --- RIGHT SIDE: Form --- */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col justify-center p-8 md:p-12 w-full max-w-md mx-auto"
          >
            <div className="lg:hidden mb-8 flex justify-center">
               <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  PlannerAI
               </Link>
            </div>

            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                {view === 'login' ? "Sign in to your account" : "Create your account"}
              </h1>
              <p className="text-slate-500 mt-2">
                {view === 'login' ? "New here?" : "Already have an account?"} 
                <Link href={view === 'login' ? "/signup" : "/login"} className="text-indigo-600 font-bold hover:underline ml-1">
                  {view === 'login' ? "Create an account" : "Sign in"}
                </Link>
              </p>
            </motion.div>

            {/* MESSAGES */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700 text-sm"
                >
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <p>{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuth} className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </motion.div>

              {view === 'login' && (
                <motion.div variants={itemVariants} className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                    Forgot password?
                  </Link>
                </motion.div>
              )}

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                type="submit"
                className="w-full bg-slate-900 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    {view === 'login' ? "Sign In" : "Create Account"} <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="my-8 flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs font-bold text-slate-400 uppercase">Or continue with</span>
              <div className="h-px bg-slate-200 flex-1" />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3">
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}