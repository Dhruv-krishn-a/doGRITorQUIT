import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Calendar, ArrowRight, Target,
  Trophy, MoreHorizontal, Plus, Brain, Flame,
  Play, Activity, TrendingUp
} from "lucide-react";

// --- Types ---
export type DashboardData = {
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
      className="space-y-8 pb-10"
    >
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 text-left">Atmospheric Scan</p>
          <h1 className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
            Insights
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--bg-card)]/50 p-4 rounded-3xl border border-[var(--border-color)]">
           <div className="text-right">
              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Neural XP</p>
              <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tighter">Level {user.level}</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)]">
              <Activity size={18} className="text-[var(--accent-color)]" />
           </div>
        </div>
      </div>

      {/* --- ROW 1: Metrics Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Focus Time */}
        <div className="bg-[var(--bg-card)]/40 p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm relative overflow-hidden group">
           <Clock size={40} className="absolute -right-2 -top-2 text-[var(--accent-color)]/5 group-hover:text-[var(--accent-color)]/10 transition-colors" />
           <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">Focus Time</p>
           <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[var(--text-primary)] italic">{hours}H {mins}M</span>
           </div>
           <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                 <div className="h-full bg-[var(--accent-color)]" style={{ width: `${stats.efficiencyScore}%` }} />
              </div>
              <span className="text-[9px] font-black text-[var(--accent-color)] italic">{stats.efficiencyScore}%</span>
           </div>
        </div>

        {/* Resolved Vectors */}
        <div className="bg-[var(--bg-card)]/40 p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm relative overflow-hidden group">
           <CheckCircle2 size={40} className="absolute -right-2 -top-2 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors" />
           <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">Resolved</p>
           <span className="text-3xl font-black text-[var(--text-primary)] italic">{stats.completedTasks}</span>
           <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Vectors Today</p>
        </div>

        {/* Streak */}
        <div className="bg-[var(--bg-card)]/40 p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm relative overflow-hidden group">
           <Flame size={40} className="absolute -right-2 -top-2 text-amber-500/5 group-hover:text-amber-500/10 transition-colors" />
           <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">Streak</p>
           <span className="text-3xl font-black text-[var(--text-primary)] italic">{stats.streakDays}D</span>
           <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Consistency Cycles</p>
        </div>

        {/* XP Progress */}
        <div className="bg-[var(--bg-card)]/40 p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm relative overflow-hidden group">
           <TrendingUp size={40} className="absolute -right-2 -top-2 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors" />
           <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">Evolution</p>
           <span className="text-3xl font-black text-[var(--text-primary)] italic">{Math.round(xpPercentage)}%</span>
           <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Next Neural Tier</p>
        </div>
      </div>

      {/* --- ROW 2: The Bento Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[500px]">
        
        {/* COL 1 & 2: Active Plan & Habits (Wide Middle) */}
        <div className="md:col-span-3 flex flex-col gap-6 h-full">
           
           {/* Active Plan */}
           <div className="h-3/5 bg-[var(--bg-card)]/30 rounded-[3rem] border border-[var(--border-color)] p-10 flex flex-col justify-between relative overflow-hidden shadow-xl">
              <div className="flex justify-between items-start z-10">
                 <div>
                    <div className="flex items-center gap-2 text-[var(--accent-color)] text-[10px] font-black uppercase tracking-widest mb-4 text-left">
                       <Target size={14} /> Current Mission
                    </div>
                    <h3 className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">{activePlan?.title || "No Active Mission"}</h3>
                 </div>
                 <div className="text-right">
                    <div className="text-4xl font-black text-[var(--text-secondary)]/30 italic">Day {activePlan?.currentDay || 0}</div>
                    <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">of {activePlan?.totalDays || 0}</div>
                 </div>
              </div>

              {activePlan ? (
                 <div className="z-10">
                    <div className="flex justify-between items-end mb-4">
                       <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-left">Sector Progress</p>
                       <p className="text-2xl font-black text-[var(--text-primary)] italic">{activePlan.progress}%</p>
                    </div>
                    <div className="w-full h-4 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)] p-1">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${activePlan.progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-[var(--accent-color)] rounded-full shadow-lg shadow-[var(--accent-color)]/20" 
                       />
                    </div>
                 </div>
              ) : (
                 <Link to="/study" className="z-10 inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all shadow-lg active:scale-95 w-fit">
                    Forge New Mission <Plus size={16} />
                 </Link>
              )}
              
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-1/4 translate-y-1/4">
                 <Brain size={400} className="text-[var(--text-primary)]" />
              </div>
           </div>

           {/* Habits */}
           <div className="h-2/5 flex flex-col">
              <div className="flex items-center justify-between mb-4 ml-1">
                 <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Pulse Channels</p>
                 <Link to="/daily-checklist" className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest hover:underline">Full Array &rarr;</Link>
              </div>
              <div className="grid grid-cols-3 gap-6 flex-1">
                 {habits.slice(0, 3).map(h => (
                    <div key={h.id} className="bg-[var(--bg-card)]/30 rounded-[2rem] border border-[var(--border-color)] p-6 flex flex-col justify-between group hover:border-[var(--accent-color)]/30 transition-all shadow-md">
                       <div className="flex justify-between items-start">
                          <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${h.completedToday ? 'bg-emerald-500 border-emerald-400' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}>
                             {h.completedToday && <CheckCircle2 size={20} className="text-white" />}
                          </div>
                          <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase italic">{h.streak}X Streak</span>
                       </div>
                       <p className={`text-lg font-black uppercase italic tracking-tight truncate ${h.completedToday ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>{h.title}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* COL 3: Today's Agenda (Right Sidebar) */}
        <div className="md:col-span-1 bg-[var(--bg-card)]/30 rounded-[3rem] border border-[var(--border-color)] shadow-2xl p-8 h-full flex flex-col overflow-hidden relative">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter flex items-center gap-3">
                 <Calendar size={20} className="text-[var(--accent-color)]" /> Agenda
              </h3>
              <div className="px-3 py-1 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)] shadow-sm">
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Today</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {todaysTasks.length === 0 && (
                 <div className="p-10 border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] flex flex-col items-center justify-center text-center mt-10">
                    <Activity size={24} className="text-[var(--text-secondary)]/30 mb-2" />
                    <p className="text-[10px] font-black text-[var(--text-secondary)]/50 uppercase italic">Array Empty</p>
                 </div>
              )}
              {todaysTasks.map((task) => (
                 <div key={task.id} className="group flex gap-4 items-center p-4 bg-[var(--bg-secondary)]/40 rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 transition-all">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.priority === 'HIGH' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-sky-500'}`} />
                    <div className="flex-1 min-w-0">
                       <p className={`text-xs font-black uppercase tracking-tight truncate ${task.status === 'completed' ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>{task.title}</p>
                       {task.time && <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 flex items-center gap-1"><Clock size={10} /> {task.time}</p>}
                    </div>
                 </div>
              ))}
           </div>

           <Link to="/today" className="mt-8 group flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--accent-color)] transition-all shadow-lg active:scale-95">
              Command Center <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

      </div>
    </motion.div>
  );
}
