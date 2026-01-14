// apps/web/app/dashboard/page.tsx
import React, { Suspense } from "react";
import {
  Zap, CheckCircle2, Clock, Calendar, ArrowRight, Target
} from "lucide-react";
import Link from "next/link";
import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { dashboard } from "@domain"; 

export default async function DashboardHome() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 fade-in">
      {/* ✅ INSTANT LOAD: Header shows up immediately from cached user data */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-500 mt-1">Here is your daily briefing.</p>
        </div>
      </div>

      {/* ✅ STREAMING: The slow data loads inside here while the user looks at the header */}
      <Suspense fallback={<DashboardSkeleton />}>
        <AsyncDashboardContent userId={user.id} />
      </Suspense>
    </div>
  );
}

// Separate async component for the heavy lifting
async function AsyncDashboardContent({ userId }: { userId: string }) {
  // This uses the optimized aggregation query
  const data = await dashboard.getDashboardStats(userId);

  if (!data) return <div className="text-red-500">Unable to load data.</div>;

  const { stats, activePlan, habits, todaysTasks } = data;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 opacity-80 mb-1">
                <Clock size={16} /> <span className="text-sm font-medium">Total Focus</span>
              </div>
              <div className="text-4xl font-bold">
                {Math.floor(stats.focusMinutes / 60)}<span className="text-lg opacity-60">h</span> {stats.focusMinutes % 60}<span className="text-lg opacity-60">m</span>
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl"><Zap size={24} className="text-yellow-300" /></div>
          </div>
          <div className="mt-6 text-sm opacity-80">{stats.completedTasks} tasks completed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Target size={14} /> Current Plan
            </div>
            {activePlan ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{activePlan.title}</h3>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${activePlan.progress}%` }} />
                </div>
                <div className="mt-2 text-right text-sm font-bold text-blue-600">{activePlan.progress}% Done</div>
              </>
            ) : (
              <div className="text-slate-400 py-4 text-sm font-medium">No active plan selected.</div>
            )}
          </div>
          <Link href="/dashboard/plans" className="text-sm font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 mt-4 group">
            View Plans <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 size={14} /> Daily Habits
            </div>
            <Link href="/dashboard/daily-checklist" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {habits.slice(0, 3).map((h) => (
              <div key={h.id} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${h.completedToday ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                  {h.completedToday && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className={`text-sm font-medium ${h.completedToday ? "text-slate-400 line-through" : "text-slate-700"}`}>{h.title}</span>
              </div>
            ))}
            {habits.length === 0 && <span className="text-sm text-slate-400 italic">No habits set yet.</span>}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-4xl shadow-sm overflow-hidden min-h-64">
        {todaysTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full">
            <Calendar className="w-12 h-12 mb-3 opacity-20" />
            <p>No tasks scheduled for today.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todaysTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.status === "Completed" ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                    {task.status === "Completed" && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <div className={`font-medium ${task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</div>
                </div>
                {task.estimatedMinutes && <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{task.estimatedMinutes}m</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
      </div>
      <div className="h-64 bg-slate-200 rounded-4xl"></div>
    </div>
  );
}