"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Target,
  Trophy,
  MoreHorizontal
} from "lucide-react";

// Define the shape of data coming from your domain
type DashboardData = {
  stats: {
    focusMinutes: number;
    completedTasks: number;
  };
  activePlan: {
    title: string;
    progress: number;
  } | null;
  habits: Array<{
    id: string;
    title: string;
    completedToday: boolean;
  }>;
  todaysTasks: Array<{
    id: string;
    title: string;
    status: string;
    estimatedMinutes?: number;
    startTime?: string;
  }>;
};

// Animation Variants (Explicitly typed to fix TS errors)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100 } 
  },
};

export default function DashboardUI({ data }: { data: DashboardData }) {
  const { stats, activePlan, habits, todaysTasks } = data;

  const hours = Math.floor(stats.focusMinutes / 60);
  const mins = stats.focusMinutes % 60;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Focus Stats (The "Hero" Card) */}
        <motion.div variants={itemVariants} className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-violet-700 rounded-4xl transition-transform duration-500 group-hover:scale-[1.02]" />
          
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl" />

          <div className="relative p-7 h-full flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="flex items-center gap-2 text-indigo-100 font-medium text-sm mb-1">
                  <Clock size={16} /> Total Focus
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">
                    {hours}<span className="text-2xl font-semibold opacity-60">h</span>
                  </span>
                  <span className="text-5xl font-black tracking-tighter ml-2">
                    {mins}<span className="text-2xl font-semibold opacity-60">m</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                 <Zap size={24} className="text-amber-300 fill-amber-300" />
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
               <Trophy size={18} className="text-yellow-300" />
               <span className="text-sm font-medium text-indigo-50">
                 {stats.completedTasks} tasks crushed today
               </span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Active Plan */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white rounded-4xl p-7 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-7 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target size={100} />
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Target size={14} /> Current Mission
            </div>
            
            {activePlan ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 leading-tight mb-6 line-clamp-2">
                  {activePlan.title}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-indigo-600">{activePlan.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${activePlan.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                      className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-600"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No active plan
              </div>
            )}
          </div>

          <Link href="/dashboard/plans" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group/link">
            {activePlan ? "Continue Plan" : "Start a Plan"} 
            <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Card 3: Habits */}
        <motion.div variants={itemVariants} className="bg-white rounded-4xl p-7 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 size={14} /> Habits
            </div>
            <Link href="/dashboard/daily-checklist" className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <MoreHorizontal size={20} />
            </Link>
          </div>

          <div className="space-y-3">
            {habits.slice(0, 3).map((h) => (
              <div key={h.id} className="group flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div 
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${h.completedToday 
                      ? "bg-green-500 border-green-500 shadow-md shadow-green-200 scale-110" 
                      : "border-slate-300 group-hover:border-indigo-400"}
                  `}
                >
                  {h.completedToday && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className={`text-sm font-medium transition-colors ${h.completedToday ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700"}`}>
                  {h.title}
                </span>
              </div>
            ))}
            {habits.length === 0 && (
              <div className="text-center py-6">
                 <p className="text-sm text-slate-400 italic">No habits tracking yet.</p>
                 <Link href="/dashboard/daily-checklist" className="text-xs font-bold text-indigo-600 mt-2 block hover:underline">
                    + Add Habit
                 </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom: Today's Tasks (Timeline Style) */}
      <motion.div variants={itemVariants} className="bg-white rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden min-h-75">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500" />
            Today&apos;s Schedule
          </h2>
          <div className="flex gap-2">
             <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
               {todaysTasks.filter(t => t.status === "Completed").length}/{todaysTasks.length} Done
             </span>
          </div>
        </div>

        {todaysTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 opacity-20" />
            </div>
            <p className="font-medium">No tasks scheduled for today.</p>
            <p className="text-sm opacity-60">Enjoy your free time!</p>
          </div>
        ) : (
          <div className="p-2">
            {todaysTasks.map((task, index) => (
              <motion.div 
                key={task.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
              >
                {/* Status Indicator */}
                <div 
                  className={`
                    w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                    ${task.status === "Completed" 
                      ? "bg-green-100 text-green-600" 
                      : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"}
                  `}
                >
                  {task.status === "Completed" ? <CheckCircle2 size={18} /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-base truncate transition-colors ${task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-800 group-hover:text-indigo-900"}`}>
                    {task.title}
                  </div>
                  {task.estimatedMinutes && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <Clock size={10} />
                      {task.estimatedMinutes} mins
                    </div>
                  )}
                </div>

                {/* Action/Time */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                   <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-xs hover:text-indigo-600 hover:border-indigo-200">
                      Details
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}