// packages/domain/plans/service.ts
import { prisma } from "@/lib/prisma"; // keep this alias working via tsconfig
import { formatPlanForClient } from "./format";
import { assertPlanCreationAllowed } from "../billing/entitlements";

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

  return plans.map(formatPlanForClient);
}

/**
 * Get one plan (with tasks)
 */
export async function getPlanForUser(userId: string, planId: string) {
  const plan = await prisma.plan.findFirst({
    where: { id: planId, userId },
    include: {
      tasks: {
        orderBy: { date: "asc" },
        include: { subtasks: true, tags: { include: { tag: true } } },
      },
    },
  });
  if (!plan) return null;
  return formatPlanForClient(plan);
}

/**
 * Create plan (enforces entitlements)
 */
export async function createPlanForUser(userId: string, data: {
  title: string; description?: string | null; startDate?: string | null; endDate?: string | null;
}) {
  // Enforce entitlements
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
 * Delete plan (ensures ownership)
 */
export async function deletePlanForUser(userId: string, planId: string) {
  const plan = await prisma.plan.findFirst({ where: { id: planId, userId } });
  if (!plan) return false;

  await prisma.plan.delete({ where: { id: planId } });
  return true;
}


/**
 * Helper to normalize object keys to lowercase for fuzzy matching
 */
function normalizeRow(row: any) {
  const newRow: any = {};
  Object.keys(row).forEach((key) => {
    newRow[key.toLowerCase().trim()] = row[key];
  });
  return newRow;
}

/**
 * Import JSON tasks into a new plan (transactional)
 */
// ✅ UPDATED SIGNATURE: Added startDate parameter
export async function importPlanJson(
  userId: string, 
  planName: string, 
  tasksRows: any[], 
  startDate?: string | Date
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Determine Start Date
    let startObj = new Date();
    if (startDate) {
      startObj = new Date(startDate);
    }
    // Normalize to start of day to avoid timezone drift
    startObj.setHours(0, 0, 0, 0);

    const plan = await tx.plan.create({
      data: { 
        userId, 
        title: planName,
        startDate: startObj 
      },
    });

    for (const rawRow of tasksRows) {
      const row = normalizeRow(rawRow);

      // 2. Fuzzy Match Title
      const title = 
        row["task title"] || 
        row["title"] || 
        row["task"] ||     
        row["topic"] ||    
        row["activity"] || 
        "Untitled Task";

      // 3. Fuzzy Match Description
      const description = 
        row["notes"] || 
        row["description"] || 
        row["details"] || 
        row["summary"] ||
        null;
      
      // 4. Fuzzy Match Date/Day
      let date: Date | null = null;
      
      const dateStr = row["date"];
      if (dateStr) {
        date = new Date(dateStr);
      } else {
        const dayVal = row["day"] || row["day #"] || row["day_number"];
        if (dayVal) {
          let dayOffset = parseInt(String(dayVal).replace(/\D/g, ''));
          if (!isNaN(dayOffset) && dayOffset > 0) {
            // ✅ USE startObj for relative date calculation
            const targetDate = new Date(startObj);
            targetDate.setDate(targetDate.getDate() + (dayOffset - 1));
            date = targetDate;
          }
        }
      }

      // 5. Fuzzy Match Attributes
      const priority = row["priority"] || null;
      
      const expectedHours = row["expected hours"] || row["estimated time (min)"] || row["duration"];
      let estimatedMinutes = 0;
      if (expectedHours) {
        const val = Number(expectedHours);
        estimatedMinutes = val < 10 ? Math.round(val * 60) : Math.round(val);
      }

      // Create the Main Task
      const task = await tx.task.create({
        data: {
          planId: plan.id,
          userId,
          title,
          description,
          date,
          priority,
          estimatedMinutes: estimatedMinutes || null,
          status: "Pending",
        },
      });

      // 6. Fuzzy Match Subtasks
      const subtasksRaw = 
        row["subtasks"] || 
        row["steps"] || 
        row["checklist"] || 
        row["tasks"]; 

      if (subtasksRaw) {
        let subtasks: string[] = [];
        if (Array.isArray(subtasksRaw)) {
          subtasks = subtasksRaw.map(String);
        } else {
          subtasks = String(subtasksRaw).split(/[;,]/).map((s) => s.trim()).filter(Boolean);
        }

        for (const st of subtasks) {
          await tx.subtask.create({ data: { taskId: task.id, title: st } });
        }
      }

      // 7. Fuzzy Match Tags
      const tagsRaw = row["tags"] || row["categories"] || row["labels"];
      if (tagsRaw) {
         let tags: string[] = [];
         if (Array.isArray(tagsRaw)) {
            tags = tagsRaw.map(String);
         } else {
            tags = String(tagsRaw).split(/[;,]/).map((s) => s.trim()).filter(Boolean);
         }

        for (const tname of tags) {
          const t = await tx.tag.upsert({ where: { name: tname }, update: {}, create: { name: tname } });
          await tx.taskTag.create({ data: { taskId: task.id, tagId: t.id } });
        }
      }
    }

    return plan;
  }, {
    maxWait: 5000,
    timeout: 60000 
  });
}

export async function updateTask(userId: string, taskId: string, data: { title?: string; description?: string; status?: string }) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found");

  return prisma.task.update({
    where: { id: taskId },
    data
  });
}

/**
 * Log Time Spent on a Task
 */
export async function addTimeSpent(userId: string, taskId: string, minutesToAdd: number) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error("Task not found");

  return prisma.task.update({
    where: { id: taskId },
    data: { 
      timeSpentMinutes: (task.timeSpentMinutes || 0) + minutesToAdd 
    }
  });
}

/**
 * Get ALL Tasks (Categorized logic will handle sorting in UI)
 */
export async function getAllTasksForUser(userId: string) {
  return prisma.task.findMany({
    where: { userId },
    include: {
      plan: { select: { title: true } },
      subtasks: { orderBy: { createdAt: 'asc' } },
      tags: { include: { tag: true } }
    },
    orderBy: [
      { date: 'asc' }, // Oldest first (for overdue)
      { priority: 'desc' } // High priority first
    ]
  });
}