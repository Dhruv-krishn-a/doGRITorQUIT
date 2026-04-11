"use client";

import { motion } from "framer-motion";
import { Mail, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--bg-card)]/40 backdrop-blur-2xl rounded-[40px] p-12 shadow-2xl border border-[var(--border-color)] text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center">
            <Mail size={32} className="text-[var(--accent-color)]" />
          </div>
        </div>

        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
          Check your email
        </h1>

        <p className="text-[var(--text-secondary)] font-medium mb-8">
          We&apos;ve sent a verification link to your email address. Please click the link to activate your account.
        </p>

        <div className="space-y-4">
          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
            <Sparkles size={14} className="text-[var(--accent-color)]" />
            <span className="text-[10px] font-black uppercase tracking-widest">GritOrQuit</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
