import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubRepoService, githubProjects } from "@gritorquit/domain";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const branch = url.searchParams.get("branch");

    const project = await githubProjects.GithubProjectService.getProjectById(projectId, user.id);
    if (!project || !project.githubRepo) {
      return new NextResponse("Project or GitHub repo not found", { status: 404 });
    }

    const repo = project.githubRepo;

    switch (action) {
      case "branches":
        const branches = await githubRepoService.GithubRepoService.getBranches(user.id, repo);
        return NextResponse.json(branches);
      case "prs":
        const prs = await githubRepoService.GithubRepoService.getPullRequests(user.id, repo);
        return NextResponse.json(prs);
      case "commits":
        if (!branch) return new NextResponse("Branch parameter required", { status: 400 });
        const commits = await githubRepoService.GithubRepoService.getBranchCommits(user.id, repo, branch);
        return NextResponse.json(commits);
      default:
        return new NextResponse("Invalid action", { status: 400 });
    }
  } catch (error: any) {
    console.error(`[GET /api/github-projects/:id/repo-data]`, error.message);
    // If it's a 401 or 404 from GitHub, we can send back a clean message
    if (error.status === 401) return new NextResponse("GitHub Token Invalid or Missing", { status: 401 });
    if (error.status === 404) return new NextResponse("GitHub Repository not found. Ensure the token has access.", { status: 404 });
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
