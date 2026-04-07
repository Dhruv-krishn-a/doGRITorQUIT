// apps/web/app/dashboard/plans/[planId]/page.tsx
import React from "react";
import { notFound, redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server"; 
import { plans } from "@gritorquit/domain"; 
import PlanDetailClient, { ExtendedPlan } from "./plan-detail-client";

// ✅ FIX 1: Type params as a Promise
interface PageProps {
  params: Promise<{
    planId: string;
  }>;
}

export default async function PlanDetailPage({ params }: PageProps) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // ✅ FIX 2: Await the params
  const { planId } = await params;

  try {
    const plan = await plans.getPlanForUser(user.id, planId);
    
    if (!plan) notFound();

    return <PlanDetailClient initialPlan={plan as unknown as ExtendedPlan} />;
    
  } catch (error) {
    console.error("Error fetching plan:", error);
    notFound();
  }
}