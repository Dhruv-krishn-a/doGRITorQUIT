import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubProjects, githubProjectTypes } from "@gritorquit/domain";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const data = githubProjectTypes.CreateGithubFeatureSchema.parse({
      ...json,
      projectId
    });

    const feature = await githubProjects.GithubProjectService.createFeature(data);
    return NextResponse.json(feature);
  } catch (error: any) {
    console.error("[POST /api/github-projects/:id/features]", error);
    return new NextResponse(error.message, { status: 400 });
  }
}
