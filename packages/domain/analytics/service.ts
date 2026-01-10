// packages/domain/analytics/service.ts
import { prisma } from "@/lib/prisma";

export async function getAnalyticsData(userId: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6); // Last 7 days
  startDate.setHours(0, 0, 0, 0);

  // 1. Fetch Tasks in Range
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      },
      status: { not: "Discarded" }
    },
    select: {
      date: true,
      status: true,
      timeSpentMinutes: true,
      estimatedMinutes: true
    }
  });

  // 2. Fetch Habits in Range
  const habits = await prisma.habit.findMany({
    where: { userId, active: true },
    include: {
      logs: {
        where: {
          date: { gte: startDate, lte: endDate }
        }
      }
    }
  });

  // --- Process Data for Charts ---

  // A. Daily Focus & Completion (Last 7 Days)
  const dailyStats = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayName = d.toLocaleDateString("en-US", { weekday: 'short' });

    // Filter tasks for this day (ignoring time component of task.date)
    const dayTasks = tasks.filter(t => 
      t.date && new Date(t.date).toISOString().split('T')[0] === dateStr
    );

    const focusMinutes = dayTasks.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);
    const completed = dayTasks.filter(t => t.status === "Completed").length;
    const total = dayTasks.length;

    dailyStats.push({
      date: dateStr,
      day: dayName,
      focusMinutes,
      completed,
      total
    });
  }

  // B. Overall Task Distribution (All Time)
  const taskCounts = await prisma.task.groupBy({
    by: ['status'],
    where: { userId },
    _count: { id: true }
  });

  // C. Habit Completion Rates
  const habitStats = habits.map(h => {
    return {
      name: h.title,
      total: 7, // Looking at last 7 days window
      completed: h.logs.length,
      rate: Math.round((h.logs.length / 7) * 100)
    };
  });

  return {
    dailyStats,
    taskDistribution: taskCounts.map(t => ({ name: t.status, value: t._count.id })),
    habitStats
  };
}