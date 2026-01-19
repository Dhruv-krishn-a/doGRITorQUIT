// packages/domain/dashboard/service.ts
import { prisma } from "@planner/db";

export async function getDashboardStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Parallelize Queries
  const [todaysTasks, habits, userStats, activePlan] = await Promise.all([
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
    })
  ]);

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
    } : null
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}