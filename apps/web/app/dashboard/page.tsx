import React, { Suspense } from "react";
import { getServerUser } from "@/lib/auth-server"; 
import { redirect } from "next/navigation";
import { dashboard, analytics } from "@gritorquit/domain";
import InsightsHub from "./InsightsHub";
import Loading from "./loading";

export default async function DashboardHome() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const displayName = user.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <Suspense fallback={<Loading />}>
      <AsyncInsightsWrapper userId={user.id} firstName={firstName} />
    </Suspense>
  );
}

// Separate async component to fetch data
async function AsyncInsightsWrapper({ userId, firstName }: { userId: string, firstName: string }) {
  const [dbData, analyticsData] = await Promise.all([
    dashboard.getDashboardStats(userId),
    analytics.getAnalyticsData(userId)
  ]);

  if (!dbData) {
    return (
      <div className="transform-gpu p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 text-center">
        Unable to load dashboard data. Please try again later.
      </div>
    );
  }

  // ENRICHMENT: Map DB data to the richer DashboardUI structure
  const enrichedDashboardData = {
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

  return (
    <InsightsHub 
      dashboardData={enrichedDashboardData} 
      analyticsData={analyticsData} 
      firstName={firstName} 
    />
  );
}
