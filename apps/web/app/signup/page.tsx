// apps/web/app/signup/page.tsx
import dynamic from "next/dynamic";
const AuthForm = dynamic(() => import("@/components/AuthForm"), { ssr: false });

export default function SignupPage() {
  return <AuthForm />;
}
