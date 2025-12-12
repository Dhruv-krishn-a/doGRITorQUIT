// apps/web/app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";         // <-- FIXED PATH
import Sidebar from "../components/Sidebar";          // <-- FIXED PATH

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!data?.session) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Checking session…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
