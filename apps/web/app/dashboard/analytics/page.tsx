// apps/web/app/dashboard/analytics/page.tsx
import { billing, analytics } from "@gritorquit/domain";
import { getServerUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { FeatureLocked } from "@/shared/components/FeatureLocked";
import AnalyticsClientPage, { AnalyticsData } from "./analytics-client"; // Import new client
import { Suspense } from "react";
import Loading from "./loading";

export const metadata = {
  title: "Analytics | gritorquit",
};

export default async function AnalyticsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const perms = await billing.getPagePermissions(user.id);
  
  if (!perms.canViewAnalytics) {
    return <FeatureLocked title="Analytics Dashboard" description="Gain insights into your productivity trends and habit consistency." />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <AnalyticsContent userId={user.id} />
    </Suspense>
  );
}

async function AnalyticsContent({ userId }: { userId: string }) {
  const rawData = await analytics.getAnalyticsData(userId);

  const data: AnalyticsData = rawData;

  return <AnalyticsClientPage data={data} />;
}