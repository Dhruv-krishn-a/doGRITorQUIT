import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubProjects, githubAiService } from "@gritorquit/domain";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string, iterationId: string }> }
) {
  try {
    const { projectId, iterationId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const methodology = json.methodology;

    const features = await githubAiService.GithubAiService.generateExecutionStrategy(projectId, iterationId, methodology);
    
    return NextResponse.json(features);
  } catch (error: any) {
    console.error("[POST /api/github-projects/:id/iterations/:iterationId/tasks/generate]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
