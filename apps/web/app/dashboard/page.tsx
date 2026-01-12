// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
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

/** Helper: ensure unknown is treated as record safely */
function toRecord(u: unknown): Record<string, unknown> {
  return typeof u === "object" && u !== null ? (u as Record<string, unknown>) : {};
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch("/api/dashboard")
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));

        // Normalize response: handle common naming variations and missing fields
        const statsSrc = toRecord((json as Record<string, unknown>).stats ?? {});
        const activePlanSrc = (json as Record<string, unknown>).activePlan ?? null;
        const habitsSrc = Array.isArray((json as Record<string, unknown>).habits)
          ? ((json as Record<string, unknown>).habits as unknown[])
          : [];
        const tasksSrc = Array.isArray((json as Record<string, unknown>).todaysTasks)
          ? ((json as Record<string, unknown>).todaysTasks as unknown[])
          : [];

        const normalized: DashboardData = {
          greeting: String((json as Record<string, unknown>).greeting ?? (json as Record<string, unknown>).message ?? "Hello"),
          date: String((json as Record<string, unknown>).date ?? new Date().toISOString()),
          stats: {
            focusMinutes:
              Number(
                statsSrc.focusMinutes ??
                  statsSrc.focus_minutes ??
                  (json as Record<string, unknown>).focusMinutes ??
                  0
              ) || 0,
            completedTasks:
              Number(
                statsSrc.completedTasks ??
                  statsSrc.completed_tasks ??
                  (json as Record<string, unknown>).completedTasks ??
                  0
              ) || 0,
          },
          activePlan: activePlanSrc
            ? {
                id: String(toRecord(activePlanSrc).id ?? toRecord(activePlanSrc)._id ?? "plan-0"),
                title: String(toRecord(activePlanSrc).title ?? toRecord(activePlanSrc).name ?? "Untitled Plan"),
                progress: Number(toRecord(activePlanSrc).progress ?? 0) || 0,
              }
            : null,
          habits: habitsSrc.map((h: unknown) => {
            const r = toRecord(h);
            return {
              id: String(r.id ?? r._id ?? Math.random()),
              title: String(r.title ?? r.name ?? ""),
              completedToday: Boolean(r.completedToday ?? r.done ?? false),
            } as DashboardHabit;
          }),
          todaysTasks: tasksSrc.map((t: unknown) => {
            const r = toRecord(t);
            return {
              id: String(r.id ?? r._id ?? Math.random()),
              title: String(r.title ?? r.name ?? ""),
              status: String(r.status ?? "Pending"),
              priority: r.priority != null ? String(r.priority) : undefined,
              estimatedMinutes: r.estimatedMinutes != null ? Number(r.estimatedMinutes) : undefined,
            } as DashboardTask;
          }),
        };

        if (mounted) setData(normalized);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard:", err);
        if (mounted) setData(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load dashboard data.</div>;

  const focusMinutes = data.stats?.focusMinutes ?? 0;
  const completedTasks = data.stats?.completedTasks ?? 0;
  const displayDate = (() => {
    try {
      return new Date(data.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    } catch {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  })();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{data.greeting}, User</h1>
          <p className="text-slate-500 mt-1">Here is your daily briefing.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Today</div>
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
                <Clock size={16} /> <span className="text-sm font-medium">Total Focus</span>
              </div>
              <div className="text-4xl font-bold">
                {Math.floor(focusMinutes / 60)}
                <span className="text-lg opacity-60">h</span> {focusMinutes % 60}
                <span className="text-lg opacity-60">m</span>
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <Zap size={24} className="text-yellow-300" />
            </div>
          </div>
          <div className="mt-6 text-sm opacity-80">{completedTasks} tasks completed in total</div>
        </div>

        {/* Active Plan Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Target size={14} /> Current Plan
            </div>
            {data.activePlan ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{data.activePlan.title}</h3>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.max(0, Math.min(100, data.activePlan.progress))}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-right text-sm font-bold text-blue-600">
                  {Math.max(0, Math.min(100, data.activePlan.progress))}% Done
                </div>
              </>
            ) : (
              <div className="text-slate-400 py-4 text-sm font-medium">No active plan selected.</div>
            )}
          </div>
          <Link
            href="/dashboard/plans"
            className="text-sm font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 mt-4 group"
          >
            View Plans <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Quick Habits */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 size={14} /> Daily Habits
            </div>
            <Link href="/dashboard/daily-checklist" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {data.habits.slice(0, 3).map((h) => (
              <div key={h.id} className="flex items-center gap-3 group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    h.completedToday ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-slate-400"
                  }`}
                >
                  {h.completedToday && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className={`text-sm font-medium ${h.completedToday ? "text-slate-400 line-through" : "text-slate-700"}`}>
                  {h.title}
                </span>
              </div>
            ))}
            {data.habits.length === 0 && <span className="text-sm text-slate-400 italic">No habits set yet.</span>}
          </div>
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Tasks for Today</h2>
          <Link href="/dashboard/tasks" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 group">
            Open Task Manager <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-4xl shadow-sm overflow-hidden min-h-64">
          {data.todaysTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full">
              <Calendar className="w-12 h-12 mb-3 opacity-20" />
              <p>No tasks scheduled for today.</p>
              <Link href="/dashboard/plans" className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline">
                Generate a Plan
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.todaysTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === "Completed" ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-slate-400"
                      }`}
                    >
                      {task.status === "Completed" && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <div>
                      <div className={`font-medium transition-colors ${task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-800 group-hover:text-blue-700"}`}>
                        {task.title}
                      </div>
                      {task.priority && <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{task.priority}</div>}
                    </div>
                  </div>
                  {task.estimatedMinutes && (
                    <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{task.estimatedMinutes}m</div>
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

// --- Skeleton Loader Component ---
function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-4xl"></div>
      </div>
    </div>
  );
}
