"use client";

import { Suspense } from "react";
import AuthPage from "@/features/auth/components/AuthPage";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-color)]" />
      </div>
    }>
      <AuthPage view="reset-password" />
    </Suspense>
  );
}
