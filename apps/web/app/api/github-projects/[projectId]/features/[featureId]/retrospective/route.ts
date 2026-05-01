import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubAiService } from "@gritorquit/domain";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string, featureId: string }> }
) {
  try {
    const { projectId, featureId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const feature = await githubAiService.GithubAiService.generateRetrospective(
      projectId,
      featureId,
      user.id
    );

    return NextResponse.json(feature);
  } catch (error: any) {
    console.error("[POST /api/github-projects/:id/features/:featureId/retrospective]", error);
    return new NextResponse(error.message, { status: 400 });
  }
}
