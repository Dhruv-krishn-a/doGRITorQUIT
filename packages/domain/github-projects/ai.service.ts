import { GoogleGenerativeAI } from "@google/generative-ai";
import { GithubProjectService } from "./service";
import { GithubRepoService } from "./github.service";
import { prisma } from "@gritorquit/db";

export const GithubAiService = {
  async generateRetrospective(projectId: string, featureId: string, userId: string) {
    const apiKey = process.env.GRITio_ProjectSection_API_KEY;
    if (!apiKey) throw new Error("AI Integration Error: GRITio_ProjectSection_API_KEY is missing.");
    const genAI = new GoogleGenerativeAI(apiKey);

    const project = await GithubProjectService.getProjectById(projectId, userId);
    if (!project) throw new Error("Project not found");

    const feature = project.features.find(f => f.id === featureId);
    if (!feature) throw new Error("Feature not found");

    let commits: any[] = [];
    let prs: any[] = [];
    
    if (project.githubRepo && feature.githubBranch) {
      try {
        commits = await GithubRepoService.getBranchCommits(userId, project.githubRepo, feature.githubBranch);
        const allPrs = await GithubRepoService.getPullRequests(userId, project.githubRepo);
        prs = allPrs.filter(pr => pr.branch === feature.githubBranch);
      } catch (err) {
        console.warn("Failed to fetch GitHub evidence:", err);
      }
    }

    const recentCommits = commits.slice(0, 30).map(c => `- ${c.message} (by ${c.author})`).join("\n");
    const recentPrs = prs.slice(0, 5).map(pr => `- PR #${pr.id}: ${pr.title} [${pr.state}]`).join("\n");

    const prompt = `
      You are an expert Senior Engineering Manager. Generate a retrospective for feature: "${feature.title}".
      
      PROJECT CONTEXT: ${project.name} (${project.lifecycle})
      EVIDENCE:
      Commits: ${recentCommits || "None"}
      PRs: ${recentPrs || "None"}

      Format in Markdown:
      ### 🎯 Execution Summary
      ### 🚧 Friction Points
      ### 💡 Core Lesson
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return prisma.githubFeature.update({
      where: { id: featureId },
      data: { learningNotes: responseText }
    });
  },

  async generateInitialFeatures(projectId: string, userId: string, userProvidedDescription?: string) {
    const apiKey = process.env.GRITio_ProjectSection_API_KEY;
    if (!apiKey) throw new Error("AI Integration Error: GRITio_ProjectSection_API_KEY is missing.");
    const genAI = new GoogleGenerativeAI(apiKey);

    const project = await GithubProjectService.getProjectById(projectId, userId);
    if (!project) throw new Error("Project not found");

    // Fetch PRD and Flows for context
    const prdNote = project.requirementsNoteId ? await prisma.note.findUnique({ where: { id: project.requirementsNoteId } }) : null;
    const userFlowNote = project.userFlowNoteId ? await prisma.note.findUnique({ where: { id: project.userFlowNoteId } }) : null;
    const systemFlowNote = project.systemFlowNoteId ? await prisma.note.findUnique({ where: { id: project.systemFlowNoteId } }) : null;

    let repoContext = "";
    if (project.githubRepo) {
      try {
        const repo = project.githubRepo;
        const tree = await GithubRepoService.getRepoTree(userId, repo);
        const folderStructure = tree.map(t => `- ${t.path} (${t.type})`).join("\n");
        const packageJsonStr = await GithubRepoService.getFileContent(userId, repo, 'package.json');
        let dependencies = "None";
        if (packageJsonStr) { try { const pkg = JSON.parse(packageJsonStr); dependencies = Object.keys(pkg.dependencies || {}).join(", "); } catch(e) {} }
        
        repoContext = `
        REPOSITORY DATA:
        File Tree: ${folderStructure}
        Dependencies: ${dependencies}
        `;
      } catch (err) {}
    }

    const prompt = `
      You are a Senior Technical Architect and Project Manager. 
      I need a HIGH-GRANULARITY Technical Roadmap for the project: "${project.name}".
      
      CONTEXT (PRD / ARCHITECTURE):
      PRD Content: ${JSON.stringify(prdNote?.content || "N/A")}
      User Flow: ${JSON.stringify(userFlowNote?.content || "N/A")}
      System Architecture: ${JSON.stringify(systemFlowNote?.content || "N/A")}
      
      ${repoContext}

      GOAL: 
      Extract 10-15 granular technical tasks. Do NOT use generic buckets like "Frontend" or "Backend".
      Use specific technical terms (e.g., "Implement JWT refresh token rotation", "Setup Supabase Row Level Security for Tables", "Integrate YouTube Data API v3 Playlist Endpoint").

      SDLC METHODOLOGY: ${project.methodology || "AGILE"}

      Respond with ONLY a valid JSON array of objects:
      [
        {
          "title": "Clear Technical Task Name",
          "description": "2-3 sentences explaining exactly WHAT to build and WHY.",
          "stage": "The stage ID from the methodology",
          "technical_details": "Brief technical notes on implementation (stack, specific APIs, or patterns)."
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Robust extraction: Find the first [ and last ]
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1) {
      console.error("AI Response did not contain a JSON array:", text);
      throw new Error("AI generated an invalid roadmap. Please try again.");
    }

    const jsonStr = text.substring(start, end + 1);
    let featuresList: any[] = [];
    try {
      featuresList = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI JSON:", jsonStr);
      throw new Error("AI roadmap parsing failed. Please try again.");
    }

    const createdFeatures = [];
    for (const f of featuresList.slice(0, 15)) {
      if (!f.title) continue;
      const newFeature = await GithubProjectService.createFeature({ 
        projectId, 
        title: f.title, 
        description: `${f.description || ""}\n\nTechnical Notes: ${f.technical_details || "N/A"}`
      });
      const updated = await prisma.githubFeature.update({
         where: { id: newFeature.id },
         data: { 
           sdlcPhaseId: f.stage || "DEV", 
           githubBranch: null 
         }
      });
      createdFeatures.push(updated);
    }
    return createdFeatures;
    },

  async generateExecutionStrategy(projectId: string, iterationId: string, methodology: string) {
    const apiKey = process.env.GRITio_ProjectSection_API_KEY;
    if (!apiKey) throw new Error("AI Integration Error: GRITio_ProjectSection_API_KEY is missing.");
    const genAI = new GoogleGenerativeAI(apiKey);

    const iteration = await prisma.projectIteration.findUnique({
      where: { id: iterationId },
      include: { prdVersion: true, userFlowVersion: true, systemFlowVersion: true }
    });

    if (!iteration) throw new Error("Iteration not found");

    const project = await prisma.githubProject.findUnique({
      where: { id: projectId }
    });
    
    if (!project) throw new Error("Project not found");

    const prompt = `
      You are a Senior Technical Architect and Project Manager. 
      I need a HIGH-GRANULARITY Technical Roadmap Execution Strategy.
      Project: "${project.name}"
      
      CONTEXT:
      PRD: ${JSON.stringify(iteration.prdVersion?.contentSnapshot || "N/A")}
      User Flow: ${JSON.stringify(iteration.userFlowVersion?.contentSnapshot || "N/A")}
      System Architecture: ${JSON.stringify(iteration.systemFlowVersion?.contentSnapshot || "N/A")}

      GOAL: 
      Generate a set of Epics with their corresponding granular technical tasks. Do NOT use generic buckets.
      Use specific technical terms.

      SDLC METHODOLOGY: ${methodology}

      Respond with ONLY a valid JSON array of objects grouping tasks by Epic/Feature:
      [
        {
          "epic": "User Authentication",
          "description": "Secure sign-up and login flow",
          "tasks": [
             { "title": "Setup OAuth Providers", "phase": "DESIGN", "details": "Configure Google/GitHub" },
             { "title": "Implement JWT Middleware", "phase": "DEV", "details": "Verify access tokens" }
          ]
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("AI generated an invalid execution strategy. Please try again.");
    }

    const jsonStr = text.substring(start, end + 1);
    let epicsList: any[] = [];
    try {
      epicsList = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("AI execution strategy parsing failed. Please try again.");
    }

    const createdEpics = [];
    for (const epic of epicsList) {
      if (!epic.epic) continue;
      
      const newEpic = await prisma.githubFeature.create({
         data: {
           project: { connect: { id: projectId } },
           ...(iterationId ? { iteration: { connect: { id: iterationId } } } : {}),
           title: epic.epic,
           description: epic.description || "",
           status: "TODO"
         }
      });
      
      if (epic.tasks && Array.isArray(epic.tasks)) {
        for (const task of epic.tasks) {
          if (!task.title) continue;
          await prisma.githubFeature.create({
            data: {
              project: { connect: { id: projectId } },
              ...(iterationId ? { iteration: { connect: { id: iterationId } } } : {}),
              parent: { connect: { id: newEpic.id } },
              sdlcPhaseId: task.phase || "DEV",
              title: task.title,
              description: task.details || "",
              status: "TODO"
            }
          });
        }
      }

      const epicWithTasks = await prisma.githubFeature.findUnique({
        where: { id: newEpic.id },
        include: { subTasks: true }
      });
      
      if (epicWithTasks) {
        createdEpics.push(epicWithTasks);
      }
    }
    return createdEpics;
  },

  async generatePRD(projectName: string, description: string) {
    const apiKey = process.env.GRITio_ProjectSection_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey || "");
    const prompt = `Generate a detailed PRD for project: "${projectName}". Description: ${description}. Include Overview, Functional Reqs, Non-Functional Reqs, Success Metrics. Format in Markdown.`;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  async generateBlueprint(projectId: string, userId: string, type: "USER_FLOW" | "SYSTEM_FLOW") {
    const project = await GithubProjectService.getProjectById(projectId, userId);
    if (!project) throw new Error("Project not found");
    const prdNote = project.requirementsNoteId ? await prisma.note.findUnique({ where: { id: project.requirementsNoteId } }) : null;
    const userFlowNote = project.userFlowNoteId ? await prisma.note.findUnique({ where: { id: project.userFlowNoteId } }) : null;

    const apiKey = process.env.GRITio_ProjectSection_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey || "");

    let prompt = "";
    if (type === "USER_FLOW") {
      prompt = `Create a User Journey Flow for "${project.name}". Context: ${JSON.stringify(prdNote?.content)}. Format in Markdown.`;
    } else {
      prompt = `Create a System Architecture Flow for "${project.name}". Context: ${JSON.stringify(prdNote?.content)} and User Flow: ${JSON.stringify(userFlowNote?.content)}. Format in Markdown.`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const markdown = result.response.text();

    const blocks: any[] = [{ id: `b-${Date.now()}`, type: "heading", props: { level: 1 }, content: [{ type: "text", text: type === "USER_FLOW" ? "User Flow" : "System Architecture", styles: {} }] }];
    markdown.split("\n").filter(l => l.trim()).forEach((l, i) => {
      blocks.push({ id: `b-${Date.now()}-${i}`, type: l.startsWith("#") ? "heading" : "paragraph", props: l.startsWith("#") ? { level: 2 } : {}, content: [{ type: "text", text: l.replace(/#/g, "").trim(), styles: {} }] });
    });

    const note = await prisma.note.create({
      data: { userId, title: type === "USER_FLOW" ? "User Flow" : "System Flow", content: { hybrid: true, version: 3, content: { blocks, strokes: [] } } as any, category: "PROJECT" }
    });

    await prisma.githubProject.update({ where: { id: projectId }, data: { [type === "USER_FLOW" ? "userFlowNoteId" : "systemFlowNoteId"]: note.id } });
    return note;
  },

  async generateInitialRequirementsNote(userId: string, projectId: string, projectName: string, description: string) {
    const prdMarkdown = await this.generatePRD(projectName, description);
    const blocks: any[] = [{ id: `b-${Date.now()}`, type: "heading", props: { level: 1 }, content: [{ type: "text", text: `${projectName} - Requirements`, styles: { bold: true } }] }];
    prdMarkdown.split("\n").filter(l => l.trim()).forEach((line, index) => {
       blocks.push({ id: `b-${Date.now()}-${index}`, type: line.startsWith("#") ? "heading" : "paragraph", props: line.startsWith("#") ? { level: 2 } : {}, content: [{ type: "text", text: line.replace(/#/g, "").trim(), styles: {} }] });
    });
    const note = await prisma.note.create({ data: { userId, title: `${projectName} - Requirements`, content: { hybrid: true, version: 3, content: { blocks, strokes: [] } } as any, category: "PROJECT" } });
    await prisma.githubProject.update({ where: { id: projectId }, data: { requirementsNoteId: note.id } });
    return note;
  }
};
