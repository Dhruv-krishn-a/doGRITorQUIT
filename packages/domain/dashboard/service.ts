// packages/domain/dashboard/service.ts
import { prisma } from "@gritorquit/db";

export async function getDashboardStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Parallelize Queries
  const [todaysTasks, habits, userStats, activePlan, heatmapData, upcomingEventsData] = await Promise.all([
    // A. Today's Tasks
    prisma.task.findMany({
      where: {
        userId,
        date: { gte: today, lt: tomorrow },
        status: { not: "archived" }
      },
      orderBy: { priority: 'desc' },
      take: 5
    }),

    // B. Habits with Logs
    prisma.habit.findMany({
      where: { userId, active: true },
      include: {
        logs: { where: { date: today } }
      },
      orderBy: { order: 'asc' }
    }),

    // C. ✅ OPTIMIZED: Read from UserStats table (Instant)
    prisma.userStats.findUnique({
      where: { userId }
    }),

    // D. Active Plan (Read pre-calculated progress)
    prisma.plan.findFirst({
      where: { userId, isArchived: false },
      orderBy: { updatedAt: 'desc' },
      // No need to include tasks or count relations anymore
    }),

    // E. Activity Heatmap (Last 14 days)
    prisma.task.findMany({
      where: {
        userId,
        status: "completed",
        updatedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
      },
      select: { updatedAt: true }
    }),

    // F. Upcoming Events
    prisma.task.findMany({
      where: {
        userId,
        status: "pending",
        date: { gte: tomorrow }
      },
      orderBy: { date: 'asc' },
      take: 3
    })
  ]);

  // Aggregate heatmap data
  const heatmapMap = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    heatmapMap.set(d.toISOString().split('T')[0], 0);
  }
  
  heatmapData.forEach(task => {
    const dateStr = task.updatedAt.toISOString().split('T')[0];
    if (heatmapMap.has(dateStr)) {
      heatmapMap.set(dateStr, heatmapMap.get(dateStr)! + 1);
    }
  });

  const activityHeatmap = Array.from(heatmapMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    greeting: getGreeting(),
    date: today,
    stats: {
      focusMinutes: 0, // Fallback if you aren't tracking this in UserStats yet
      // Use the pre-calculated stats
      completedTasks: userStats?.completedTasks ?? 0,
      totalTasks: userStats?.totalTasks ?? 0,
      habitStreak: userStats?.currentStreak ?? 0, 
    },
    todaysTasks,
    habits: habits.map(h => ({
      ...h,
      completedToday: h.logs.length > 0
    })),
    activePlan: activePlan ? {
      id: activePlan.id,
      title: activePlan.title,
      // ✅ READ DIRECTLY
      progress: activePlan.progress,
      total: activePlan.totalTasks,
      completed: activePlan.completedTasks
    } : null,
    activityHeatmap,
    upcomingEvents: upcomingEventsData.map(e => ({
      title: e.title,
      date: e.date?.toISOString() || '',
      time: e.metadata && typeof e.metadata === 'object' && 'startTime' in e.metadata ? (e.metadata as any).startTime : undefined
    }))
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}