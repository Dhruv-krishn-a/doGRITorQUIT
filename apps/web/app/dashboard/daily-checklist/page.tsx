// apps/web/app/dashboard/daily-checklist/page.tsx
import { billing } from "@domain";
import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FeatureLocked } from "@/shared/components/FeatureLocked";
import ChecklistClientPage, { HabitType, LogType, NoteType } from "./client";
import { prisma } from "@/lib/prisma";

export default async function DailyChecklistPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 🔒 CHECK PERMISSION
  const perms = await billing.getPagePermissions(user.id);
  
  if (!perms.canViewChecklist) {
    return <FeatureLocked title="Daily Checklist" description="Track your daily habits, mood, and health with our advanced tracker." />;
  }

  // ✅ SERVER SIDE DATA FETCHING (No API calls)
  const initialData = await getChecklistDataForThisWeek(user.id);

  // ✅ RENDER UI with data already present
  return (
    <ChecklistClientPage 
      initialHabits={initialData.habits}
      initialLogs={initialData.logs}
      initialNotes={initialData.notes}
      serverDate={new Date().toISOString()}
    />
  );
}

// Helper to mimic the logic you likely have in /api/habits
async function getChecklistDataForThisWeek(userId: string) {
  // 1. Calculate "This Week" on server
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
  
  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  try {
    // 2. Parallel Fetch directly from DB
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

    // 3. Flatten logs for easier client consumption
    const flatLogs: LogType[] = habits.flatMap(h => 
      h.logs.map(l => ({
        id: l.id,
        habitId: h.id,
        date: l.date.toISOString(),
        completed: l.completed
      }))
    );

    // 4. Format habits
    const formattedHabits: HabitType[] = habits.map(h => ({
      id: h.id,
      title: h.title,
      icon: h.icon,
      color: h.color,
      logs: [] 
    }));
    
    // ✅ FIX: Ensure content is a string (handle nulls from DB)
    const formattedNotes: NoteType[] = notes.map(n => ({
        id: n.id,
        date: n.date.toISOString(),
        content: n.content ?? "" // Fallback to empty string if null
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