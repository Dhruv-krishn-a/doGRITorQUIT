"use server";

import { prisma } from "@/lib/prisma"; 
import { getServerUser } from "@/lib/auth"; 
import { z } from "zod";
import { revalidatePath } from "next/cache"; 

const habitSchema = z.object({
  title: z.string().min(1),
  icon: z.string().default("circle"),
  color: z.string().default("text-blue-500"),
});

export async function getChecklistData(start: Date, end: Date) {
  const user = await getServerUser();
  if (!user) return { habits: [], logs: [], notes: [] };

  try {
    const [habits, logs, notes] = await Promise.all([
      prisma.habit.findMany({ 
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' } 
      }),
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
  } catch (error) {
    console.error("Checklist Error:", error);
    return { habits: [], logs: [], notes: [] };
  }
}

export async function toggleHabit(habitId: string, date: Date, completed: boolean) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  if (completed) {
    await prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date: normalizedDate } },
      create: {
        userId: user.id,
        habitId,
        date: normalizedDate,
        completed: true,
      },
      update: { completed: true },
    });
  } else {
    await prisma.habitLog.deleteMany({
      where: {
        userId: user.id,
        habitId,
        date: normalizedDate,
      },
    });
  }
  
  // ✅ FIX: Actually use revalidatePath to update the UI
  revalidatePath("/dashboard/daily-checklist");
  return true;
}

export async function saveDailyNote(date: Date, content: string) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  if (!content.trim()) {
    await prisma.dailyNote.deleteMany({
      where: { userId: user.id, date: normalizedDate }
    });
  } else {
    await prisma.dailyNote.upsert({
      where: {
        userId_date: { userId: user.id, date: normalizedDate },
      },
      update: { content },
      create: {
        userId: user.id,
        date: normalizedDate,
        content,
      },
    });
  }
  
  // ✅ FIX: Refresh UI to show saved state
  revalidatePath("/dashboard/daily-checklist");
  return true;
}

export async function createHabit(data: { title: string; icon: string; color: string }) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");

  const validated = habitSchema.parse(data);

  const newHabit = await prisma.habit.create({
    data: {
      ...validated,
      userId: user.id,
    },
  });

  // ✅ FIX: Refresh UI to show the new habit immediately
  revalidatePath("/dashboard/daily-checklist");
  return newHabit;
}