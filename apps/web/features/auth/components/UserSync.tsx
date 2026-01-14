// apps/web/features/auth/components/UserSync.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/utils/supabase";

/**
 * Run user sync only once per browser session.
 * Avoid running on every navigation to reduce server load.
 */
export default function UserSync() {
  useEffect(() => {
    const alreadySynced = sessionStorage.getItem("app_user_synced_v1");
    if (alreadySynced) return;

    const doSync = async () => {
      try {
        // Use Supabase client-side auth to check if user is signed in
        const {
          data: { session } = {},
          error: sessErr,
        } = await supabase.auth.getSession();

        if (sessErr) {
          console.warn("UserSync: error getting session", sessErr);
          return;
        }
        if (!session?.user) return;

        const res = await fetch("/api/auth/sync-user", { method: "POST" });
        if (!res.ok) {
          console.warn("UserSync: sync endpoint returned error", await res.text());
        } else {
          sessionStorage.setItem("app_user_synced_v1", "1");
        }
      } catch (err) {
        console.error("UserSync error", err);
      }
    };

    // Run sync once per session (for authenticated user)
    doSync();

    // listen to sign-in/out: if user signs in later, run sync then
    const { data: { subscription } = { } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        sessionStorage.removeItem("app_user_synced_v1");
        // run sync on sign-in
        (async () => {
          try {
            await fetch("/api/auth/sync-user", { method: "POST" });
          } catch (e) {
            console.warn("UserSync sign-in sync failed", e);
          } finally {
            sessionStorage.setItem("app_user_synced_v1", "1");
          }
        })();
      }
      if (event === "SIGNED_OUT") {
        sessionStorage.removeItem("app_user_synced_v1");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return null;
}
