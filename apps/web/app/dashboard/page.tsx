import React, { Suspense } from "react";
import { getServerUser } from "@/lib/auth-server"; 
import { redirect } from "next/navigation";
import { dashboard } from "@domain";
import DashboardUI from "./DashboardUI";
import Loading from "./loading";

export default async function DashboardHome() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Hello, <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">{firstName}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Let&apos;s make today productive.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Async Content Wrapper */}
      <Suspense fallback={<Loading />}>
        <AsyncDashboardWrapper userId={user.id} firstName={firstName} />
      </Suspense>
    </div>
  );
}

// Separate async component to fetch data
async function AsyncDashboardWrapper({ userId, firstName }: { userId: string, firstName: string }) {
  const dbData = await dashboard.getDashboardStats(userId);

  if (!dbData) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 text-center">
        Unable to load dashboard data. Please try again later.
      </div>
    );
  }

  // ENRICHMENT: Map DB data to the richer DashboardUI structure
  const enrichedData = {
    user: {
      firstName,
      level: 1, // Placeholder
      xp: 0,    // Placeholder
      nextLevelXp: 100
    },
    stats: {
      focusMinutes: dbData.stats.focusMinutes,
      completedTasks: dbData.stats.completedTasks,
      streakDays: dbData.stats.habitStreak || 0,
      efficiencyScore: 0 // Placeholder
    },
    activityHeatmap: [], // Placeholder
    upcomingEvents: [],  // Placeholder
    
    // Transform Plan
    activePlan: dbData.activePlan ? {
      title: dbData.activePlan.title,
      progress: dbData.activePlan.progress,
      totalDays: 30, // Default/Placeholder
      currentDay: 1  // Default/Placeholder
    } : null,

    // Transform Habits
    habits: dbData.habits.map((h: { id: string; title: string; completedToday: boolean }) => ({
      id: h.id,
      title: h.title,
      completedToday: h.completedToday,
      streak: 0 
    })),

    todaysTasks: dbData.todaysTasks.map((task: { id: string; title: string; status: string; priority?: string | null }) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority || "MEDIUM", 
      time: undefined 
    })),
  };

  return <DashboardUI data={enrichedData} />;
}