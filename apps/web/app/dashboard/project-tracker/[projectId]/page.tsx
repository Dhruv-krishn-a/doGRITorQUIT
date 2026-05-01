import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { githubProjects } from "@gritorquit/domain";
import { prisma } from "@gritorquit/db";
import { JourneyProjectView } from "@/features/journey/views/JourneyProjectView";

export const dynamic = 'force-dynamic';

export default async function ProjectJourneyPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await getServerUser();
  if (!user) redirect("/login");

  const project = await githubProjects.GithubProjectService.getProjectById(projectId, user.id);
  if (!project) redirect("/dashboard/tracker");

  return <JourneyProjectView initialProject={project as any} />;
}
