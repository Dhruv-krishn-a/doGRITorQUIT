"use client";

import React, { useEffect, useState } from "react";
import { 
  Zap, CheckCircle2, Clock, Calendar, ArrowRight, Target 
} from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Loading Command Center...</div>;
  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{data.greeting}, User</h1>
          <p className="text-slate-500 mt-1">Here is your daily briefing.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Today</div>
          <div className="text-xl font-bold text-slate-800">
            {new Date(data.date).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Focus Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 opacity-80 mb-1">
                <Clock size={16} /> <span className="text-sm font-medium">Total Focus</span>
              </div>
              <div className="text-4xl font-bold">
                {Math.floor(data.stats.focusMinutes / 60)}<span className="text-lg opacity-60">h</span> {data.stats.focusMinutes % 60}<span className="text-lg opacity-60">m</span>
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <Zap size={24} className="text-yellow-300" />
            </div>
          </div>
          <div className="mt-6 text-sm opacity-80">
            {data.stats.completedTasks} tasks completed in total
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Target size={14} /> Current Plan
            </div>
            {data.activePlan ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{data.activePlan.title}</h3>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${data.activePlan.progress}%` }} />
                </div>
                <div className="mt-2 text-right text-sm font-bold text-blue-600">{data.activePlan.progress}% Done</div>
              </>
            ) : (
              <div className="text-slate-400 py-4">No active plan selected.</div>
            )}
          </div>
          <Link href="/dashboard/plans" className="text-sm font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 mt-4">
            View Plans <ArrowRight size={14} />
          </Link>
        </div>

        {/* Quick Habits */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 size={14} /> Daily Habits
            </div>
            <Link href="/dashboard/daily-checklist" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
           </div>
           
           <div className="space-y-3">
             {data.habits.slice(0, 3).map((h: any) => (
               <div key={h.id} className="flex items-center gap-3">
                 <div className={`w-5 h-5 rounded border flex items-center justify-center ${h.completedToday ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                   {h.completedToday && <CheckCircle2 size={12} className="text-white" />}
                 </div>
                 <span className={`text-sm font-medium ${h.completedToday ? "text-slate-400 line-through" : "text-slate-700"}`}>
                   {h.title}
                 </span>
               </div>
             ))}
             {data.habits.length === 0 && <span className="text-sm text-slate-400">No habits set.</span>}
           </div>
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Tasks for Today</h2>
          <Link href="/dashboard/tasks" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            Open Task Manager <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
          {data.todaysTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No tasks scheduled for today.</p>
              <Link href="/dashboard/plans" className="text-blue-600 font-bold text-sm mt-2 inline-block">Generate a Plan</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.todaysTasks.map((task: any) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.status === "Completed" ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                       {task.status === "Completed" && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <div>
                      <div className={`font-medium ${task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {task.title}
                      </div>
                      {task.priority && <div className="text-[10px] uppercase font-bold text-slate-400">{task.priority}</div>}
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