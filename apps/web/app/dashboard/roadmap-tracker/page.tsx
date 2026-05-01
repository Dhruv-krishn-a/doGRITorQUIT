import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { RoadmapTrackerView } from "@/features/study/shared/views/RoadmapTrackerView";
import { plans, billing } from "@gritorquit/domain";
import { PlanFeature } from "@gritorquit/domain/billing/entitlements";

export const dynamic = 'force-dynamic';

export default async function RoadmapTrackerPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  let userPlans = [];
  let isLimitReached = false;
  let maxPlans = 1;

  try {
    userPlans = await plans.listPlansForUser(user.id);
    maxPlans = await billing.getFeatureLimit(user.id, PlanFeature.MAX_PLANS, 1, 100);
    isLimitReached = userPlans.length >= maxPlans;
  } catch (err) {
    console.error("[RoadmapTrackerPage] Error loading plans:", err);
  }

  return (
    <RoadmapTrackerView 
      initialPlans={userPlans} 
      isLimitReached={isLimitReached} 
      maxPlans={maxPlans} 
    />
  );
}
