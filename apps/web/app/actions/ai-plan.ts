//apps/web/app/actions/ai-plan.ts
"use server";

import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { Priority, TaskStatus } from "@prisma/client";

// --- 1. Updated Types to match AI Output ---

export type DraftTask = {
  id: string; // temp id
  day: number;
  title: string;
  description?: string;
  estimatedMinutes: number;
  priority: "High" | "Medium" | "Low";
  // ✅ FIX: Support both simple strings and object subtasks
  subtasks: (string | { title: string })[];
  // ✅ FIX: Add metadata for Resources & Outcomes
  metadata?: {
    outcome?: string;
    resources?: Array<string | { title: string; url: string }>;
  };
};

export type DraftPlan = {
  title: string;
  description: string;
  tasks: DraftTask[];
};

/**
 * MOCK AI GENERATOR
 * In production, replace this with Vercel AI SDK (streamText)
 */
export async function generateDraftPlan(prompt: string, isPreview: boolean): Promise<DraftPlan> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const days = isPreview ? 2 : 5; 

  const tasks: DraftTask[] = [];
  
  for (let d = 1; d <= days; d++) {
    tasks.push({
      id: `temp-${d}-1`,
      day: d,
      title: d === 1 ? "Setup & Fundamentals" : `Implementation Day ${d}`,
      description: `Generated based on: ${prompt}`,
      estimatedMinutes: 60,
      priority: d === 1 ? "High" : "Medium",
      subtasks: ["Install prerequisites", "Read documentation", "Complete exercise"],
      metadata: {
        outcome: "Environment set up and verified.",
        resources: [
            { title: "Official Docs", url: "https://example.com" }
        ]
      }
    });
  }

  return {
    title: prompt.split(" ").slice(0, 4).join(" ") + " Roadmap",
    description: "AI Generated Roadmap personalized for you.",
    tasks
  };
}

/**
 * SAVE TO DATABASE
 */
export async function saveAIPlan(draft: DraftPlan, startDateStr: string) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Parse Start Date
  const planStartDate = new Date(startDateStr);

  // 2. Create Plan Transaction
  const plan = await prisma.plan.create({
    data: {
      userId: user.id,
      title: draft.title,
      description: draft.description,
      startDate: planStartDate,
      tasks: {
        create: draft.tasks.map((t) => {
          // Date Logic: Plan Start Date + (Day Index - 1)
          const taskDate = new Date(planStartDate);
          taskDate.setDate(planStartDate.getDate() + (t.day - 1));

          return {
            userId: user.id,
            title: t.title,
            description: t.description,
            estimatedMinutes: t.estimatedMinutes,
            priority: t.priority === "High" ? Priority.high : Priority.medium,
            status: TaskStatus.pending,
            date: taskDate,
            
            // ✅ FIX: Save Subtasks (handle string vs object)
            subtasks: {
              create: t.subtasks.map(st => ({ 
                title: typeof st === 'string' ? st : st.title, 
                completed: false 
              }))
            },

            // ✅ FIX: Save Rich Metadata
            metadata: t.metadata ? {
                outcome: t.metadata.outcome,
                resources: t.metadata.resources,
                generatedBy: "AI_Architect_V2"
            } : undefined
          };
        })
      }
    }
  });

  return plan;
}