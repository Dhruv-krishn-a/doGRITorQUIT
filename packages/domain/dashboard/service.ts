// packages/domain/dashboard/service.ts
import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Fetch Today's Tasks
  const todaysTasks = await prisma.task.findMany({
    where: {
      userId,
      date: { gte: today, lt: tomorrow },
      status: { not: "Discarded" }
    },
    orderBy: { priority: 'desc' },
    take: 5
  });

  // 2. Fetch Active Habits & Today's Logs
  const habits = await prisma.habit.findMany({
    where: { userId, active: true },
    include: {
      logs: { where: { date: today } }
    },
    orderBy: { order: 'asc' }
  });

  // 3. Calculate Focus Time (Sum of timeSpentMinutes on tasks updated today)
  // Note: This is a rough approximation based on updated tasks. 
  // For precise analytics, we'd need a separate TimeLog table, 
  // but for now, summing task.timeSpentMinutes is acceptable for the MVP.
  const allTasks = await prisma.task.findMany({
    where: { userId },
    select: { timeSpentMinutes: true, status: true }
  });
  
  const totalFocusMinutes = allTasks.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);
  const completedTasksCount = allTasks.filter(t => t.status === "Completed").length;

  // 4. Get Active Plan info
  const activePlan = await prisma.plan.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { 
      _count: { select: { tasks: true } },
      tasks: { where: { status: "Completed" } }
    }
  });

  return {
    greeting: getGreeting(),
    date: today,
    stats: {
      focusMinutes: totalFocusMinutes,
      completedTasks: completedTasksCount,
      habitStreak: 0, // Placeholder for now
    },
    todaysTasks,
    habits: habits.map(h => ({
      ...h,
      completedToday: h.logs.length > 0
    })),
    activePlan: activePlan ? {
      id: activePlan.id,
      title: activePlan.title,
      progress: Math.round((activePlan.tasks.length / (activePlan._count.tasks || 1)) * 100)
    } : null
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}