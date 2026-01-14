// packages/domain/dashboard/service.ts
import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Parallelize Queries using Promise.all
  // We run independent queries at the same time, not one after another.
  const [todaysTasks, habits, focusAgg, activePlan] = await Promise.all([
    // A. Today's Tasks
    prisma.task.findMany({
      where: {
        userId,
        date: { gte: today, lt: tomorrow },
        status: { not: "Discarded" }
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

    // C. ✅ OPTIMIZED: Database Aggregation
    // Instead of fetching ALL tasks, we ask DB for the Sum and Count directly.
    prisma.task.aggregate({
      where: { userId },
      _sum: { timeSpentMinutes: true },
      _count: { id: true },
    }),

    // D. Active Plan
    prisma.plan.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { 
        _count: { select: { tasks: true } },
        tasks: { where: { status: "Completed" }, select: { id: true } } // Select only ID to be light
      }
    })
  ]);

  // Calculate stats from aggregation results
  const totalFocusMinutes = focusAgg._sum.timeSpentMinutes || 0;
  
  // Note: Your previous code counted "Completed" status manually. 
  // If you need total completed tasks ever:
  const completedTasksCount = await prisma.task.count({
    where: { userId, status: "Completed" }
  });

  return {
    greeting: getGreeting(),
    date: today,
    stats: {
      focusMinutes: totalFocusMinutes,
      completedTasks: completedTasksCount,
      habitStreak: 0, 
    },
    todaysTasks,
    habits: habits.map(h => ({
      ...h,
      completedToday: h.logs.length > 0
    })),
    activePlan: activePlan ? {
      id: activePlan.id,
      title: activePlan.title,
      progress: activePlan._count.tasks > 0 
        ? Math.round((activePlan.tasks.length / activePlan._count.tasks) * 100) 
        : 0
    } : null
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}