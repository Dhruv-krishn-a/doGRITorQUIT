// apps/web/app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import Sidebar from "../components/Sidebar";
import UserSync from "../components/UserSync";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      console.log('[DashboardLayout] Checking session...');
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[DashboardLayout] Session error:', error);
        if (mounted) {
          router.replace("/login");
        }
        return;
      }

      if (!mounted) return;

      if (!data?.session) {
        console.log('[DashboardLayout] No session found, redirecting to login');
        router.replace("/login");
      } else {
        console.log('[DashboardLayout] Session found:', {
          userId: data.session.user.id,
          email: data.session.user.email,
          expiresAt: data.session.expires_at
        });
        setSessionInfo({
          userId: data.session.user.id,
          email: data.session.user.email
        });
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking session...</p>
          <p className="text-sm text-gray-500 mt-2">User: {sessionInfo?.email || 'Not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* UserSync ensures user exists in Prisma database before any dashboard actions */}
        <UserSync />
        {children}
      </main>
    </div>
  );
}