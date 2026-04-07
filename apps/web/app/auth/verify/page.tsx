"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/app/actions/auth";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    verifyEmail(token).then((res) => {
      if (res.success) {
        setStatus("success");
        setMessage(res.success);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setStatus("error");
        setMessage(res.error || "Verification failed.");
      }
    });
  }, [token, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--bg-card)]/40 backdrop-blur-2xl rounded-[40px] p-12 shadow-2xl border border-[var(--border-color)] text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center">
            <Sparkles size={32} className="text-[var(--accent-color)]" />
          </div>
        </div>

        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
          Email Verification
        </h1>

        <div className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="animate-spin text-[var(--accent-color)]" />
              <p className="text-[var(--text-secondary)] font-medium">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 size={48} className="text-[var(--accent-color)]" />
              <p className="text-[var(--text-primary)] font-bold">{message}</p>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-black">Redirecting to login...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <AlertCircle size={48} className="text-rose-500" />
              <p className="text-rose-500 font-bold">{message}</p>
              <Link 
                href="/signup"
                className="mt-4 px-8 py-3 bg-[var(--accent-color)] text-[var(--bg-primary)] font-black rounded-xl uppercase tracking-widest text-xs"
              >
                Back to Sign Up
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-color)]" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
