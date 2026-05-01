import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { JourneyHubView } from "@/features/journey/views/JourneyHubView";

export const dynamic = 'force-dynamic';

export default async function JourneyHubPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <JourneyHubView />;
}
