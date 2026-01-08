"use client";

import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../../utils/supabase";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();
  // Store the redirect URL in state to ensure it matches the client's window
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    // 1. Set the redirect URL to your new callback route
    // We do this in useEffect so 'window' is definitely available
    setRedirectUrl(`${window.location.origin}/auth/callback`);

    // 2. Check for existing session
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) router.push("/dashboard");
    })();

    // 3. Listen for auth changes (login success)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-md shadow">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Planner</h2>
        <Auth 
          supabaseClient={supabase} 
          appearance={{ theme: ThemeSupa }}
          providers={['google']} 
          // ✅ FIX: This tells the Google button where to send the user
          redirectTo={redirectUrl}
        />
      </div>
    </div>
  );
}