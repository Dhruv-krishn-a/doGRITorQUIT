// apps/web/types/plan.ts

export interface Plan {
  id: string;
  title: string;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  progress?: number;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  date: Date | string | null;
  priority: string | null;
  estimatedMinutes: number | null;
  status: string;
  planId: string;
  userId: string;
  subtasks?: Subtask[];
  tags?: string[];
}

export interface Subtask {
  id: string;
  title: string;
  taskId: string;
  completed?: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  tag: Tag;
}

export interface CreatePlanInput {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePlanInput {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

// --- AI ARCHITECT TYPES ---
export interface SyllabusModule {
  title: string;
  topics: string[];
  duration: string;
}

export interface SyllabusData {
  title: string;
  totalDays: number;
  modules: SyllabusModule[];
}

export interface TaskBlueprint {
  id?: string;
  day: number;
  title: string;
  description?: string;
  estimatedMinutes: number;
  subtasks?: string[];
  
  // ✅ NEW FIELDS FOR "SENIOR" PLAN
  resources?: string[];
  outcome?: string;
}

export interface PlanBlueprintData {
  title: string;
  description: string;
  tasks: TaskBlueprint[];
}
