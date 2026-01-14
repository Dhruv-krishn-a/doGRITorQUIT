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
  const user = await getServerUser();
  if (!user) redirect("/login");

  try {
    const plan = await plans.getPlanForUser(user.id, params.planId);
    
    if (!plan) notFound();


    return <PlanDetailClient initialPlan={plan as unknown as ExtendedPlan} />;
    
  } catch (error) {
    console.error("Error fetching plan:", error);
    notFound();
  }
}