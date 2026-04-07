import { prisma } from "@gritorquit/db";
import { TaskStatus } from "@prisma/client"; // ✅ Import Enum is mandatory

export async function getAnalyticsData(userId: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6); // Last 7 days
  startDate.setHours(0, 0, 0, 0);

  const [tasks, habits, taskCounts] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        // ✅ FIX 1: Use Enum 'archived' instead of string "Discarded"
        status: { not: TaskStatus.archived } 
      },
      select: {
        date: true,
        status: true,
        timeSpentMinutes: true,
        estimatedMinutes: true
      }
    }),

    prisma.habit.findMany({
      where: { userId, active: true },
      include: {
        logs: {
          where: { date: { gte: startDate, lte: endDate } },
          select: { date: true } // Only need date to count
        }
      }
    }),

    prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true }
    })
  ]);


  const tasksByDate = new Map<string, typeof tasks>();
  
  tasks.forEach(t => {
    if (!t.date) return;
    const key = t.date.toISOString().split('T')[0] ?? "";
    
    if (!key) return; // Safety check

    const existing = tasksByDate.get(key) || [];
    existing.push(t);
    tasksByDate.set(key, existing);
  });

  const dailyStats = [];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0] ?? "";
    const dayName = d.toLocaleDateString("en-US", { weekday: 'short' });

    const dayTasks = tasksByDate.get(dateStr) || [];

    const focusMinutes = dayTasks.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);
    
    // ✅ FIX 2: Check against Enum (lowercase 'completed')
    const completed = dayTasks.filter(t => t.status === TaskStatus.completed).length;
    const total = dayTasks.length;

    dailyStats.push({
      date: dateStr,
      day: dayName,
      focusMinutes,
      completed,
      total
    });
  }

  // Habit Stats
  const habitStats = habits.map(h => ({
    name: h.title,
    total: 7,
    completed: h.logs.length,
    rate: Math.round((h.logs.length / 7) * 100)
  }));

  return {
    dailyStats,
    // Note: t.status here returns the lowercase enum string (e.g. "pending", "completed")
    taskDistribution: taskCounts.map(t => ({ name: t.status, value: t._count.id })),
    habitStats
  };
}