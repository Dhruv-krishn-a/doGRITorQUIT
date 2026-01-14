// apps/web/app/dashboard/plans/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth"; 
import { plans, billing } from "@domain"; 
import PlansClient from "./plans-client";
import { FeatureLocked } from "@/shared/components/FeatureLocked";

export const metadata = {
  title: "My Plans | Planner AI",
};

export default async function PlanningPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 1. Fetch Permissions & Entitlements in Parallel
  const [userPlans, permissions, entitlements] = await Promise.all([
    plans.listPlansForUser(user.id),
    billing.getPagePermissions(user.id),
    billing.getUserEntitlements(user.id)
  ]);

  // 2. Check Access Permission
  if (!permissions.canViewPlans) {
    return <FeatureLocked title="Project Planning" description="Upgrade to create and manage detailed project plans." />;
  }

  // 3. Check Creation Limits (MAX_PLANS)
  let maxPlans = 1; // Default fallback
  const limitFeat = entitlements.features['MAX_PLANS'];
  
  if (limitFeat) {
    // Handle both raw number or object structure
    maxPlans = (typeof limitFeat.value === 'number') ? limitFeat.value 
             : (typeof limitFeat === 'number') ? limitFeat 
             : 3; // Default free limit
  } else if (entitlements.productKey !== 'FREE') {
    maxPlans = Infinity; // Paid plans usually unlimited if not specified
  }

  const isLimitReached = maxPlans !== Infinity && userPlans.length >= maxPlans;

  return (
    <PlansClient 
      initialPlans={userPlans} 
      isLimitReached={isLimitReached}
      maxPlans={maxPlans}
    />
  );
}