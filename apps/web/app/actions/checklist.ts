// apps/web/app/actions/checklist.ts
"use server";

import { prisma } from "@/lib/prisma"; // Assuming global prisma instance
import { z } from "zod";
import { getServerUser } from "@/lib/auth"; // Your auth helper

// Validation Schemas
const habitSchema = z.object({
  title: z.string().min(1),
  icon: z.string(),
  color: z.string(),
});

export async function getChecklistData(start: Date, end: Date) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  const [habits, logs, notes] = await Promise.all([
    prisma.habit.findMany({ where: { userId: user.id } }),
    prisma.habitLog.findMany({
      where: {
        userId: user.id,
        date: { gte: start, lte: end },
      },
    }),
    prisma.dailyNote.findMany({
      where: {
        userId: user.id,
        date: { gte: start, lte: end },
      },
    }),
  ]);

  return { habits, logs, notes };
}

export async function toggleHabit(habitId: string, date: Date, completed: boolean) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  const dateStr = date.toISOString();

  if (completed) {
    await prisma.habitLog.create({
      data: {
        userId: user.id,
        habitId,
        date: date,
        completed: true,
      },
    });
  } else {
    // Delete the log for that specific date
    await prisma.habitLog.deleteMany({
      where: {
        userId: user.id,
        habitId,
        date: date,
      },
    });
  }
  return true;
}

export async function saveDailyNote(date: Date, content: string) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.dailyNote.upsert({
    where: {
      userId_date: { userId: user.id, date }, // Requires composite unique index in Prisma
    },
    update: { content },
    create: {
      userId: user.id,
      date,
      content,
    },
  });
  return true;
}

export async function createHabit(data: { title: string; icon: string; color: string }) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  const validated = habitSchema.parse(data);

  return await prisma.habit.create({
    data: {
      ...validated,
      userId: user.id,
    },
  });
}