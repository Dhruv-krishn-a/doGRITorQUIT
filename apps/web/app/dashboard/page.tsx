import React, { Suspense } from "react";
import { getServerUser } from "@/lib/auth-server"; 
import { redirect } from "next/navigation";
import { dashboard } from "@gritorquit/domain";
import { prisma } from "@gritorquit/db";
import InsightsHub from "./InsightsHub";
import Loading from "./loading";

export default async function DashboardHome() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // Get name from database if available
  let displayName = user.email?.split('@')[0] || 'User';
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    });
    if (dbUser?.profile?.name) {
      displayName = dbUser.profile.name;
    } else if ((user as any).user_metadata?.full_name) {
      displayName = (user as any).user_metadata.full_name;
    }
  } catch (err) {
    console.error("Error fetching displayName:", err);
  }

  const firstName = displayName.split(' ')[0];

  return (
    <Suspense fallback={<Loading />}>
      <AsyncInsightsWrapper userId={user.id} firstName={firstName} />
    </Suspense>
  );
}

// Separate async component to fetch dashboard data quickly
async function AsyncInsightsWrapper({ userId, firstName }: { userId: string, firstName: string }) {
  const dbData = await dashboard.getDashboardStats(userId);

  if (!dbData) {
    return (
      <div className="transform-gpu p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-center mx-10 mt-10">
        Unable to load dashboard stats. All systems nominal but data-link failed.
      </div>
    );
  }

  // ENRICHMENT: Map DB data to the richer DashboardUI structure
  const enrichedDashboardData = {
    user: {
      firstName,
      level: 1, 
      xp: 0,    
      nextLevelXp: 100
    },
    stats: {
      focusMinutes: dbData.stats.focusMinutes,
      completedTasks: dbData.stats.completedTasks,
      streakDays: dbData.stats.habitStreak || 0,
      efficiencyScore: 85 // Mock or calculate from real data if available
    },
    activityHeatmap: [], 
    upcomingEvents: [],  
    
    activePlan: dbData.activePlan ? {
      title: dbData.activePlan.title,
      progress: dbData.activePlan.progress,
      totalDays: 30, 
      currentDay: 1  
    } : null,

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

  // We pass null for initial analyticsData to force the client to fetch it
  // This prevents the whole dashboard from being blocked by a slow analytics query
  return (
    <InsightsHub 
      dashboardData={enrichedDashboardData} 
      analyticsData={null as any} 
      firstName={firstName} 
    />
  );
}
