import { prisma } from "@gritorquit/db";
import { TaskStatus } from "@prisma/client"; // ✅ Import Enum is mandatory

export interface AnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
  category?: 'ALL' | 'YOUTUBE' | 'PLAN' | 'COURSE' | 'PROJECT';
}

export async function getAnalyticsData(userId: string, options: AnalyticsOptions = {}) {
  const endDate = options.endDate || new Date();
  const startDate = options.startDate || (() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // Default 7 days
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const category = options.category || 'ALL';

  // Base filters for tasks
  const taskWhere: any = {
    userId,
    date: { gte: startDate, lte: endDate },
    status: { not: TaskStatus.archived }
  };

  if (category === 'PLAN') {
    taskWhere.planId = { not: null };
  } else if (category === 'YOUTUBE') {
    taskWhere.metadata = { path: ['source'], equals: 'youtube' };
  }

  const [tasks, habits, taskCounts] = await Promise.all([
    prisma.task.findMany({
      where: taskWhere,
      select: {
        date: true,
        status: true,
        timeSpentMinutes: true,
        estimatedMinutes: true,
        metadata: true
      }
    }),

    prisma.habit.findMany({
      where: { userId, active: true },
      include: {
        logs: {
          where: { date: { gte: startDate, lte: endDate } },
          select: { date: true }
        }
      }
    }),

    prisma.task.groupBy({
      by: ['status'],
      where: { userId, ...(category !== 'ALL' ? taskWhere : {}) },
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
      completedTasks: completed,
      totalTasks: total
    });
  }

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const habitStats = habits.map(h => ({
    title: h.title,
    icon: h.icon || '🔥',
    streak: 0, // Streak calculation requires sorting logs, default to 0 for analytics view
    completedCount: h.logs.length,
    total: diffDays,
    rate: Math.round((h.logs.length / diffDays) * 100)
  }));

  return {
    dailyStats,
    // Note: t.status here returns the lowercase enum string (e.g. "pending", "completed")
    taskDistribution: taskCounts.map(t => ({ name: t.status, value: t._count.id })),
    habitStats
  };
}