// apps/web/features/auth/components/UserSync.tsx
"use client";

import { useEffect } from "react";

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
        const res = await fetch("/api/auth/sync-user", { method: "POST" });
        if (res.status === 401) {
          return;
        }
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

    return () => {};
  }, []);

  return null;
}
