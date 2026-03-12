//apps/desktop/src/features/auth/components/LoginForm.tsx
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="transform-gpu w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
      <div className="transform-gpu text-center">
        <h2 className="transform-gpu text-3xl font-extrabold text-slate-900 tracking-tight">
          Planner Desktop
        </h2>
        <p className="transform-gpu mt-2 text-sm text-slate-500">
          Enter your details to sign in
        </p>
      </div>

      {error && (
        <div className="transform-gpu flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          <AlertCircle className="transform-gpu h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="transform-gpu mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="transform-gpu block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="transform-gpu w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="transform-gpu block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="transform-gpu w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="transform-gpu flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="transform-gpu animate-spin h-5 w-5" /> : "Sign In"}
        </button>
      </form>
    </div>
  );
}
