//apps/web/app/actions/ai-plan.ts
"use server";

import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { Priority, TaskStatus } from "@prisma/client";

// Types for the Draft Plan
export type DraftTask = {
  id: string; // temp id
  day: number;
  title: string;
  description?: string;
  estimatedMinutes: number;
  priority: "High" | "Medium" | "Low";
  subtasks: string[];
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
  // Simulate network delay for "Streaming" feel
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const days = isPreview ? 2 : 7; // Trimmed vs Full

  const tasks: DraftTask[] = [];
  
  // Generate mock data based on prompt
  for (let d = 1; d <= days; d++) {
    tasks.push({
      id: `temp-${d}-1`,
      day: d,
      title: d === 1 ? "Setup & Fundamentals" : `Deep Dive Day ${d}`,
      description: `Generated based on: ${prompt}`,
      estimatedMinutes: 60,
      priority: d === 1 ? "High" : "Medium",
      subtasks: ["Install prerequisites", "Read documentation", "Complete exercise 1"]
    });
    
    if (d === 1) {
       tasks.push({
        id: `temp-${d}-2`,
        day: d,
        title: "Initial Practice Project",
        estimatedMinutes: 45,
        priority: "Medium",
        subtasks: []
       })
    }
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
export async function saveAIPlan(draft: DraftPlan, options: { addToMyDay: boolean; autoSchedule: boolean }) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Check Credits (Mock check)
  // const usage = await prisma.aiUsage.findUnique({ where: { userId: user.id }});
  // if (usage.count <= 0) throw new Error("Insufficient Credits");

  // 2. Calculate Dates
  const startDate = new Date();
  
  // 3. Create Plan Transaction
  const plan = await prisma.plan.create({
    data: {
      userId: user.id,
      title: draft.title,
      description: draft.description,
      startDate: startDate,
      tasks: {
        create: draft.tasks.map((t) => {
          // Date Logic:
          // If addToMyDay is TRUE and it's Day 1 -> Set date to TODAY
          // If autoSchedule is TRUE -> Set date to Today + (Day - 1)
          let taskDate: Date | null = null;
          
          if (t.day === 1 && options.addToMyDay) {
            taskDate = new Date(); // Today
          } else if (options.autoSchedule) {
            const d = new Date();
            d.setDate(d.getDate() + (t.day - 1));
            taskDate = d;
          }

          return {
            userId: user.id,
            title: t.title,
            description: t.description,
            estimatedMinutes: t.estimatedMinutes,
            priority: t.priority === "High" ? Priority.high : Priority.medium,
            status: TaskStatus.pending,
            date: taskDate,
            subtasks: {
              create: t.subtasks.map(st => ({ title: st, completed: false }))
            }
          };
        })
      }
    }
  });

  // 4. Deduct Credit (Mock)
  // await prisma.aiUsage.update(...)

  return plan;
}