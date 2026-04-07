"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Calendar, ArrowRight, Target,
  Trophy, MoreHorizontal, Plus, Brain, Flame,
  Play, BarChart3, TrendingUp, Activity
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
  activityHeatmap: Array<{ date: string; count: number }>; 
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
      className="transform-gpu space-y-8 pb-10 px-4 md:px-0"
    >
      {/* --- Header Section --- */}
      <div className="transform-gpu flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2">Atmospheric Scan</Text>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Insights
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-3xl border border-slate-700">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural XP</p>
              <p className="text-xs font-black text-white uppercase tracking-tighter">Level {user.level}</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
              <Activity size={18} className="text-sky-focus" />
           </div>
        </div>
      </div>

      {/* --- Top Metrics Grid --- */}
      <div className="transform-gpu grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Focus Time */}
        <div className="transform-gpu bg-slate-surface/30 p-6 rounded-[2.5rem] border border-slate-800 shadow-sm relative overflow-hidden group">
           <Clock size={40} className="absolute -right-2 -top-2 text-sky-focus/5 group-hover:text-sky-focus/10 transition-colors" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Focus Time</p>
           <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white italic">{hours}H {mins}M</span>
           </div>
           <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-sky-focus" style={{ width: `${stats.efficiencyScore}%` }} />
              </div>
              <span className="text-[9px] font-black text-sky-focus italic">{stats.efficiencyScore}%</span>
           </div>
        </div>

        {/* Resolved Vectors */}
        <div className="transform-gpu bg-slate-surface/30 p-6 rounded-[2.5rem] border border-slate-800 shadow-sm relative overflow-hidden group">
           <CheckCircle2 size={40} className="absolute -right-2 -top-2 text-mint/5 group-hover:text-mint/10 transition-colors" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Resolved</p>
           <span className="text-3xl font-black text-white italic">{stats.completedTasks}</span>
           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Vectors Today</p>
        </div>

        {/* Streak */}
        <div className="transform-gpu bg-slate-surface/30 p-6 rounded-[2.5rem] border border-slate-800 shadow-sm relative overflow-hidden group">
           <Flame size={40} className="absolute -right-2 -top-2 text-amber/5 group-hover:text-amber/10 transition-colors" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Streak</p>
           <span className="text-3xl font-black text-white italic">{stats.streakDays}D</span>
           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Consistency Cycles</p>
        </div>

        {/* XP Progress */}
        <div className="transform-gpu bg-slate-surface/30 p-6 rounded-[2.5rem] border border-slate-800 shadow-sm relative overflow-hidden group">
           <TrendingUp size={40} className="absolute -right-2 -top-2 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Evolution</p>
           <span className="text-3xl font-black text-white italic">{Math.round(xpPercentage)}%</span>
           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Next Neural Tier</p>
        </div>
      </div>

      {/* --- Main Arena Grid --- */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Active Mission & Habits (Left 2 Columns) */}
        <div className="transform-gpu lg:col-span-2 space-y-8">
           
           {/* Active Mission Card */}
           <div className="transform-gpu bg-slate-800/40 rounded-[3rem] p-8 border border-slate-800 relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 text-sky-focus text-[10px] font-black uppercase tracking-widest mb-4">
                    <Target size={14} /> Current Mission
                 </div>
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8">{activePlan?.title || "No Active Mission"}</h3>
                 
                 {activePlan ? (
                    <div>
                       <div className="flex justify-between items-end mb-3">
                          <div>
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-left">Sector Progress</p>
                             <p className="text-2xl font-black text-white italic">{activePlan.progress}%</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cycle</p>
                             <p className="text-xl font-black text-slate-400 italic">Day {activePlan.currentDay} of {activePlan.totalDays}</p>
                          </div>
                       </div>
                       <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${activePlan.progress}%` }}
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className="transform-gpu h-full bg-sky-focus rounded-full shadow-lg shadow-sky-500/20" 
                          />
                       </div>
                    </div>
                 ) : (
                    <Link href="/dashboard/study" className="inline-flex items-center gap-2 px-6 py-3 bg-sky-focus text-obsidian rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-sky-500/20">
                       Forge New Mission <Plus size={14} />
                    </Link>
                 )}
              </div>
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                 <Brain size={200} />
              </div>
           </div>

           {/* Habit Pulse Grid */}
           <div>
              <div className="flex items-center justify-between mb-4 ml-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Pulse Channels</p>
                 <Link href="/dashboard/daily-checklist" className="text-[9px] font-black text-sky-focus uppercase tracking-widest hover:underline">Full Array &rarr;</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {habits.slice(0, 4).map(h => (
                    <div key={h.id} className="transform-gpu flex items-center justify-between p-5 bg-slate-surface/20 rounded-[2rem] border border-slate-800">
                       <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${h.completedToday ? 'bg-mint border-mint' : 'bg-slate-800 border-slate-700'}`}>
                             {h.completedToday && <CheckCircle2 size={16} className="transform-gpu text-obsidian" />}
                          </div>
                          <span className={`text-sm font-black uppercase italic tracking-tight ${h.completedToday ? 'text-slate-600' : 'text-white'}`}>{h.title}</span>
                       </div>
                       <span className="text-[9px] font-black text-slate-700 uppercase italic">{h.streak}X</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Agenda Column (Right Sidebar style) */}
        <div className="transform-gpu bg-slate-surface/30 rounded-[3rem] p-8 border border-slate-800 flex flex-col h-full shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                    <Calendar size={16} className="text-sky-focus" />
                 </div>
                 <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Agenda</h3>
              </div>
              <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Realtime</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {todaysTasks.length === 0 && (
                 <div className="p-10 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                    <Activity size={24} className="text-slate-800 mb-2" />
                    <p className="text-[10px] font-black text-slate-700 uppercase italic">Array Empty</p>
                 </div>
              )}
              {todaysTasks.map((task) => (
                 <div key={task.id} className="transform-gpu group flex gap-4 items-center p-4 bg-obsidian/50 rounded-2xl border border-slate-800 hover:border-sky-focus/30 transition-all">
                    <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'HIGH' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : task.priority === 'MEDIUM' ? 'bg-amber' : 'bg-sky-500'}`} />
                    <div className="flex-1 min-w-0">
                       <p className={`text-xs font-black uppercase tracking-tight truncate ${task.status === 'completed' ? 'text-slate-600 line-through' : 'text-slate-300'}`}>{task.title}</p>
                       {task.time && <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1 flex items-center gap-1"><Clock size={10} /> {task.time}</p>}
                    </div>
                 </div>
              ))}
           </div>

           <Link href="/dashboard/today" className="mt-8 group flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white text-obsidian text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-focus transition-all shadow-lg active:scale-95">
              Command Center <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

      </div>
    </motion.div>
  );
}

function Text({ children, className }: { children: React.ReactNode, className?: string }) {
    return <p className={className}>{children}</p>;
}
