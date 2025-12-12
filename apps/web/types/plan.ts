// apps/web/types/plan.ts
export interface Plan {
  id: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  progress?: number | null;
  createdAt?: string;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string | null;
    date?: string | null;
    dueDate?: string | null;
    completed?: boolean;
    priority?: string | null;
    estimatedMinutes?: number | null;
    timeSpentMinutes?: number | null;
    status?: string;
    // Arrays for nested relations
    subtasks?: Array<{ id: string; title: string; completed?: boolean }>;
    tags?: string[];
  }>;
}