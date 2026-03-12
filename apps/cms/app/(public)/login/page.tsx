// apps/cms/app/(public)/login/page.tsx
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Sparkles, ArrowRight } from "lucide-react";

export default function CMSLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Authentication failed");
      setLoading(false);
      return;
    }

    router.refresh(); 
    router.push("/"); 
  };

  return (
    <div className="transform-gpu min-h-screen flex items-center justify-center bg-[#fdfbfb] relative overflow-hidden font-sans">
       {/* Animated Ethereal Background Gradients */}
       <div className="transform-gpu absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse pointer-events-none" />
       <div className="transform-gpu absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-pink-200/40 rounded-full blur-[150px] mix-blend-multiply animate-pulse delay-1000 pointer-events-none" />

       <div className="transform-gpu relative z-10 w-full max-w-md p-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="transform-gpu bg-white/60 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white overflow-hidden transform-gpu">
            
            <div className="transform-gpu flex flex-col items-center mb-10 text-center">
              <div className="transform-gpu w-16 h-16 bg-linear-to-br from-rose-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200 mb-6">
                <Sparkles size={32} />
              </div>
              <h1 className="transform-gpu text-3xl font-bold text-slate-900 tracking-tighter uppercase mb-2">CMS ENGINE</h1>
              <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Neural Interface Access</p>
            </div>

            {error && (
              <div className="transform-gpu bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 text-xs font-bold uppercase tracking-widest border border-rose-100 animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="transform-gpu space-y-6">
              <div className="transform-gpu space-y-2">
                <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Identity@Core.Sys</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all shadow-inner text-sm"
                  placeholder="admin@planner.com"
                />
              </div>
              <div className="transform-gpu space-y-2">
                <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Access Key</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all shadow-inner text-sm"
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="transform-gpu group relative w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.25em] shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale overflow-hidden flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : (
                  <>
                    Initialize Entry
                    <ArrowRight size={16} className="transform-gpu group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="transform-gpu mt-10 text-center pt-8 border-t border-rose-50">
              <p className="transform-gpu text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
                Protected System Environment<br/>
                Unauthorized Access is Logged
              </p>
            </div>
          </div>
       </div>
    </div>
  );
}