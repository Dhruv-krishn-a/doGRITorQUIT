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
 * Import JSON tasks into a new plan (transactional)
 */
export async function importPlanJson(userId: string, planName: string, tasksRows: any[]) {
  return await prisma.$transaction(async (tx) => {
    const plan = await tx.plan.create({
      data: { userId, title: planName },
    });

    for (const row of tasksRows) {
      const title = row["Task Title"] || row.title || "Untitled";
      const description = row["Notes"] || row["Description"] || null;
      const dateStr = row["Date"] || row.date || null;
      const date = dateStr ? new Date(dateStr) : null;
      const priority = row["Priority"] || null;

      const expectedHours = row["Expected Hours"] || row["Estimated Time (min)"];
      let estimatedMinutes = 0;
      if (expectedHours) {
        const val = Number(expectedHours);
        estimatedMinutes = val < 10 ? Math.round(val * 60) : Math.round(val);
      }

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

      // subtasks
      const subtasksRaw = row["Subtasks"] || row.subtasks || "";
      if (subtasksRaw) {
        const subtasks = String(subtasksRaw).split(/[;,]/).map((s) => s.trim()).filter(Boolean);
        for (const st of subtasks) {
          await tx.subtask.create({ data: { taskId: task.id, title: st } });
        }
      }

      // tags
      const tagsRaw = row["Tags"] || row.tags || "";
      if (tagsRaw) {
        const tags = String(tagsRaw).split(/[;,]/).map((s) => s.trim()).filter(Boolean);
        for (const tname of tags) {
          const t = await tx.tag.upsert({ where: { name: tname }, update: {}, create: { name: tname } });
          await tx.taskTag.create({ data: { taskId: task.id, tagId: t.id } });
        }
      }
    }

    return plan;
  });
}
