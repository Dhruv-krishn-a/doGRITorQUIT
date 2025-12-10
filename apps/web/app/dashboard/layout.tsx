// apps/web/app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    })();
  }, [router]);

  if (checking) {
    return <div className="flex items-center justify-center min-h-screen">Checking session…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
