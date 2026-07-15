import { prisma } from "@gritorquit/db";

/**
 * MANUAL TRANSMISSION ENGINE
 * Handles creating/updating tasks AND updating the Plan/User stats.
 */

// 1. Create a Task (Updates Plan Counters + User Stats)
export async function createTask(
  userId: string,
  planId: string,
  data: {
    title: string;
    description?: string;
    date?: Date;
    priority?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    // A. Create the Task
    const task = await tx.task.create({
      data: {
        userId,
        planId,
        title: data.title,
        description: data.description,
        date: data.date,
        // ✅ FIX: Cast string to 'any' to satisfy Prisma Enum type
        priority: data.priority as any,
        status: "pending",
      },
    });

    // B. Increment Plan Counter
    // (Check if plan exists first to be safe, though planId usually guarantees it)
    await tx.plan.update({
      where: { id: planId },
      data: { totalTasks: { increment: 1 } },
    });

    // C. Update User Stats (for Dashboard)
    await tx.userStats.upsert({
      where: { userId },
      create: { userId, totalTasks: 1 },
      update: { totalTasks: { increment: 1 } },
    });

    return task;
  });
}

// 2. Complete a Task (Updates Progress % + Streak)
export async function completeTask(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    // A. Mark as Completed
    const task = await tx.task.update({
      where: { id: taskId },
      data: {
        completed: true,
        status: "completed",
      },
    });

    if (!task.planId) return task; 

    // B. Recalculate Plan Progress
    const plan = await tx.plan.findUnique({ where: { id: task.planId } });
    if (plan) {
      const newCompleted = plan.completedTasks + 1;
      // Prevent division by zero
      const newProgress =
        plan.totalTasks > 0
          ? Math.round((newCompleted / plan.totalTasks) * 100)
          : 0;

      await tx.plan.update({
        where: { id: plan.id },
        data: {
          completedTasks: newCompleted,
          progress: newProgress,
        },
      });
    }

    const stats = await tx.userStats.findUnique({ where: { userId } });
    if (stats) {
        await tx.userStats.update({
            where: { userId },
            data: {
                completedTasks: { increment: 1 },
                lastActiveAt: new Date(),
            },
        });
    } else {
        await tx.userStats.create({
            data: {
                userId,
                completedTasks: 1,
                lastActiveAt: new Date()
            }
        });
    }

    return task;
  });
}

export async function deleteTask(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");

    await tx.task.delete({ where: { id: taskId } });

    if (task.planId) {
      await tx.plan.update({
        where: { id: task.planId },
        data: {
          totalTasks: { decrement: 1 },
          completedTasks: task.completed ? { decrement: 1 } : undefined,
        },
      });
    }

    await tx.userStats.update({
      where: { userId },
      data: {
        totalTasks: { decrement: 1 },
        completedTasks: task.completed ? { decrement: 1 } : undefined,
      },
    });

    await tx.mobileSyncDeletion.upsert({
      where: { userId_tableName_recordId: { userId, tableName: "tasks", recordId: taskId } },
      create: { userId, tableName: "tasks", recordId: taskId },
      update: { deletedAt: new Date() }
    });
  });
}