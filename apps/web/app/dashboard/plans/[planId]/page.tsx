// apps/web/app/dashboard/plans/[planId]/page.tsx
import React from "react";
import { notFound, redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth"; 
import { plans } from "@domain"; 
import PlanDetailClient, { ExtendedPlan } from "./plan-detail-client";

interface PageProps {
  params: {
    planId: string;
  };
}

export default async function PlanDetailPage({ params }: PageProps) {
  // 1. Auth Check (Server Side)
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 2. Fetch Data Directly (No API Call)
  try {
    // ✅ FIX: Use 'getPlanForUser' and pass 'user.id' first
    // This matches the signature used in your API routes
    const plan = await plans.getPlanForUser(user.id, params.planId);
    
    if (!plan) {
      notFound();
    }

    // 3. Render Client Component
    // We cast to ExtendedPlan because the domain type might be strictly Prisma 
    // but the UI expects the extended interface with optional UI fields.
    return <PlanDetailClient initialPlan={plan as unknown as ExtendedPlan} />;
    
  } catch (error) {
    console.error("Error fetching plan:", error);
    notFound();
  }
}