// apps/web/app/dashboard/plans/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { plans } from "@domain"; // This import was likely crashing
import PlansClient from "./plans-client"; // Assuming this is your list client

// Force dynamic to prevent static generation issues with auth
export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  const user = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  try {
    // Check if plans service is loaded correctly
    if (!plans || typeof plans.listPlansForUser !== 'function') {
      throw new Error("Plans service is not available");
    }

    const userPlans = await plans.listPlansForUser(user.id);
    
    // Check for Plan limits
    // You might need a way to check limits here if you want to pass `isLimitReached`
    // For now, passing false/10 as defaults if not checking
    const isLimitReached = false; 
    const maxPlans = 10; 

    return (
      <PlansClient 
        initialPlans={userPlans} 
        isLimitReached={isLimitReached}
        maxPlans={maxPlans}
      />
    );

  } catch (err) {
    console.error("[PlansPage] Error loading plans:", err);
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Error Loading Plans</h2>
        <p className="text-slate-600 mt-2">
          {err instanceof Error ? err.message : "An unexpected error occurred."}
        </p>
        <p className="text-xs text-slate-400 mt-4">Check server console for details.</p>
      </div>
    );
  }
}