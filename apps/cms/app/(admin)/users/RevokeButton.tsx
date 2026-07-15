"use client";

import { useTransition } from "react";
import { revokePlanAction } from "./actions";
import { Ban } from "lucide-react";

export function RevokeButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleRevoke = () => {
    if (confirm("Are you sure you want to revoke this user's active subscription? This will immediately switch them to the Free tier.")) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("userId", userId);
        const res = await revokePlanAction(formData);
        if (!res.success) alert(res.error || "Failed to revoke plan");
      });
    }
  };

  return (
    <button
      onClick={handleRevoke}
      disabled={isPending}
      className={`px-3 py-1 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-1 group ${
        isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      title="Revoke active subscription"
    >
      <Ban size={10} className={isPending ? "animate-pulse" : ""} />
      {isPending ? "REVOKING..." : "REVOKE"}
    </button>
  );
}
