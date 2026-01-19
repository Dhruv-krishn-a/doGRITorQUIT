import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
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
    // ✅ FIX: Use the correct function name exported from your domain
    billing.fetchUserEntitlements(user.id) 
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
    // Logic: If it's a number (legacy), use it. If object, look for 'value'.
    const val = (typeof limitFeat === 'number') ? limitFeat : limitFeat.value;
    if (typeof val === 'number') maxPlans = val;
    else maxPlans = 1; // Fallback if format is unexpected
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