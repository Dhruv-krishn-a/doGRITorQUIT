// packages/domain/dashboard/unified.ts
import { prisma } from "@gritorquit/db";
import { StudyService } from "../study/service";
import { TaskStatus, Priority, UnitStatus } from "@prisma/client";

export async function getUnifiedToday(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // OPTIMIZATION: Fetch in parallel but select only what's needed.
  const [tasks, units, studyDashboard, dailySession, weekData, habits] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        OR: [
          { date: { gte: today, lt: tomorrow } },
          { date: { lt: today }, status: { notIn: [TaskStatus.completed, TaskStatus.archived] } }
        ]
      },
      select: {
        id: true,
        title: true,
        estimatedMinutes: true,
        status: true,
        priority: true,
        date: true,
        dueDate: true,
        metadata: true,
        subtasks: { select: { id: true, title: true, completed: true } },
        plan: { select: { title: true } }
      },
      orderBy: [{ date: 'asc' }, { priority: 'desc' }]
    }),
    prisma.unit.findMany({
      where: {
        track: { userId },
        status: { in: [UnitStatus.TODAY, UnitStatus.IN_PROGRESS] }
      },
      select: {
        id: true, title: true, type: true, durationMinutes: true, watchPercentage: true, status: true, metadata: true, orderIndex: true, track: { select: { id: true, title: true, type: true } }
      },
      orderBy: { orderIndex: 'asc' }
    }),
    StudyService.getDashboard(userId),
    prisma.dailySession.findFirst({ where: { userId, date: today }, select: { id: true, date: true } }),
    getUnifiedWeek(userId),
    prisma.habit.findMany({
      where: { userId, active: true },
      select: {
        id: true, title: true, icon: true, color: true, logs: { where: { date: today }, select: { id: true } }
      },
      orderBy: { order: 'asc' }
    })
  ]);

  // Logic: Calculate total vs remaining minutes
  const totalStudyMinutes = units.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);
  const completedStudyMinutes = units.reduce((acc, u) => acc + Math.floor(((u.watchPercentage || 0) / 100) * (u.durationMinutes || 0)), 0);
  
  const totalTaskMinutes = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const completedTaskMinutes = tasks.filter(t => t.status === 'completed').reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const totalPlannedMinutes = totalStudyMinutes + totalTaskMinutes;
  const completedMinutes = completedStudyMinutes + completedTaskMinutes;
  
  let loadState: 'OPTIMAL' | 'HEAVY' | 'OVERLOADED' | 'IMPOSSIBLE' = 'OPTIMAL';
  if (totalPlannedMinutes > 600) loadState = 'IMPOSSIBLE'; // > 10 hours
  else if (totalPlannedMinutes > 420) loadState = 'OVERLOADED'; // > 7 hours
  else if (totalPlannedMinutes > 240) loadState = 'HEAVY'; // > 4 hours

  // Calculate real execution score
  const completionRate = totalPlannedMinutes > 0 ? (completedMinutes / totalPlannedMinutes) * 100 : 100;
  const habitRate = habits.length > 0 ? (habits.filter(h => h.logs.length > 0).length / habits.length) * 100 : 100;
  const executionScore = Math.round((completionRate * 0.7) + (habitRate * 0.3));

  return {
    vitality: {
      totalPlannedMinutes,
      completedMinutes,
      loadState,
      focusSessionsPlanned: units.length + tasks.length,
      executionScore,
    },
    primers: habits.map(h => ({
      id: h.id,
      title: h.title,
      icon: h.icon,
      color: h.color,
      completed: h.logs.length > 0
    })),
    sections: {
      tasks: tasks.map(t => ({
        id: t.id,
        type: 'TASK',
        title: t.title,
        vectorName: t.plan?.title || 'Inbox',
        duration: t.estimatedMinutes || 0,
        priority: t.priority,
        status: t.status,
        date: t.date,
        dueDate: t.dueDate,
        metadata: t.metadata,
        subtasks: t.subtasks,
        isOverdue: t.date ? t.date < today : false
      })),
      study: units.map(u => ({
        id: u.id,
        type: u.type,
        title: u.title,
        vectorName: u.track.title,
        trackId: u.track.id,
        trackType: u.track.type,
        duration: u.durationMinutes || 0,
        progress: u.watchPercentage || 0,
        status: u.status,
        metadata: u.metadata
      }))
    },
    pulse: {
        breakdown: {
            work: totalTaskMinutes,
            study: totalStudyMinutes,
            media: units.filter(u => u.type === 'VIDEO').reduce((acc, u) => acc + (u.durationMinutes || 0), 0)
        },
        remaining: {
            tasks: tasks.filter(t => t.status !== TaskStatus.completed).length,
            study: units.filter(u => u.status !== UnitStatus.DONE).length
        }
    },
    week: weekData,
    studyDashboard
  };
}

export async function getUnifiedWeek(userId: string) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    const [tasks, units] = await Promise.all([
        prisma.task.findMany({
            where: { userId, date: { gte: today, lt: endOfWeek } },
            include: { plan: { select: { title: true } } }
        }),
        prisma.unit.findMany({
            where: { track: { userId }, status: { in: [UnitStatus.TODAY, UnitStatus.THIS_WEEK, UnitStatus.IN_PROGRESS] } },
            include: { track: { select: { title: true, type: true } } }
        })
    ]);

    const bucketed: Record<string, any[]> = {};
    for(let i=0; i<7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        bucketed[d.toISOString().split('T')[0]] = [];
    }

    tasks.forEach(t => {
        if (t.date) {
            const key = t.date.toISOString().split('T')[0];
            if (bucketed[key]) bucketed[key].push({ ...t, type: 'TASK' });
        }
    });

    return {
        bucketed,
        stats: {
            totalItems: tasks.length + units.length
        }
    };
}
