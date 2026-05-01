import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { githubProjects, githubProjectTypes, githubAiService } from "@gritorquit/domain";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    
    // Check if it's a new consultation project
    if (json.isConsultation) {
       const project = await githubProjects.GithubProjectService.createProjectConsultation(user.id, {
         name: json.name,
         description: json.description
       });
       
       // Fire and forget AI PRD generation (or await it for better sync)
       await githubAiService.GithubAiService.generateInitialRequirementsNote(
         user.id,
         project.id,
         project.name,
         json.description
       );

       return NextResponse.json(project);
    }

    const data = githubProjectTypes.CreateGithubProjectSchema.parse(json);
    const project = await githubProjects.GithubProjectService.createProject(user.id, data);
    return NextResponse.json(project);
  } catch (error: any) {
    console.error("[POST /api/github-projects]", error);
    return new NextResponse(error.message, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const projects = await githubProjects.GithubProjectService.getProjectsForUser(user.id);
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("[GET /api/github-projects]", error);
    return new NextResponse(error.message, { status: 400 });
  }
}
