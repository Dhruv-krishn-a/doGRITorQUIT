"use client";

import { useState } from "react";
import { supabase } from "../../utils/supabase"; // Adjust path if needed
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ✅ FIX: Redirect to a dedicated update-password page
    // We use window.location.origin to support both localhost and production automatically
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your email and we will send you instructions to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-center gap-3 text-left">
              <CheckCircle2 className="shrink-0 text-green-600" />
              <p className="text-sm font-medium">Check your email for the reset link.</p>
            </div>
            <Link 
              href="/login" 
              className="block w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}