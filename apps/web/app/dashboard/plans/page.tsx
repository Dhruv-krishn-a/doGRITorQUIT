import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth"; // 
import { plans } from "@domain"; // 
import PlansClient from "./plans-client";

// --- Server Component ---
export default async function PlanningPage() {
  // 1. Auth Check (Server Side)
  // We check auth immediately on the server. If not logged in, redirect.
  const user = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Real Data Directly
  // We call the domain function directly. 
  // No fetch('api/plans'), no network overhead, no waiting for the browser.
  // This runs right next to your database.
  const userPlans = await plans.listPlansForUser(user.id);

  // 3. Pass data to the Client Component
  // We pass the fetched plans as a prop to the interactive part of the page.
  return <PlansClient initialPlans={userPlans} />;
}