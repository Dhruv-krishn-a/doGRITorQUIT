// apps/web/app/dashboard/analytics/page.tsx (Server Component)
import { billing } from "@domain";
import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FeatureLocked } from "@/shared/components/FeatureLocked";
import AnalyticsClientPage from "./client"; // Import the UI you renamed

export default async function AnalyticsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 🔒 CHECK PERMISSION
  const perms = await billing.getPagePermissions(user.id);
  
  if (!perms.canViewAnalytics) {
    return <FeatureLocked title="Analytics Dashboard" description="Gain insights into your productivity trends and habit consistency." />;
  }

  // ✅ RENDER UI
  return <AnalyticsClientPage />;
}