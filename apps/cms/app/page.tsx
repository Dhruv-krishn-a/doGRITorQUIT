// apps/cms/app/page.tsx
import React from "react";

export default async function Page() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/cms/entries`, { cache: "no-store" });
  const entries = await res.json().catch(() => []);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>CMS Admin</h1>
      <p style={{ marginBottom: 24 }}>Minimal admin UI — expand with forms & auth.</p>

      <div>
        {Array.isArray(entries) && entries.length > 0 ? (
          entries.map((e: any) => (
            <div key={e.id} style={{ padding: 12, border: "1px solid #eee", marginBottom: 8, borderRadius: 6 }}>
              <div style={{ fontWeight: 600 }}>{e.title || "Untitled"}</div>
              <div style={{ color: "#666", fontSize: 13 }}>{e.status} • {e.slug}</div>
            </div>
          ))
        ) : (
          <div style={{ color: "#666" }}>No entries yet.</div>
        )}
      </div>
    </div>
  );
}