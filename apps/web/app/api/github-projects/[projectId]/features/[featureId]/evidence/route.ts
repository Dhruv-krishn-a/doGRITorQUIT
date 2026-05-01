import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubProjects, githubProjectTypes } from "@gritorquit/domain";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string, featureId: string }> }
) {
  try {
    const { projectId, featureId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const data = githubProjectTypes.UpdateGithubFeatureEvidenceSchema.parse({
      ...json,
      featureId,
    });

    const feature = await githubProjects.GithubProjectService.updateFeatureEvidence(data);
    return NextResponse.json(feature);
  } catch (error: any) {
    console.error("[PATCH /api/github-projects/:id/features/:featureId/evidence]", error);
    return new NextResponse(error.message, { status: 400 });
  }
}
