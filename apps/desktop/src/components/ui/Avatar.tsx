import React from "react";

export default function Avatar({ email, size = 8 }: { email?: string | null; size?: number }) {
  const initials = email?.[0]?.toUpperCase() ?? "?";
  
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold`}
      style={{ width: size * 4, height: size * 4 }}
    >
      {initials}
    </div>
  );
}
