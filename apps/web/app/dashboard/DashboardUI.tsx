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
import { MiniAgenda } from "@gritorquit/dashboard-ui-web";
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
  todaysTasks: Array<{ id: string; title: string; status: string; priority: string; time?: string }>;
  upcomingEvents: Array<{ title: string; time: string; date: string }>;
};

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

        {/* Agenda Section */}
        <MiniAgenda 
          className="xl:col-span-1 min-h-[500px]" 
          onHubClick={() => router.push("/dashboard/today")} 
        />

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
