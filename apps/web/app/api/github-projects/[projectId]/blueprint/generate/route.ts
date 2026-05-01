import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubAiService } from "@gritorquit/domain";

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const user = await getServerUser();
  if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;
  const { type } = await req.json();

  try {
    const note = await githubAiService.GithubAiService.generateBlueprint(projectId, user.id, type);
    return NextResponse.json(note);
  } catch (err: any) {
    console.error("[POST /api/github-projects/:id/blueprint/generate]", err);
    return new NextResponse(err.message, { status: 500 });
  }
}
