import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { CourseTrackerView } from "@/features/study/shared/views/CourseTrackerView";

export const dynamic = 'force-dynamic';

export default async function CourseTrackerPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <CourseTrackerView />;
}
