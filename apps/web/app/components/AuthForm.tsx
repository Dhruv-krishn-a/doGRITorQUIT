// apps/web/app/components/AuthForm.tsx
"use client";

import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) router.push("/dashboard");
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <div    div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-md shadow">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Planner</h2>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    </div>
  );
}