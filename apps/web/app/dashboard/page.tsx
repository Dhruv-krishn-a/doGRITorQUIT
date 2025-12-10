// apps/web/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
// 1. Import the specific type from supabase-js
import { User } from "@supabase/supabase-js"; 
import { supabase } from "../../utils/supabase";

export default function DashboardPage() {
  // 2. Use the 'User' type (or null if not logged in) instead of 'any'
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Welcome — you are logged in.</p>

      <div style={{ marginTop: 16 }}>
        <strong>User:</strong>
        <pre style={{ background: "#f4f4f4", padding: 12 }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </main>
  );
}