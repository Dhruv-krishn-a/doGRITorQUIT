"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

    // 1. Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Login failed");
      setLoading(false);
      return;
    }

    // 2. CHECK ROLE: We must verify if this user is an admin
    // We can do a quick check against the public 'User' table if you have RLS set up,
    // OR just try to push to dashboard and let the server handle it. 
    // Ideally, catch the server redirect loop here.
    
    // For now, let's force the router to hard refresh to pick up the cookie
    router.refresh(); 
    router.push("/"); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
       {/* ... (Keep your existing UI code) ... */}
       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-2 text-center text-slate-900">CMS Admin</h1>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
           {/* ... Inputs ... */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
           <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 rounded-md text-white bg-slate-900 hover:bg-slate-800"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
       </div>
    </div>
  );
}