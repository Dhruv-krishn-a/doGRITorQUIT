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
    const data = githubProjectTypes.UpdateGithubFeatureStatusSchema.parse({
      featureId,
      status: json.status || json.stage
    });

    const feature = await githubProjects.GithubProjectService.updateFeatureStatus(data);
    return NextResponse.json(feature);
  } catch (error: any) {
    console.error("[PATCH /api/github-projects/:id/features/:featureId]", error);
    return new NextResponse(error.message, { status: 400 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string, featureId: string }> }
) {
  try {
    const { featureId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const data = githubProjectTypes.UpdateGithubFeatureSchema.parse({
      featureId,
      title: json.title
    });

    const feature = await githubProjects.GithubProjectService.updateFeature(data);
    return NextResponse.json(feature);
  } catch (error: any) {
    console.error("[PUT /api/github-projects/:id/features/:featureId]", error);
    return new NextResponse(error.message, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string, featureId: string }> }
) {
  try {
    const { featureId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    await githubProjects.GithubProjectService.deleteFeature(featureId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[DELETE /api/github-projects/:id/features/:featureId]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
