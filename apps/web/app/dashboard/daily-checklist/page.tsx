// apps/web/app/dashboard/daily-checklist/page.tsx (Server Component)
import { billing } from "@domain";
import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FeatureLocked } from "@/shared/components/FeatureLocked";
import ChecklistClientPage from "./client"; // Import the UI you renamed

export default async function DailyChecklistPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 🔒 CHECK PERMISSION
  const perms = await billing.getPagePermissions(user.id);
  
  if (!perms.canViewChecklist) {
    return <FeatureLocked title="Daily Checklist" description="Track your daily habits, mood, and health with our advanced tracker." />;
  }

  // ✅ RENDER UI
  return <ChecklistClientPage />;
}