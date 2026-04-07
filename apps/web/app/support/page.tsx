"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Send, HelpCircle, ArrowLeft, Mail, MessageSquare, CheckCircle2, Loader2 
} from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      if (!response.ok) {
        console.error("Direct send failed, falling back to mailto:", response.status, response.statusText);
        const subject = encodeURIComponent("Support Request: Web App");
        const body = encodeURIComponent(`User Email: ${email}\n\nMessage:\n${message}`);
        const mailtoUrl = `mailto:dogritorquit@gmail.com?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;
      }
      
      setSuccess(true);
    } catch (err) {
      console.error("Support submission error:", err);
      // Last resort fallback
      window.location.href = `mailto:dogritorquit@gmail.com`;
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="transform-gpu min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden font-sans text-[var(--text-primary)]">
      
      {/* Ambient Glow */}
      <div className="transform-gpu absolute w-[800px] h-[800px] bg-[var(--accent-color)]/5 rounded-full blur-[120px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="transform-gpu w-full max-w-4xl mx-auto p-4 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="transform-gpu grid lg:grid-cols-5 w-full bg-[var(--bg-card)]/40 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-[var(--border-color)] overflow-hidden"
        >
          {/* Left Panel: Info */}
          <div className="transform-gpu lg:col-span-2 p-12 bg-linear-to-br from-[var(--accent-color)]/20 to-transparent border-r border-[var(--border-color)] flex flex-col justify-between">
            <Link href="/login" className="transform-gpu flex items-center gap-3 group w-fit">
              <div className="transform-gpu w-10 h-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                <ArrowLeft size={20} className="text-[var(--accent-color)]" />
              </div>
              <span className="transform-gpu font-black tracking-tighter text-sm italic uppercase">Back</span>
            </Link>

            <div className="space-y-6">
              <div className="transform-gpu w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center shadow-xl">
                <HelpCircle size={24} className="text-[var(--accent-color)]" />
              </div>
              <h1 className="transform-gpu text-4xl font-black italic uppercase tracking-tighter leading-none">Support</h1>
              <p className="transform-gpu text-[var(--text-secondary)] text-sm font-medium leading-relaxed">
                Need help with your account or have a question? Our team is here to assist you.
              </p>
              
              <div className="pt-6 space-y-4">
                <a 
                  href="mailto:dogritorquit@gmail.com" 
                  className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)] group-hover:border-[var(--accent-color)] transition-colors">
                    <Mail size={14} className="text-[var(--accent-color)]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">dogritorquit@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="transform-gpu text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em]">
              © 2026 DO GRIT OK QUIT
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="lg:col-span-3 p-12">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-[var(--accent-color)]/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-[var(--accent-color)]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Signal Transmitted</h3>
                    <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">The core team has received your message. Stand by for response.</p>
                  </div>
                  <Link href="/login" className="px-8 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--hover-bg)] transition-all">
                    Return to Sign In
                  </Link>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-6">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Your Email</label>
                    <div className="relative group">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] transition-all placeholder:text-[var(--text-secondary)]/30 tracking-tight"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Message</label>
                    <div className="relative group">
                      <MessageSquare size={18} className="absolute left-4 top-6 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors" />
                      <textarea 
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Explain the issue you're facing..."
                        className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] transition-all placeholder:text-[var(--text-secondary)]/30 tracking-tight resize-none"
                      />
                    </div>
                  </motion.div>

                  <motion.button 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full bg-[var(--accent-color)] text-[var(--bg-primary)] font-black rounded-2xl py-4 flex items-center justify-center gap-3 transition-all shadow-xl shadow-[var(--accent-color)]/20 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : (
                      <>
                        Send Message <Send size={18} />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
