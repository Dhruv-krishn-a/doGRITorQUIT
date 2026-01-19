"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Calendar, ArrowRight, Target,
  Trophy, MoreHorizontal, Plus, Brain, Flame,
  Play
} from "lucide-react";

// --- Types ---
type DashboardData = {
  user: { firstName: string; level: number; xp: number; nextLevelXp: number };
  stats: {
    focusMinutes: number;
    completedTasks: number;
    streakDays: number;
    efficiencyScore: number; // e.g., 85%
  };
  activityHeatmap: Array<{ date: string; count: number }>; // For the mini-graph
  activePlan: { title: string; progress: number; totalDays: number; currentDay: number } | null;
  habits: Array<{ id: string; title: string; completedToday: boolean; streak: number }>;
  todaysTasks: Array<{ id: string; title: string; status: string; priority: string; time?: string }>;
  upcomingEvents: Array<{ title: string; time: string; date: string }>;
};

export default function DashboardUI({ data }: { data: DashboardData }) {
  const [quickTask, setQuickTask] = useState("");
  const { user, stats, activePlan, habits, todaysTasks, upcomingEvents } = data;

  const hours = Math.floor(stats.focusMinutes / 60);
  const mins = stats.focusMinutes % 60;
  const xpPercentage = Math.min(100, (user.xp / user.nextLevelXp) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* --- ROW 1: Welcome & Gamification --- */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        
        {/* Welcome & Level */}
        <div className="flex-1 bg-white rounded-4xl p-6 border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
           <div className="relative z-10">
              <h1 className="text-2xl font-bold text-slate-800">
                Ready to crush it, <span className="text-indigo-600">{user.firstName}</span>? 🚀
              </h1>
              <p className="text-slate-500 text-sm mt-1 mb-4">You are on a {stats.streakDays}-day streak! Keep the fire burning.</p>
              
              {/* XP Bar */}
              <div className="flex items-center gap-3">
                 <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">Lvl {user.level}</div>
                 <div className="h-2.5 w-48 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-indigo-500 to-purple-500" style={{ width: `${xpPercentage}%` }} />
                 </div>
                 <span className="text-xs text-slate-400 font-medium">{user.xp}/{user.nextLevelXp} XP</span>
              </div>
           </div>
           
           {/* Decorative BG */}
           <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-indigo-50/50 to-transparent pointer-events-none" />
           <Flame className="absolute right-8 top-1/2 -translate-y-1/2 text-orange-500/10 w-24 h-24" />
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-4">
           <button className="flex flex-col items-center justify-center w-24 h-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-4xl transition-all shadow-lg shadow-indigo-200">
              <Play size={24} className="mb-1 fill-white" />
              <span className="text-xs font-bold">Focus</span>
           </button>
           <button className="flex flex-col items-center justify-center w-24 h-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-4xl transition-all">
              <Brain size={24} className="mb-1" />
              <span className="text-xs font-bold">Note</span>
           </button>
        </div>
      </div>

      {/* --- ROW 2: The Bento Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-125">
        
        {/* COL 1: Main Stats (Vertical) */}
        <div className="md:col-span-1 flex flex-col gap-6 h-full">
           {/* Focus Card */}
           <div className="flex-1 bg-linear-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 text-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Clock size={80} />
              </div>
              <div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Focus Time</p>
                 <div className="text-4xl font-black">{hours}h {mins}m</div>
              </div>
              <div className="mt-4">
                 <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Efficiency</span>
                    <span>{stats.efficiencyScore}%</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-400 h-full rounded-full" style={{ width: `${stats.efficiencyScore}%` }} />
                 </div>
              </div>
           </div>

           {/* Tasks Stats */}
           <div className="h-40 bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col justify-center items-center relative">
              <h3 className="text-4xl font-black text-slate-800">{stats.completedTasks}</h3>
              <p className="text-slate-500 text-sm font-medium">Tasks Completed</p>
              <div className="absolute top-4 right-4 text-green-500 bg-green-50 rounded-full p-1.5">
                 <Trophy size={16} />
              </div>
           </div>
        </div>

        {/* COL 2: Active Plan & Habits (Wide Middle) */}
        <div className="md:col-span-2 flex flex-col gap-6 h-full">
           
           {/* Active Plan */}
           <div className="h-1/2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start z-10">
                 <div>
                    <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1">
                       <Target size={14} /> Current Mission
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{activePlan?.title || "No Active Plan"}</h3>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-black text-slate-200">Day {activePlan?.currentDay}</div>
                    <div className="text-xs text-slate-400">of {activePlan?.totalDays}</div>
                 </div>
              </div>

              {activePlan ? (
                 <div className="z-10">
                    <div className="flex justify-between text-sm font-medium mb-2">
                       <span className="text-slate-500">Progress</span>
                       <span className="text-slate-900">{activePlan.progress}%</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${activePlan.progress}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full" 
                       />
                    </div>
                 </div>
              ) : (
                 <Link href="/dashboard/plans" className="z-10 text-indigo-600 font-bold hover:underline">Start a Plan &rarr;</Link>
              )}
              
              {/* Background Graph Decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-indigo-50/50 to-transparent pointer-events-none" />
           </div>

           {/* Habits & Quick Capture */}
           <div className="h-1/2 grid grid-cols-2 gap-6">
              {/* Habits */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700">Habits</h4>
                    <Link href="/dashboard/daily-checklist" className="text-slate-400 hover:text-indigo-600"><MoreHorizontal size={18}/></Link>
                 </div>
                 <div className="space-y-3">
                    {habits.slice(0, 3).map(h => (
                       <div key={h.id} className="flex items-center gap-3">
                          <button className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${h.completedToday ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
                             {h.completedToday && <CheckCircle2 size={12} className="text-white" />}
                          </button>
                          <span className={`text-sm truncate ${h.completedToday ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{h.title}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Quick Capture */}
              <div className="bg-indigo-50 rounded-[2.5rem] border border-indigo-100 p-6 flex flex-col justify-between">
                 <div>
                    <h4 className="font-bold text-indigo-900 mb-1">Quick Add</h4>
                    <p className="text-xs text-indigo-600/70">Capture task instantly</p>
                 </div>
                 <div className="relative mt-2">
                    <input 
                       type="text" 
                       value={quickTask}
                       onChange={(e) => setQuickTask(e.target.value)}
                       placeholder="Buy milk..." 
                       className="w-full bg-white rounded-xl py-3 pl-4 pr-10 text-sm border-0 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none placeholder:text-slate-300"
                    />
                    <button className="absolute right-2 top-2 p-1 bg-indigo-100 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                       <Plus size={16} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* COL 3: Today's Agenda (Right Sidebar) */}
        <div className="md:col-span-1 bg-white rounded-[2.5rem] border border-slate-200 p-6 h-full flex flex-col overflow-hidden shadow-xl shadow-slate-200/50">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Calendar size={18} className="text-indigo-500" /> Agenda
              </h3>
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">Today</span>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-100">
              {todaysTasks.length === 0 && (
                 <div className="text-center text-slate-400 text-sm mt-10">No tasks remaining! 🎉</div>
              )}
              {todaysTasks.map((task) => (
                 <div key={task.id} className="group flex gap-3 items-start p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                       <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</p>
                       {task.time && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={10} /> {task.time}</p>}
                    </div>
                 </div>
              ))}
              
              {/* Upcoming Peek */}
              {upcomingEvents.length > 0 && (
                 <div className="pt-4 border-t border-slate-100 mt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Up Next</p>
                    {upcomingEvents.slice(0, 2).map((e, i) => (
                       <div key={i} className="flex gap-3 text-xs text-slate-500 mb-2">
                          <span className="font-mono text-indigo-400">{e.time}</span>
                          <span className="truncate">{e.title}</span>
                       </div>
                    ))}
                 </div>
              )}
           </div>

           <Link href="/dashboard/tasks" className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-colors">
              View All Tasks <ArrowRight size={16} />
           </Link>
        </div>

      </div>
    </motion.div>
  );
}