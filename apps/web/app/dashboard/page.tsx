import React from "react";
import {
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Target,
} from "lucide-react";
import Link from "next/link";

// --- Types ---
interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority?: string;
  estimatedMinutes?: number;
}

interface DashboardHabit {
  id: string;
  title: string;
  completedToday: boolean;
}

interface ActivePlan {
  id: string;
  title: string;
  progress: number;
}

interface DashboardStats {
  focusMinutes: number;
  completedTasks: number;
}

interface DashboardData {
  greeting: string;
  date: string;
  stats: DashboardStats;
  activePlan: ActivePlan | null;
  habits: DashboardHabit[];
  todaysTasks: DashboardTask[];
}

export default async function DashboardHome() {
  // 1. Fetch data directly on the server (No API call needed)
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="p-8 text-center text-rose-500">
        Failed to load dashboard data.
      </div>
    );
  }

  // 2. Prepare Display Data
  const focusMinutes = data.stats.focusMinutes;
  const completedTasks = data.stats.completedTasks;
  const displayDate = new Date(data.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // 3. Render HTML immediately
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {data.greeting}, User
          </h1>
          <p className="text-slate-500 mt-1">Here is your daily briefing.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Today
          </div>
          <div className="text-xl font-bold text-slate-800">{displayDate}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Focus Card */}
        <div className="bg-linear-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 transition-transform hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 opacity-80 mb-1">
                <Clock size={16} />{" "}
                <span className="text-sm font-medium">Total Focus</span>
              </div>
              <div className="text-4xl font-bold">
                {Math.floor(focusMinutes / 60)}
                <span className="text-lg opacity-60">h</span>{" "}
                {focusMinutes % 60}
                <span className="text-lg opacity-60">m</span>
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <Zap size={24} className="text-yellow-300" />
            </div>
          </div>
          <div className="mt-6 text-sm opacity-80">
            {completedTasks} tasks completed in total
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Target size={14} /> Current Plan
            </div>
            {data.activePlan ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1">
                  {data.activePlan.title}
                </h3>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, data.activePlan.progress)
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-right text-sm font-bold text-blue-600">
                  {Math.max(0, Math.min(100, data.activePlan.progress))}% Done
                </div>
              </>
            ) : (
              <div className="text-slate-400 py-4 text-sm font-medium">
                No active plan selected.
              </div>
            )}
          </div>
          <Link
            href="/dashboard/plans"
            className="text-sm font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 mt-4 group"
          >
            View Plans{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Quick Habits */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 size={14} /> Daily Habits
            </div>
            <Link
              href="/dashboard/daily-checklist"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {data.habits.slice(0, 3).map((h) => (
              <div key={h.id} className="flex items-center gap-3 group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    h.completedToday
                      ? "bg-green-500 border-green-500"
                      : "border-slate-300 group-hover:border-slate-400"
                  }`}
                >
                  {h.completedToday && (
                    <CheckCircle2 size={12} className="text-white" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    h.completedToday
                      ? "text-slate-400 line-through"
                      : "text-slate-700"
                  }`}
                >
                  {h.title}
                </span>
              </div>
            ))}
            {data.habits.length === 0 && (
              <span className="text-sm text-slate-400 italic">
                No habits set yet.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Tasks for Today</h2>
          <Link
            href="/dashboard/tasks"
            className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 group"
          >
            Open Task Manager{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-4xl shadow-sm overflow-hidden min-h-64">
          {data.todaysTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full">
              <Calendar className="w-12 h-12 mb-3 opacity-20" />
              <p>No tasks scheduled for today.</p>
              <Link
                href="/dashboard/plans"
                className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline"
              >
                Generate a Plan
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.todaysTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === "Completed"
                          ? "bg-green-500 border-green-500"
                          : "border-slate-300 group-hover:border-slate-400"
                      }`}
                    >
                      {task.status === "Completed" && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`font-medium transition-colors ${
                          task.status === "Completed"
                            ? "text-slate-400 line-through"
                            : "text-slate-800 group-hover:text-blue-700"
                        }`}
                      >
                        {task.title}
                      </div>
                      {task.priority && (
                        <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                          {task.priority}
                        </div>
                      )}
                    </div>
                  </div>
                  {task.estimatedMinutes && (
                    <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {task.estimatedMinutes}m
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SERVER SIDE DATA FETCHING ---
// COPY THE LOGIC FROM /api/dashboard/route.ts INTO HERE
async function getDashboardData(): Promise<DashboardData | null> {
  try {
    // ---------------------------------------------------------
    // OPTION 1 (BEST): Call your DB directly.
    // Replace this comments with your actual Prisma logic.
    // ---------------------------------------------------------
    /*
    import { prisma } from "@/lib/prisma";
    import { getCurrentUser } from "@/lib/auth";
    
    const user = await getCurrentUser();
    if (!user) return null;

    const [stats, habits, tasks] = await Promise.all([
      prisma.stats.findUnique({ where: { userId: user.id } }),
      prisma.habit.findMany({ where: { userId: user.id, date: new Date() } }),
      prisma.task.findMany({ where: { userId: user.id, completed: false } })
    ]);
    
    // Return formatted data here...
    */

    // ---------------------------------------------------------
    // OPTION 2 (TEMPORARY): Fetch from your own API
    // Use this ONLY if you can't move the DB logic right now.
    // Note: You need the absolute URL (e.g. http://localhost:3000 or your vercel domain)
    // ---------------------------------------------------------
    
    // For now, I'll return mock data so the page renders.
    // DELETE THIS MOCK AND UNCOMMENT OPTION 1 ABOVE.
    return {
      greeting: getGreeting(),
      date: new Date().toISOString(),
      stats: { focusMinutes: 120, completedTasks: 5 },
      activePlan: { id: "p1", title: "Project Launch", progress: 75 },
      habits: [
        { id: "h1", title: "Morning Run", completedToday: true },
        { id: "h2", title: "Read 10 mins", completedToday: false },
      ],
      todaysTasks: [
        { id: "t1", title: "Review Pull Requests", status: "Pending", priority: "High" },
        { id: "t2", title: "Team Sync", status: "Pending", estimatedMinutes: 30 },
      ],
    };
  } catch (error) {
    console.error("Server Fetch Error:", error);
    return null;
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}