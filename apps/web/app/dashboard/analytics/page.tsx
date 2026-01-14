// apps/web/app/dashboard/analytics/page.tsx
import { billing, analytics } from "@domain";
import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FeatureLocked } from "@/shared/components/FeatureLocked";
import AnalyticsClientPage, { AnalyticsData } from "./analytics-client"; // Import new client
import { Suspense } from "react";
import Loading from "./loading";

export default async function AnalyticsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 1. Permission Check
  const perms = await billing.getPagePermissions(user.id);
  
  if (!perms.canViewAnalytics) {
    return <FeatureLocked title="Analytics Dashboard" description="Gain insights into your productivity trends and habit consistency." />;
  }

  // 2. Stream Data with Suspense
  return (
    <Suspense fallback={<Loading />}>
      <AnalyticsContent userId={user.id} />
    </Suspense>
  );
}

async function AnalyticsContent({ userId }: { userId: string }) {
  // ✅ SERVER SIDE FETCH: Runs instantly next to DB
  const rawData = await analytics.getAnalyticsData(userId);

  // Transform to match Client Type if needed (or ensure domain returns exact type)
  // Assuming getAnalyticsData returns the exact shape needed:
  const data: AnalyticsData = rawData;

  return <AnalyticsClientPage data={data} />;
}