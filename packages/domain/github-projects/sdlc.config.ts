import { ProjectMethodology } from "./types";

export type SDLCStage = {
  id: string;
  label: string;
  description: string;
  requiredArtifacts?: string[];
};

export const SDLC_CONFIGS: Record<ProjectMethodology, SDLCStage[]> = {
  [ProjectMethodology.AGILE]: [
    { id: "BACKLOG", label: "Backlog", description: "Prioritizing the product backlog." },
    { id: "SPRINT", label: "Sprint Planning", description: "Defining the sprint goal." },
    { id: "DEV", label: "Development", description: "Active coding and implementation.", requiredArtifacts: ["GITHUB_BRANCH"] },
    { id: "TEST", label: "Testing", description: "QA and user acceptance testing.", requiredArtifacts: ["GITHUB_PR"] },
    { id: "REVIEW", label: "Review", description: "Sprint review and demo." },
    { id: "RELEASE", label: "Release", description: "Deployment and delivery." }
  ],
  [ProjectMethodology.WATERFALL]: [
    { id: "DESIGN", label: "Design", description: "System and technical design.", requiredArtifacts: ["ARCH_DOC"] },
    { id: "BUILD", label: "Implementation", description: "Full system build phase.", requiredArtifacts: ["GITHUB_BRANCH"] },
    { id: "TEST", label: "Testing", description: "Rigorous verification and validation.", requiredArtifacts: ["GITHUB_PR", "TEST_PLAN"] },
    { id: "DEPLOY", label: "Deployment", description: "Final rollout and delivery." },
    { id: "MAINTENANCE", label: "Maintenance", description: "Ongoing support and fixes." }
  ],
  [ProjectMethodology.DEVOPS]: [
    { id: "PLAN", label: "Plan", description: "Project planning and ideation." },
    { id: "CODE", label: "Code", description: "Writing and managing code.", requiredArtifacts: ["GITHUB_BRANCH"] },
    { id: "BUILD", label: "Build", description: "Compiling and packaging artifacts." },
    { id: "TEST", label: "Test", description: "Automated and manual testing.", requiredArtifacts: ["GITHUB_PR"] },
    { id: "RELEASE", label: "Release", description: "Managing release candidates." },
    { id: "DEPLOY", label: "Deploy", description: "Deployment to production." }
  ],
  [ProjectMethodology.SPIRAL]: [
    { id: "PLAN", label: "Planning", description: "Initial goals and constraints." },
    { id: "RISK", label: "Risk Analysis", description: "Identifying and mitigating risks." },
    { id: "ENGINEERING", label: "Engineering", description: "Iteration and prototyping.", requiredArtifacts: ["GITHUB_BRANCH"] },
    { id: "TEST", label: "Testing", description: "Verification of current iteration.", requiredArtifacts: ["GITHUB_PR"] },
    { id: "EVALUATION", label: "Evaluation", description: "Assessing performance and planning next loop." }
  ],
  [ProjectMethodology.V_MODEL]: [
    { id: "SYS_DESIGN", label: "System Design", description: "High-level architecture.", requiredArtifacts: ["ARCH_DOC"] },
    { id: "ARC_DESIGN", label: "Architecture", description: "Component and DB design." },
    { id: "CODING", label: "Coding", description: "Implementation of designs.", requiredArtifacts: ["GITHUB_BRANCH"] },
    { id: "VERIFICATION", label: "Verification", description: "Internal testing and checks.", requiredArtifacts: ["GITHUB_PR"] },
    { id: "VALIDATION", label: "Validation", description: "Final acceptance testing.", requiredArtifacts: ["TEST_PLAN"] }
  ],
  [ProjectMethodology.LEAN]: [
    { id: "VALUE", label: "Identify Value", description: "Determining core customer value." },
    { id: "STREAM", label: "Map Stream", description: "Optimizing the value delivery flow." },
    { id: "WASTE", label: "Eliminate Waste", description: "Removing inefficient processes." },
    { id: "BUILD", label: "Build", description: "Focusing on lean implementation.", requiredArtifacts: ["GITHUB_BRANCH"] },
    { id: "MEASURE", label: "Measure", description: "Analyzing impact and metrics." },
    { id: "IMPROVE", label: "Improve", description: "Continuous learning and iterations." }
  ]
};

export const getStagesForMethodology = (methodology: ProjectMethodology | null) => {
  return SDLC_CONFIGS[methodology || ProjectMethodology.AGILE];
};
