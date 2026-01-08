// apps/web/app/signup/page.tsx
"use client";

import dynamic from "next/dynamic";
const AuthForm = dynamic(() => import("@/features/auth/components/AuthForm"), { ssr: false });

export default function SignupPage() {
  return <AuthForm />;
}
