"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabase"; // Adjust path
import { Loader2, Lock, AlertCircle } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Use updateUser to set the new password for the active session
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Success! Redirect to dashboard
      router.replace("/dashboard");
    }
  };

  return (
    <div className="transform-gpu min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="transform-gpu w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="transform-gpu text-center mb-8">
          <div className="transform-gpu inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <Lock size={24} />
          </div>
          <h1 className="transform-gpu text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="transform-gpu text-slate-500 mt-2 text-sm">
            Please enter your new secure password below.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="transform-gpu space-y-6">
          {error && (
            <div className="transform-gpu p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="transform-gpu block text-xs font-bold text-slate-700 uppercase mb-1.5">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="transform-gpu w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="transform-gpu w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? <Loader2 className="transform-gpu animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}