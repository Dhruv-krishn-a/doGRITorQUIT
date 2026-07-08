"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Calendar, ArrowRight, Target,
  Plus, Brain, Flame,
  Activity, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// --- Types ---
type DashboardData = {
  user: { firstName: string; level: number; xp: number; nextLevelXp: number };
  stats: {
    focusMinutes: number;
    completedTasks: number;
    streakDays: number;
    efficiencyScore: number; 
  };
  activityHeatmap: Array<{ date: string; count: number }>; 
  activePlan: { title: string; progress: number; totalDays: number; currentDay: number } | null;
  habits: Array<{ id: string; title: string; completedToday: boolean; streak: number }>;
  todaysTasks: Array<{ id: string; title: string; status: string; priority: string; time?: string | number }>;
  upcomingEvents: Array<{ title: string; time: string; date: string }>;
};

function formatTimeSafe(time: string | number | undefined): string {
  if (time === undefined || time === null) return '';
  if (typeof time === 'number') {
    const h = Math.floor(time / 60) % 24;
    const m = time % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m.toString().padStart(2, '0');
    return `${displayH}:${displayM} ${ampm}`;
  }
  return time.toString();
}

export default function DashboardUI({ data }: { data: DashboardData }) {
  const { user, stats, activePlan, habits } = data;
  const router = useRouter();

  const hours = Math.floor(stats.focusMinutes / 60);
  const mins = stats.focusMinutes % 60;
  const xpPercentage = Math.min(100, (user.xp / user.nextLevelXp) * 100);

  return (
    <div className="transform-gpu space-y-8 md:space-y-12 pb-16">
      {/* Top Summary Row */}
      <div className="transform-gpu grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
        <MetricCard 
            icon={Clock} 
            label="Focus Time" 
            value={`${hours}H ${mins}M`} 
            subtext={`${stats.efficiencyScore}% focus score`}
            progress={stats.efficiencyScore}
            accentColor="var(--accent-color)"
        />

        <MetricCard 
            icon={CheckCircle2} 
            label="Tasks Completed" 
            value={stats.completedTasks.toString()} 
            subtext="Items finished today"
            accentColor="#10b981"
        />

        <MetricCard 
            icon={Flame} 
            label="Day Streak" 
            value={`${stats.streakDays} Days`} 
            subtext="Consistency streak"
            accentColor="#f59e0b"
        />

        <MetricCard 
            icon={TrendingUp} 
            label={`Level ${user.level}`} 
            value={`${Math.round(xpPercentage)}%`} 
            subtext="Progress to next level"
            progress={xpPercentage}
            accentColor="var(--accent-color)"
        />
      </div>

      {/* Main Grid Section */}
      <div className="transform-gpu grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10 lg:gap-12 items-stretch">
        
        {/* Active Goal & Habits */}
        <div className="transform-gpu xl:col-span-2 space-y-8 md:space-y-10 lg:space-y-12">
           
           {/* Current Goal Card */}
           <div className="transform-gpu bg-[var(--bg-card)] rounded-[2.5rem] md:rounded-[4rem] p-6 sm:p-10 md:p-14 border border-[var(--border-color)] relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 sm:gap-3 text-[var(--accent-color)] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] mb-4 sm:mb-8">
                    <Target size={14} className="sm:w-4 sm:h-4" /> Active Goal
                 </div>
                 <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-6 sm:mb-12 max-w-2xl leading-[1] text-left">
                    {activePlan?.title || "No active goal set"}
                 </h3>
                 
                 {activePlan ? (
                    <div className="space-y-6 sm:space-y-8 text-left">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-1 sm:mb-3">Goal Progress</p>
                             <p className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] italic leading-none">{activePlan.progress}%</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-1 sm:mb-3">Timeline</p>
                             <p className="text-lg sm:text-2xl md:text-3xl font-black text-[var(--text-secondary)] italic leading-none opacity-60">Day {activePlan.currentDay} of {activePlan.totalDays}</p>
                          </div>
                       </div>
                       <div className="w-full h-3 sm:h-4 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)] p-0.5 shadow-inner">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${activePlan.progress}%` }}
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className="transform-gpu h-full bg-[var(--accent-color)] rounded-full shadow-[0_0_15px_var(--accent-color)]/40" 
                          />
                       </div>
                    </div>
                 ) : (
                    <Link href="/dashboard/study" className="inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-3 sm:py-5 bg-[var(--accent-color)] text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-2xl shadow-[var(--accent-color)]/30 scale-105">
                       Start a new goal <Plus size={16} />
                    </Link>
                 )}
              </div>
              <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none translate-x-12 translate-y-12">
                 <Brain size={450} className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px]" />
              </div>
           </div>

           {/* Habit Tracking */}
           <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between px-2 sm:px-4">
                 <p className="text-[10px] sm:text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.5em] opacity-60">Daily Habits</p>
                 <Link href="/dashboard/daily-checklist" className="text-[9px] sm:text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] hover:underline flex items-center gap-2">View all <ArrowRight size={12} /></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                 {habits.slice(0, 4).map(h => (
                    <div key={h.id} className="transform-gpu flex items-center justify-between p-5 sm:p-8 bg-[var(--bg-card)]/50 rounded-2xl sm:rounded-[2.5rem] border border-[var(--border-color)] hover:border-[var(--accent-color)]/40 transition-all group shadow-lg">
                       <div className="flex items-center gap-4 sm:gap-6">
                          <div className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-inner",
                              h.completedToday 
                                ? 'bg-[#10b981] border-[#10b981] shadow-[#10b981]/30 scale-110' 
                                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] group-hover:border-[var(--accent-color)]/30'
                          )}>
                             {h.completedToday && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                          </div>
                          <span className={cn(
                              "text-base sm:text-lg font-black uppercase italic tracking-tight transition-colors duration-300",
                              h.completedToday ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'
                          )}>
                            {h.title}
                          </span>
                       </div>
                       <div className="flex flex-col items-end shrink-0">
                           <span className="text-[10px] sm:text-xs font-black text-[var(--accent-color)] italic leading-none">{h.streak}D</span>
                           <span className="text-[7px] sm:text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1.5 opacity-40">Streak</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Heatmap & Timeline Section */}
        <div className="xl:col-span-1 space-y-8 md:space-y-12">
            {/* Upcoming Events / Task Timeline */}
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 blur-3xl pointer-events-none rounded-full" />
                <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-color)] shadow-inner">
                        <Calendar size={18} className="text-[var(--accent-color)]" />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Timeline</h3>
                        <p className="text-[8px] md:text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-50">Today's Agenda</p>
                    </div>
                </div>

                <div className="space-y-3 relative z-10">
                    {data.todaysTasks.length === 0 ? (
                        <div className="py-10 border-2 border-dashed border-[var(--border-color)] rounded-[2rem] flex flex-col items-center justify-center text-center opacity-40">
                            <Activity size={24} className="text-[var(--text-secondary)] mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">No tasks scheduled</p>
                        </div>
                    ) : (
                        data.todaysTasks.map((t, idx) => (
                            <motion.div 
                                key={t.id}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                className="flex gap-4 items-center p-4 rounded-[1.5rem] bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 transition-all shadow-sm"
                            >
                                <div className="flex flex-col items-center min-w-[45px] border-r border-[var(--border-color)] pr-3">
                                    {t.time !== undefined && t.time !== null ? (
                                        <>
                                            <span className="text-[10px] font-black text-[var(--text-primary)] italic leading-none whitespace-nowrap">{formatTimeSafe(t.time)}</span>
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase italic leading-none">Any</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase tracking-tight text-[var(--text-primary)] truncate">{t.title}</p>
                                    <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">{t.priority} PRIORITY</p>
                                </div>
                                {t.status === 'completed' && <CheckCircle2 size={16} className="text-emerald-500" />}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Activity Heatmap */}
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-color)] shadow-inner">
                        <Activity size={18} className="text-[#10b981]" />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Heatmap</h3>
                        <p className="text-[8px] md:text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-50">Last 14 Days</p>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 relative z-10">
                    {data.activityHeatmap.length > 0 ? data.activityHeatmap.map((day, idx) => (
                        <div key={idx} className="aspect-square flex flex-col items-center justify-center">
                            <div className={cn(
                                "w-full h-full rounded-lg sm:rounded-xl border transition-all duration-500",
                                day.count > 0 
                                    ? "bg-[#10b981] border-[#10b981]/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                    : "bg-[var(--bg-secondary)] border-[var(--border-color)] opacity-30"
                            )} />
                        </div>
                    )) : (
                        <div className="col-span-7 py-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50 italic">
                            No recent activity data
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, progress, accentColor }: { 
    icon: any, label: string, value: string, subtext: string, progress?: number, accentColor: string 
}) {
    return (
        <div className="transform-gpu bg-[var(--bg-card)] p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden group hover:border-[var(--accent-color)]/30 transition-all duration-500">
           <Icon size={72} className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-1000 hidden sm:block" style={{ color: accentColor }} />
           
           <p className="text-[9px] sm:text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-4 sm:mb-10 opacity-50 text-left">{label}</p>
           
           <div className="space-y-1 sm:space-y-2 text-left">
              <span className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none">{value}</span>
              <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-2 sm:mt-3 opacity-40 leading-none">{subtext}</p>
           </div>

           {progress !== undefined && (
              <div className="mt-6 sm:mt-8 h-1 sm:h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/20">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "circOut" }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}66` }}
                 />
              </div>
           )}
        </div>
    );
}
