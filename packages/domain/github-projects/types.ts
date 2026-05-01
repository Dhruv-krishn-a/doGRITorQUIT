import { z } from 'zod';
import type { ProjectLifecycle as PrismaLifecycle, ProjectMethodology as PrismaMethodology } from '@prisma/client';

export const ProjectMethodology = {
  AGILE: 'AGILE',
  WATERFALL: 'WATERFALL',
  V_MODEL: 'V_MODEL',
  SPIRAL: 'SPIRAL',
  LEAN: 'LEAN',
  DEVOPS: 'DEVOPS'
} as const;

export type ProjectMethodology = keyof typeof ProjectMethodology;

export const ProjectLifecycle = {
  AGILE: 'AGILE',
  WATERFALL: 'WATERFALL',
  V_MODEL: 'V_MODEL',
  SPIRAL: 'SPIRAL'
} as const;

export type ProjectLifecycle = keyof typeof ProjectLifecycle;

export const ProjectStage = {
  REQUIREMENTS: 'REQUIREMENTS',
  USER_FLOW: 'USER_FLOW',
  SYSTEM_FLOW: 'SYSTEM_FLOW',
  METHODOLOGY: 'METHODOLOGY',
  EXECUTION: 'EXECUTION'
} as const;

export type ProjectStage = keyof typeof ProjectStage;

export const GithubProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  projectStage: z.nativeEnum(ProjectStage),
  lifecycle: z.nativeEnum(ProjectLifecycle),
  methodology: z.nativeEnum(ProjectMethodology).nullable(),
  githubRepo: z.string().nullable(),
  prdVerified: z.boolean(),
  userFlowVerified: z.boolean(),
  systemFlowVerified: z.boolean(),
  requirementsNoteId: z.string().nullable(),
  userFlowNoteId: z.string().nullable(),
  systemFlowNoteId: z.string().nullable(),
  activeIterationId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GithubProject = z.infer<typeof GithubProjectSchema>;

export const ProjectIterationSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  status: z.string(),
  sdlcPhaseId: z.string(),
  methodology: z.nativeEnum(ProjectMethodology),
  prdVersionId: z.string().nullable(),
  userFlowVersionId: z.string().nullable(),
  systemFlowVersionId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectIteration = z.infer<typeof ProjectIterationSchema>;

export const GithubFeatureSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  iterationId: z.string().nullable(),
  parentId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  sdlcPhaseId: z.string().nullable(),
  status: z.string(),
  githubIssueId: z.number().nullable(),
  githubBranch: z.string().nullable(),
  githubPullReq: z.number().nullable(),
  hasArchitectureDoc: z.boolean(),
  hasTestPlan: z.boolean(),
  learningNotes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GithubFeature = z.infer<typeof GithubFeatureSchema>;

export const CreateGithubProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  userDescription: z.string().optional(),
  lifecycle: z.nativeEnum(ProjectLifecycle).default('AGILE'),
  githubRepo: z.string().optional(),
});

export type CreateGithubProjectInput = z.infer<typeof CreateGithubProjectSchema>;

export const CreateGithubFeatureSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Feature title is required"),
  description: z.string().optional(),
  iterationId: z.string().optional(),
  parentId: z.string().optional(),
  sdlcPhaseId: z.string().optional(),
});

export type CreateGithubFeatureInput = z.infer<typeof CreateGithubFeatureSchema>;

export const UpdateGithubFeatureSchema = z.object({
  featureId: z.string(),
  title: z.string().min(1, "Title is required").optional(),
});

export type UpdateGithubFeatureInput = z.infer<typeof UpdateGithubFeatureSchema>;

export const UpdateGithubFeatureStatusSchema = z.object({
  featureId: z.string(),
  status: z.string(),
});

export type UpdateGithubFeatureStatusInput = z.infer<typeof UpdateGithubFeatureStatusSchema>;

export const UpdateGithubFeatureEvidenceSchema = z.object({
  featureId: z.string(),
  githubIssueId: z.number().nullable().optional(),
  githubBranch: z.string().nullable().optional(),
  githubPullReq: z.number().nullable().optional(),
  hasArchitectureDoc: z.boolean().optional(),
  hasTestPlan: z.boolean().optional(),
  learningNotes: z.string().nullable().optional(),
});

export type UpdateGithubFeatureEvidenceInput = z.infer<typeof UpdateGithubFeatureEvidenceSchema>;
