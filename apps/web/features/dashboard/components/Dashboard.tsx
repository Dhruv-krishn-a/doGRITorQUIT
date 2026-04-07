// apps/web/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

export default function DashboardPage() {
  const [user, setUser] = useState<Session["user"] | null>(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setUser(session?.user ?? null);
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Welcome — you are logged in.</p>

      <div style={{ marginTop: 16 }}>
        <strong>User:</strong>
        {/* The User type ensures you get autocomplete here! */}
        <pre style={{ background: "#f4f4f4", padding: 12 }}>
           {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </main>
  );
}
