"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser, forgotPassword, resetPassword } from "../../../app/actions/auth";
import { 
  Mail, Lock, ArrowRight, Loader2, Sparkles, AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck, Github, User as UserIcon
} from "lucide-react";
import Link from "next/link";

interface AuthPageProps {
  view: "login" | "signup" | "forgot-password" | "reset-password";
}

import { GritioLogo } from '@gritorquit/dashboard-ui-web';

export default function AuthPage({ view: initialView }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [view, setView] = useState(initialView);
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1], staggerChildren: 0.05 }
    },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (view === "signup") {
        const res = await registerUser({ email, password, name });
        if (res.error) throw new Error(res.error);
        if (res.redirect) {
          router.push(res.redirect);
          return;
        }
        setSuccessMsg(res.success || "Account created! Please check your email to verify.");
      } else if (view === "login") {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          if (result.error === "EmailNotVerified" || result.error === "AccessDenied" || result.error === "Email not verified") {
            setError("Please verify your email before signing in.");
          } else if (result.error === "LegacyAccount") {
            setError("Account from previous system detected. Please reset your password.");
          } else {
            setError("Invalid email or password.");
          }
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else if (view === "forgot-password") {
        const res = await forgotPassword(email);
        if (res.error) throw new Error(res.error);
        setSuccessMsg(res.success || "Reset link sent!");
      } else if (view === "reset-password") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (!token) throw new Error("Invalid reset token.");
        
        const res = await resetPassword(token, password);
        if (res.error) throw new Error(res.error);
        
        setSuccessMsg("Password updated! Redirecting to login...");
        setTimeout(() => setView("login"), 2000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setError(null);
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err: any) {
      setError(err.message || `${provider} login failed`);
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async () => {
    if (!email) {
      setError("Enter your email first to receive a sign-in link.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        if (result.error === "Configuration") {
          throw new Error("Magic link is not configured on server. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in production env.");
        }
        throw new Error(result.error);
      }

      setSuccessMsg("Login link sent. Check your email. The link expires in 10 minutes.");
    } catch (err: any) {
      setError(err.message || "Could not send login link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transform-gpu min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden font-sans text-[var(--text-primary)] transition-colors duration-500">
      
      {/* --- Ambient Glow --- */}
      <motion.div 
        animate={{ 
          x: mousePos.x - 400, 
          y: mousePos.y - 400 
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
        className="transform-gpu absolute w-[800px] h-[800px] bg-[var(--accent-color)]/5 rounded-full blur-[120px] pointer-events-none z-0" 
      />

      <div className="transform-gpu w-full max-w-5xl mx-auto p-4 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="transform-gpu grid lg:grid-cols-2 w-full bg-[var(--bg-card)]/40 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-[var(--border-color)] overflow-hidden min-h-[600px]"
        >
          
          {/* --- LEFT SIDE: Brand & Message --- */}
          <div className="transform-gpu hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-[var(--accent-color)]/20 to-transparent relative overflow-hidden border-r border-[var(--border-color)]">
             <div className="transform-gpu absolute top-[-10%] right-[-10%] w-64 h-64 bg-[var(--accent-color)]/10 rounded-full blur-3xl" />
             
             <Link href="/" className="transform-gpu relative z-10 flex items-center gap-3 group w-fit">
                <GritioLogo size="sm" withText={true} />
             </Link>

             <div className="transform-gpu relative z-10 space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 className="transform-gpu text-5xl font-black leading-tight italic uppercase tracking-tighter mb-4">
                      {view === 'login' ? "Welcome back." : 
                       view === 'signup' ? "Get started." : 
                       view === 'forgot-password' ? "Reset password." :
                       "New Password."}
                    </h2>
                    <p className="transform-gpu text-[var(--text-secondary)] text-lg leading-relaxed max-w-sm font-medium">
                      {view === 'login' 
                        ? "Pick up where you left off and keep moving forward."
                        : view === 'signup'
                        ? "Join others who are turning their ideas into reality."
                        : view === 'forgot-password'
                        ? "Enter your email and we'll send you instructions to reset your password."
                        : "Define a strong new password to re-initialize your account access."}
                    </p>
                  </motion.div>
                </AnimatePresence>
             </div>

             <div className="transform-gpu relative z-10 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em]">
               © {new Date().getFullYear()} grit.io
             </div>
          </div>

          {/* --- RIGHT SIDE: Form --- */}
          <div className="transform-gpu flex flex-col justify-center p-8 md:p-12 w-full max-w-md mx-auto relative">
            <motion.div variants={itemVariants} className="transform-gpu mb-8">
              <h1 className="transform-gpu text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
                {view === 'login' ? "Sign In" : 
                 view === 'signup' ? "Create Account" : 
                 view === 'forgot-password' ? "Reset Password" :
                 "Update Password"}
              </h1>
              {view !== 'reset-password' && (
                <div className="transform-gpu text-[var(--text-secondary)] mt-2 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  {view === 'login' ? "New here?" : 
                   view === 'signup' ? "Have an account?" : 
                   "Know your password?"} 
                  <button 
                    onClick={() => {
                      setView(view === 'login' ? 'signup' : 'login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="transform-gpu text-[var(--accent-color)] hover:underline"
                  >
                    {view === 'login' ? "Create Account" : "Sign In"}
                  </button>
                </div>
              )}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="transform-gpu mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-500 text-xs font-bold uppercase tracking-tight"
                >
                  <AlertCircle size={16} className="transform-gpu shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="transform-gpu mb-6 p-4 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 rounded-2xl flex items-start gap-3 text-[var(--accent-color)] text-xs font-bold uppercase tracking-tight"
                >
                  <CheckCircle2 size={16} className="transform-gpu shrink-0 mt-0.5" />
                  <p>{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuth} className="transform-gpu space-y-5">
              {view === 'signup' && (
                <motion.div variants={itemVariants} className="transform-gpu space-y-2">
                  <label className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="transform-gpu relative group">
                    <UserIcon size={18} className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="transform-gpu w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] transition-all placeholder:text-[var(--text-secondary)]/30 tracking-tight"
                    />
                  </div>
                </motion.div>
              )}

              {view !== 'reset-password' && (
                <motion.div variants={itemVariants} className="transform-gpu space-y-2">
                  <label className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="transform-gpu relative group">
                    <Mail size={18} className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="transform-gpu w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] transition-all placeholder:text-[var(--text-secondary)]/30 tracking-tight"
                    />
                  </div>
                </motion.div>
              )}

              {(view === 'login' || view === 'signup' || view === 'reset-password') && (
                <motion.div variants={itemVariants} className="transform-gpu space-y-2">
                  <label className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">
                    {view === 'reset-password' ? "New Password" : "Password"}
                  </label>
                  <div className="transform-gpu relative group">
                    <Lock size={18} className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="transform-gpu w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] transition-all placeholder:text-[var(--text-secondary)]/30"
                    />
                  </div>
                </motion.div>
              )}

              {view === 'reset-password' && (
                <motion.div variants={itemVariants} className="transform-gpu space-y-2">
                  <label className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                  <div className="transform-gpu relative group">
                    <ShieldCheck size={18} className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="transform-gpu w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] transition-all placeholder:text-[var(--text-secondary)]/30"
                    />
                  </div>
                </motion.div>
              )}

              {view === 'login' && (
                <motion.div variants={itemVariants} className="transform-gpu flex justify-end items-center">
                  <button 
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors uppercase tracking-widest"
                  >
                    Forgot Password?
                  </button>
                </motion.div>
              )}

              {view === 'login' && (
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handleMagicLinkLogin}
                  disabled={loading}
                  className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-black rounded-2xl py-4 flex items-center justify-center gap-3 transition-all hover:bg-[var(--hover-bg)] disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                >
                  Email Me A Magic Link
                </motion.button>
              )}

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="transform-gpu w-full bg-[var(--accent-color)] text-[var(--bg-primary)] font-black rounded-2xl py-4 flex items-center justify-center gap-3 transition-all shadow-xl shadow-[var(--accent-color)]/20 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
              >
                {loading ? <Loader2 size={20} className="transform-gpu animate-spin" /> : (
                  <>
                    {view === 'login' ? "Sign In" : 
                     view === 'signup' ? "Create Account" : 
                     view === 'forgot-password' ? "Reset Password" :
                     "Update and Sign In"} <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            {(view === 'login' || view === 'signup') && (
              <>
                <motion.div variants={itemVariants} className="transform-gpu my-8 flex items-center gap-4">
                  <div className="transform-gpu h-px bg-[var(--border-color)] flex-1" />
                  <span className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Social Login</span>
                  <div className="transform-gpu h-px bg-[var(--border-color)] flex-1" />
                </motion.div>

                <motion.div variants={itemVariants} className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    className="transform-gpu flex-1 flex items-center justify-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-4 text-xs font-black text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all uppercase tracking-widest"
                  >
                    <svg className="transform-gpu w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleOAuthLogin('github')}
                    className="transform-gpu flex-1 flex items-center justify-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-4 text-xs font-black text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all uppercase tracking-widest"
                  >
                    <Github size={16} />
                    GitHub
                  </button>
                </motion.div>
              </>
            )}

            {(view === 'forgot-password' || view === 'reset-password') && (
              <motion.div variants={itemVariants} className="transform-gpu mt-8 text-center">
                <button 
                  onClick={() => {
                    if (view === 'reset-password') router.push('/login');
                    else setView('login');
                  }}
                  className="transform-gpu inline-flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors uppercase tracking-widest"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="transform-gpu mt-8 pt-6 border-t border-[var(--border-color)] text-center">
              <Link 
                href="/support"
                className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors uppercase tracking-[0.2em]"
              >
                Need help? Contact Support
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
