import { prisma } from '@gritorquit/db';
import { 
  CreateGithubProjectInput, 
  CreateGithubFeatureInput, 
  UpdateGithubFeatureStatusInput 
} from './types';

export const GithubProjectService = {
  async createProject(userId: string, data: CreateGithubProjectInput) {
    return prisma.githubProject.create({
      data: {
        name: data.name,
        description: data.description,
        lifecycle: data.lifecycle,
        githubRepo: data.githubRepo,
        userId,
        projectStage: 'EXECUTION', // Existing projects skip planning by default
      }
    });
  },

  async createProjectConsultation(userId: string, data: { name: string, description: string }) {
    // 1. Create the project in REQUIREMENTS stage
    const project = await prisma.githubProject.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        lifecycle: 'AGILE', 
        projectStage: 'REQUIREMENTS'
      }
    });

    return project;
  },

  async linkRequirementsNote(projectId: string, noteId: string) {
    return prisma.githubProject.update({
      where: { id: projectId },
      data: { requirementsNoteId: noteId }
    });
  },

  async updateProjectLifecycle(projectId: string, lifecycle: import('@prisma/client').ProjectLifecycle) {
    return prisma.githubProject.update({
      where: { id: projectId },
      data: { lifecycle }
    });
  },

  async getProjectsForUser(userId: string) {
    return prisma.githubProject.findMany({
      where: { userId },
      include: { features: true },
      orderBy: { updatedAt: 'desc' }
    });
  },

  async getProjectById(projectId: string, userId: string) {
    return prisma.githubProject.findFirst({
      where: { id: projectId, userId },
      include: { 
        features: { orderBy: { createdAt: 'asc' } },
        iterations: { orderBy: { createdAt: 'desc' } },
        requirementsNote: true,
        userFlowNote: true,
        systemFlowNote: true
      }
    });
  },

  async sealBlueprintVersion(noteId: string, contentSnapshot: any) {
    const previousVersionsCount = await prisma.blueprintVersion.count({
      where: { noteId }
    });
    
    return prisma.blueprintVersion.create({
      data: {
        noteId,
        contentSnapshot,
        versionNumber: previousVersionsCount + 1,
      }
    });
  },

  async createIteration(projectId: string, name: string, methodology: any, sdlcPhaseId: string, versions: { prdVersionId?: string, userFlowVersionId?: string, systemFlowVersionId?: string }) {
    const iteration = await prisma.projectIteration.create({
      data: {
        projectId,
        name,
        methodology,
        sdlcPhaseId,
        prdVersionId: versions.prdVersionId,
        userFlowVersionId: versions.userFlowVersionId,
        systemFlowVersionId: versions.systemFlowVersionId,
      }
    });
    
    await prisma.githubProject.update({
      where: { id: projectId },
      data: { activeIterationId: iteration.id, methodology, projectStage: 'EXECUTION' }
    });
    
    return iteration;
  },

  async updateIterationPhase(iterationId: string, phaseId: string) {
    return prisma.projectIteration.update({
      where: { id: iterationId },
      data: { sdlcPhaseId: phaseId }
    });
  },

  async createFeature(data: CreateGithubFeatureInput) {
    const { parentId, projectId, iterationId, ...rest } = data;
    return prisma.githubFeature.create({
      data: {
        ...rest,
        project: { connect: { id: projectId } },
        ...(iterationId ? { iteration: { connect: { id: iterationId } } } : {}),
        ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
      }
    });
  },

  async updateFeatureStatus(data: UpdateGithubFeatureStatusInput) {
    return prisma.githubFeature.update({
      where: { id: data.featureId },
      data: { status: data.status }
    });
  },

  async updateFeature(data: import('./types').UpdateGithubFeatureInput) {
    return prisma.githubFeature.update({
      where: { id: data.featureId },
      data: { title: data.title }
    });
  },

  async deleteFeature(featureId: string) {
    return prisma.githubFeature.delete({
      where: { id: featureId }
    });
  },

  async updateFeatureEvidence(data: import('./types').UpdateGithubFeatureEvidenceInput) {
    const { featureId, ...updates } = data;
    return prisma.githubFeature.update({
      where: { id: featureId },
      data: updates
    });
  },

  async updateProject(projectId: string, userId: string, data: any) {
    return prisma.githubProject.update({
      where: { id: projectId, userId },
      data,
      include: {
        features: true,
        requirementsNote: true,
        userFlowNote: true,
        systemFlowNote: true,
      }
    });
  },

  async deleteProject(projectId: string, userId: string) {
    const project = await prisma.githubProject.findFirst({ 
      where: { id: projectId, userId },
      select: { 
        id: true, 
        requirementsNoteId: true, 
        userFlowNoteId: true, 
        systemFlowNoteId: true 
      }
    });

    if (!project) throw new Error("Project not found or unauthorized");

    // 1. Collect blueprint notes for cleanup
    const noteIds = [
      project.requirementsNoteId,
      project.userFlowNoteId,
      project.systemFlowNoteId
    ].filter(Boolean) as string[];

    // 2. Delete the project (cascades to GithubFeatures)
    await prisma.githubProject.delete({
      where: { id: projectId }
    });

    // 3. Cleanup associated notes
    if (noteIds.length > 0) {
      await prisma.note.deleteMany({
        where: { id: { in: noteIds } }
      });
    }
    
    return true;
  }
};
