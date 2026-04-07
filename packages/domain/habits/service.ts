// packages/domain/habits/service.ts
import { prisma } from "@gritorquit/db";
import { getFeatureLimit, checkFeatureAccess, PlanFeature } from "../billing/entitlements";

/**
 * Get Habits and Logs for a specific date range
 */
export async function getHabitData(userId: string, startDate: Date, endDate: Date) {
  // 1. Fetch Habits with Logs within the date range
  const habits = await prisma.habit.findMany({
    where: { userId, active: true },
    include: {
      logs: {
        where: {
          date: { gte: startDate, lte: endDate }
        }
      }
    },
    orderBy: { order: 'asc' }
  });

  // 2. Fetch Daily Notes within the date range
  const notes = await prisma.dailyNote.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate }
    }
  });

  return { habits, notes };
}

/**
 * Create a new Habit
 */
export async function createHabit(userId: string, data: { title: string; icon?: string; color?: string }) {
  // ✅ Enforce limit
  const limit = await getFeatureLimit(userId, PlanFeature.MAX_HABITS_TRACKED, 3, 100);
  const count = await prisma.habit.count({ where: { userId, active: true } });
  
  if (count >= limit) {
    throw new Error(`Habit limit reached (${limit}). Please upgrade your plan.`);
  }

  // Find the last order to append to the end
  const last = await prisma.habit.findFirst({
    where: { userId },
    orderBy: { order: 'desc' },
    select: { order: true }
  });
  const newOrder = (last?.order ?? -1) + 1;

  return prisma.habit.create({
    data: {
      userId,
      title: data.title,
      icon: data.icon,
      color: data.color,
      order: newOrder
    }
  });
}

/**
 * Delete a Habit
 */
export async function deleteHabit(userId: string, habitId: string) {
  const count = await prisma.habit.count({ where: { id: habitId, userId } });
  if (!count) throw new Error("Habit not found");

  return prisma.habit.delete({ where: { id: habitId } });
}

/**
 * Toggle Habit Completion (Log)
 */
export async function toggleHabitLog(userId: string, habitId: string, date: Date, completed: boolean) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new Error("Habit not found");

  // Normalize date to midnight to avoid time mismatches
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  if (completed) {
    // Create or Update log to true
    return prisma.habitLog.upsert({
      where: {
        habitId_date: { habitId, date: normalizedDate }
      },
      // <-- include userId here so Prisma's required field is satisfied
      create: { habitId, userId, date: normalizedDate, completed: true },
      update: { completed: true }
    });
  } else {
    // If unchecking, delete the log to keep data sparse and clean
    return prisma.habitLog.deleteMany({
      where: { habitId, date: normalizedDate }
    });
  }
}

/**
 * Save/Update Daily Note
 */
export async function upsertDailyNote(userId: string, date: Date, content: string) {
  // ✅ Check feature access
  await checkFeatureAccess(userId, PlanFeature.ACCESS_DAILY_JOURNAL);

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // If content is empty, delete the note
  if (!content.trim()) {
    return prisma.dailyNote.deleteMany({
      where: { userId, date: normalizedDate }
    });
  }

  return prisma.dailyNote.upsert({
    where: { userId_date: { userId, date: normalizedDate } },
    create: { userId, date: normalizedDate, content },
    update: { content }
  });
}
