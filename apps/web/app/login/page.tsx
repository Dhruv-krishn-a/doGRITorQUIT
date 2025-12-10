"use client";
import dynamic from "next/dynamic";
const AuthForm = dynamic(() => import("../components/AuthForm"), { ssr: false });

export default function LoginPage() {
  return <AuthForm />;
}
