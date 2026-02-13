//packages/domain/plans/service.ts
import { prisma } from "@planner/db";
import { TaskStatus, Priority } from "@prisma/client";
import { formatPlanForClient } from "./format";
import { assertPlanCreationAllowed } from "../billing/entitlements";

// Export types
export { TaskStatus, Priority };

// --- Helpers ---

// Safe Priority Mapper (Handles "Medium" -> "medium" mismatch)
function parsePriority(val: string | null | undefined): Priority | null {
  if (!val) return null;
  const normalized = val.toLowerCase().trim();
  
  if (normalized === "high") return Priority.high;
  if (normalized === "medium") return Priority.medium;
  if (normalized === "low") return Priority.low;
  if (normalized === "urgent") return Priority.urgent;
  
  return null; 
}

/**
 * List plans for a user
 */
export async function listPlansForUser(userId: string) {
  const plans = await prisma.plan.findMany({
    where: { userId },
    include: {
      tasks: {
        orderBy: { date: "asc" },
        include: {
          subtasks: true,
          tags: { include: { tag: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (plans || []).map(formatPlanForClient);
}

/**
 * Get one plan
 */
export async function getPlanForUser(userId: string, planId: string) {
  const plan = await prisma.plan.findFirst({
    where: { id: planId, userId },
    include: {
      tasks: {
        orderBy: { date: "asc" },
        include: { 
          subtasks: { orderBy: { createdAt: 'asc' } }, 
          tags: { include: { tag: true } } 
        },
      },
    },
  });
  if (!plan) return null;
  return formatPlanForClient(plan);
}

/**
 * Create plan
 */
export async function createPlanForUser(userId: string, data: {
  title: string; description?: string | null; startDate?: string | null; endDate?: string | null;
}) {
  await assertPlanCreationAllowed(userId);

  const plan = await prisma.plan.create({
    data: {
      userId,
      title: data.title,
      description: data.description ?? null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });

  return formatPlanForClient(plan);
}

/**
 * Delete plan
 */
export async function deletePlanForUser(userId: string, planId: string) {
  const plan = await prisma.plan.findFirst({ where: { id: planId, userId } });
  if (!plan) return false;

  await prisma.plan.delete({ where: { id: planId } });
  return true;
}

/**
 * Day Operations (Shifting)
 */
export async function insertPlanDay(userId: string, planId: string, targetDateStr: string) {
  return prisma.$transaction(async (tx) => {
    const plan = await tx.plan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new Error("Plan not found");

    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);

    // SQL Injection safe because targetDate is a Date object parameter
    await tx.$executeRaw`
      UPDATE "tasks"
      SET "date" = "date" + INTERVAL '1 day'
      WHERE "planId" = ${planId}
      AND "date" >= ${targetDate}
    `;

    if (plan.endDate) {
      await tx.plan.update({
        where: { id: planId },
        data: { endDate: new Date(plan.endDate.getTime() + 86400000) }
      });
    }
  });
}

export async function deletePlanDay(userId: string, planId: string, targetDateStr: string) {
  return prisma.$transaction(async (tx) => {
    const plan = await tx.plan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new Error("Plan not found");

    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);

    await tx.task.deleteMany({
      where: { planId, date: targetDate }
    });

    await tx.$executeRaw`
      UPDATE "tasks"
      SET "date" = "date" - INTERVAL '1 day'
      WHERE "planId" = ${planId}
      AND "date" > ${targetDate}
    `;

    if (plan.endDate) {
      await tx.plan.update({
        where: { id: planId },
        data: { endDate: new Date(plan.endDate.getTime() - 86400000) }
      });
    }
  });
}

/**
 * Task CRUD
 */
export async function createTask(userId: string, planId: string, data: {
  title: string;
  description?: string; 
  date: string; 
  priority?: string;    
  estimatedMinutes?: number;
  subtasks?: string[]; // Keeps string[] for easy creation
}) {
  const plan = await prisma.plan.findFirst({ where: { id: planId, userId } });
  if (!plan) throw new Error("Plan not found");

  const dateObj = new Date(data.date);
  dateObj.setHours(0, 0, 0, 0);

  const safePriority = parsePriority(data.priority);

  return prisma.task.create({
    data: {
      userId,
      planId,
      title: data.title,
      description: data.description || null,
      date: dateObj,
      priority: safePriority,
      estimatedMinutes: data.estimatedMinutes ?? 0,
      status: TaskStatus.pending,
      subtasks: {
        create: data.subtasks?.map(title => ({
            title,
            completed: false
        })) || []
      }
    },
    include: {
        subtasks: true
    }
  });
}

/**
 * UPDATE TASK (Fixed to sync subtasks)
 */
export async function updateTaskFully(userId: string, taskId: string, data: {
  title?: string;
  description?: string;
  priority?: string;
  estimatedMinutes?: number;
  status?: string;
  subtasks?: { title: string; completed: boolean }[]; // ✅ Accept Full Objects
}) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found");

  const safePriority = data.priority ? parsePriority(data.priority) : undefined;
  
  let safeStatus: TaskStatus | undefined;
  if (data.status) {
     const s = data.status.toLowerCase();
     if (s === 'completed') safeStatus = TaskStatus.completed;
     else if (s === 'in_progress') safeStatus = TaskStatus.in_progress;
     else if (s === 'pending') safeStatus = TaskStatus.pending;
  }

  // ✅ Transaction: Update details AND sync subtasks
  return prisma.$transaction(async (tx) => {
    // 1. Update Main Fields
    const updated = await tx.task.update({
        where: { id: taskId },
        data: {
            title: data.title,
            description: data.description,
            priority: safePriority,
            estimatedMinutes: data.estimatedMinutes,
            status: safeStatus,
        }
    });

    // 2. Sync Subtasks (if array provided)
    if (data.subtasks) {
        // Clear old ones
        await tx.subtask.deleteMany({ where: { taskId } });
        
        // Create new ones (preserving completed status)
        if (data.subtasks.length > 0) {
            await tx.subtask.createMany({
                data: data.subtasks.map(s => ({
                    taskId,
                    title: s.title,
                    completed: s.completed
                }))
            });
        }
    }

    return updated;
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found");
  return prisma.task.delete({ where: { id: taskId } });
}

// Legacy alias
export async function updateTask(userId: string, taskId: string, data: any) {
  return updateTaskFully(userId, taskId, data);
}

/**
 * Subtask CRUD
 */
export async function createSubtask(userId: string, taskId: string, title: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found");

  return prisma.subtask.create({
    data: { taskId, title, completed: false }
  });
}

export async function updateSubtask(userId: string, subtaskId: string, data: { title?: string; completed?: boolean }) {
  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, task: { userId } }
  });
  if (!subtask) throw new Error("Subtask not found");

  return prisma.subtask.update({ where: { id: subtaskId }, data });
}

export async function deleteSubtask(userId: string, subtaskId: string) {
  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, task: { userId } }
  });
  if (!subtask) throw new Error("Subtask not found");

  return prisma.subtask.delete({ where: { id: subtaskId } });
}

export async function toggleSubtask(userId: string, subtaskId: string, completed: boolean) {
  return updateSubtask(userId, subtaskId, { completed });
}

/**
 * Utilities
 */
export async function addTimeSpent(userId: string, taskId: string, minutesToAdd: number) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found");

  return prisma.task.update({
    where: { id: taskId },
    data: { timeSpentMinutes: (task.timeSpentMinutes || 0) + minutesToAdd }
  });
}

export async function getAllTasksForUser(userId: string) {
  return prisma.task.findMany({
    where: { userId },
    include: {
      plan: { select: { title: true } },
      subtasks: { orderBy: { createdAt: 'asc' } },
      tags: { include: { tag: true } }
    },
    orderBy: [ { date: 'asc' }, { priority: 'desc' } ]
  });
}

/**
 * Import Logic
 */
function normalizeRow(row: any) {
  const newRow: any = {};
  Object.keys(row).forEach((key) => {
    newRow[key.toLowerCase().trim()] = row[key];
  });
  return newRow;
}

export async function importPlanJson(userId: string, planName: string, tasksRows: any[], startDate?: string | Date) {
  return await prisma.$transaction(async (tx) => {
    let startObj = new Date();
    if (startDate) startObj = new Date(startDate);
    startObj.setHours(0, 0, 0, 0);

    const plan = await tx.plan.create({
      data: { userId, title: planName, startDate: startObj },
    });

    for (const rawRow of tasksRows) {
      const row = normalizeRow(rawRow);
      const title = row["task title"] || row["title"] || row["task"] || "Untitled Task";
      const description = row["notes"] || row["description"] || null;
      
      let date: Date | null = null;
      if (row["date"]) {
        date = new Date(row["date"]);
      } else if (row["day"] || row["day #"]) {
        const dayVal = parseInt(String(row["day"] || row["day #"]).replace(/\D/g, ''));
        if (!isNaN(dayVal) && dayVal > 0) {
          const t = new Date(startObj);
          t.setDate(t.getDate() + (dayVal - 1));
          date = t;
        }
      }

      const priority = parsePriority(row["priority"]);
      
      const expectedHours = row["expected hours"] || row["estimated time (min)"];
      let estMinutes = 0;
      if (expectedHours) {
        const val = Number(expectedHours);
        estMinutes = val < 10 ? Math.round(val * 60) : Math.round(val);
      }

      const task = await tx.task.create({
        data: {
          planId: plan.id,
          userId,
          title,
          description,
          date,
          priority,
          estimatedMinutes: estMinutes || null,
          status: TaskStatus.pending,
        },
      });

      const subtasksRaw = row["subtasks"]; 
      if (subtasksRaw) {
        const subtasks = Array.isArray(subtasksRaw) ? subtasksRaw.map(String) : String(subtasksRaw).split(/[;]/).map(s => s.trim()).filter(Boolean);
        for (const st of subtasks) {
          await tx.subtask.create({ data: { taskId: task.id, title: st } });
        }
      }

      const tagsRaw = row["tags"];
      if (tagsRaw) {
         const tags = Array.isArray(tagsRaw) ? tagsRaw.map(String) : String(tagsRaw).split(/[;]/).map(s => s.trim()).filter(Boolean);
        for (const tname of tags) {
          const t = await tx.tag.upsert({ where: { name: tname }, update: {}, create: { name: tname } });
          await tx.taskTag.create({ data: { taskId: task.id, tagId: t.id } });
        }
      }
    }
    return plan;
  }, { maxWait: 5000, timeout: 60000 });
}