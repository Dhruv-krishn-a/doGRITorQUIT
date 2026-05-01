import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubProjects } from "@gritorquit/domain";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const project = await githubProjects.GithubProjectService.getProjectById(projectId, user.id);
    if (!project) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("[GET /api/github-projects/:id]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    await githubProjects.GithubProjectService.deleteProject(projectId, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[DELETE /api/github-projects/:id]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const project = await githubProjects.GithubProjectService.updateProject(projectId, user.id, body);
    return NextResponse.json(project);
  } catch (error: any) {
    console.error("[PATCH /api/github-projects/:id]", error);
    return new NextResponse(error.message, { status: 500 });
  }
}
