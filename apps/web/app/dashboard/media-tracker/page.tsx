import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { MediaTrackerView } from "@/features/study/shared/views/MediaTrackerView";

export const dynamic = 'force-dynamic';

export default async function MediaTrackerPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <MediaTrackerView />;
}
