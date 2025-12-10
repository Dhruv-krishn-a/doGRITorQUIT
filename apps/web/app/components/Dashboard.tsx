// apps/web/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js"; // Import the specific type
import { supabase } from "../../utils/supabase";

export default function DashboardPage() {
  // Use User | null instead of any
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
        {/* The User type ensures you get autocomplete here! */}
        <pre style={{ background: "#f4f4f4", padding: 12 }}>
           {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </main>
  );
}