import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@gritorquit/db";
import { Octokit } from "octokit";

export async function GET(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: "github",
      }
    });

    if (!account || !account.access_token) {
      return NextResponse.json({ connected: false, repos: [] });
    }

    const octokit = new Octokit({ auth: account.access_token });
    
    // Fetch user's repos (including private ones if scope is granted)
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 50,
    });

    const formattedRepos = repos.map(r => ({
      id: r.id,
      name: r.full_name,
      description: r.description,
      private: r.private,
      url: r.html_url
    }));

    return NextResponse.json({ connected: true, repos: formattedRepos });
  } catch (error: any) {
    console.error("[GET /api/github/repos]", error);
    // If token is invalid/expired, act as disconnected
    if (error.status === 401) {
      return NextResponse.json({ connected: false, repos: [] });
    }
    return new NextResponse(error.message, { status: 500 });
  }
}
