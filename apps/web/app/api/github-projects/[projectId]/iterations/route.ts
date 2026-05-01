import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubProjects } from "@gritorquit/domain";
import { prisma } from "@gritorquit/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, methodology, sdlcPhaseId, versions } = body;

    const iteration = await githubProjects.GithubProjectService.createIteration(
      projectId, 
      name, 
      methodology, 
      sdlcPhaseId, 
      versions || {}
    );

    return NextResponse.json(iteration);
  } catch (error: any) {
    console.error("[POST /api/github-projects/:id/iterations]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
