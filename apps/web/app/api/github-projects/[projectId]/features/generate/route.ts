import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubAiService } from "@gritorquit/domain";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    let description = "";
    try {
      const json = await req.json();
      description = json.description || "";
    } catch (e) {
      // Body is empty or not JSON, that's fine
    }

    const newFeatures = await githubAiService.GithubAiService.generateInitialFeatures(
      projectId, 
      user.id, 
      description
    );
    return NextResponse.json(newFeatures);
  } catch (error: any) {
    console.error("[POST /api/github-projects/:id/features/generate]", error);
    return new NextResponse(error.message, { status: 400 });
  }
}
