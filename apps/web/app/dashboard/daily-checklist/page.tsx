// apps/web/app/dashboard/daily-checklist/page.tsx
import { billing } from "@gritorquit/domain";
import { getServerUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { FeatureLocked } from "@/shared/components/FeatureLocked";
import ChecklistClientPage from "./client";
import { prisma } from "@/lib/prisma";
import { HabitData, Habit, HabitLog, DailyNote } from "@gritorquit/habits-core";

export default async function DailyChecklistPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 🔒 CHECK PERMISSION
  const perms = await billing.getPagePermissions(user.id);
  
  if (!perms.canViewChecklist) {
    return <FeatureLocked title="Daily Checklist" description="Track your daily habits, mood, and health with our advanced tracker." />;
  }

  // ✅ SERVER SIDE DATA FETCHING
  const initialData = await getChecklistDataForThisWeek(user.id);

  return (
    <ChecklistClientPage 
      initialData={initialData}
      serverDate={new Date().toISOString()}
    />
  );
}

async function getChecklistDataForThisWeek(userId: string): Promise<HabitData> {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  
  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  try {
    const [habits, notes] = await Promise.all([
      prisma.habit.findMany({
        where: { userId },
        include: {
          logs: {
            where: {
              date: { gte: start, lte: end }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.dailyNote.findMany({
        where: {
          userId,
          date: { gte: start, lte: end }
        }
      })
    ]);

    const flatLogs: HabitLog[] = habits.flatMap(h => 
      h.logs.map(l => ({
        id: l.id,
        habitId: h.id,
        date: l.date.toISOString(),
        completed: l.completed
      }))
    );

    const formattedHabits: Habit[] = habits.map(h => ({
      id: h.id,
      title: h.title,
      icon: h.icon,
      color: h.color,
      order: h.order,
      active: h.active,
      logs: [] 
    }));
    
    const formattedNotes: DailyNote[] = notes.map(n => ({
        id: n.id,
        date: n.date.toISOString(),
        content: n.content ?? ""
    }));

    return {
      habits: formattedHabits,
      logs: flatLogs,
      notes: formattedNotes
    };

  } catch (error) {
    console.error("Server Fetch Error:", error);
    return { habits: [], logs: [], notes: [] };
  }
}
