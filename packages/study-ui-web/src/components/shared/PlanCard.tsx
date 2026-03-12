// packages/study-ui-web/src/components/shared/PlanCard.tsx
"use client";

import React from "react";
import { 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Bot,
  Trash2,
  Sparkles,
  Zap
} from "lucide-react";
import { motion } from 'framer-motion';

interface PlanCardProps {
  plan: {
    id: string;
    title: string;
    description?: string | null;
    progress?: number;
    startDate?: string | Date | null;
    tasks?: any[];
  };
  onView: (plan: any) => void;
  onDelete: () => void;
}

const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };

export function PlanCard({ plan, onView, onDelete }: PlanCardProps) {
  const progress = plan.progress ?? 0;
  const taskCount = plan.tasks?.length || 0;
  const totalMinutes = plan.tasks?.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0) || 0;
  const totalHours = Math.round(totalMinutes / 60);

  const isAI = plan.description?.toLowerCase().includes("ai") || plan.title.toLowerCase().includes("ai");

  const formatHours = (hours: number) => {
    return `${hours} Hours`;
  };

  const formatDate = (dateInput: string | Date) => {
    try {
        const dateStr = typeof dateInput === 'string' ? dateInput : dateInput.toISOString();
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
        return String(dateInput);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      transition={springConfig}
      onClick={() => onView(plan)}
      className="transform-gpu bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-5 sm:p-6 lg:p-8 transition-all h-full flex flex-col group relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:border-indigo-100 hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] antialiased"
    >
      <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />
      <div className="transform-gpu absolute top-0 right-0 w-40 h-40 bg-indigo-300/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
        title="Delete Plan"
        className="transform-gpu absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 bg-white shadow-sm border border-slate-100 hover:border-red-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-105 active:scale-95"
      >
        <Trash2 size={16} strokeWidth={2.5} />
      </button>
      
      <div className="transform-gpu flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5 relative z-10 pr-8">
        <span className="transform-gpu text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border shadow-sm flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border-indigo-200">
          <Zap size={10} /> Roadmap
        </span>
        
        {isAI && (
          <span className="transform-gpu text-[8px] font-bold bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full uppercase tracking-widest border border-purple-200 shadow-sm flex items-center gap-1.5">
            <Bot size={10} /> AI Generated
          </span>
        )}

        {plan.startDate && (
          <div className="transform-gpu flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <Calendar size={10} className="transform-gpu text-slate-400"/> 
            <span className="transform-gpu text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              Sync: {formatDate(plan.startDate)}
            </span>
          </div>
        )}
      </div>
      
      <h3 className="transform-gpu text-lg sm:text-xl font-bold text-slate-900 mb-5 sm:mb-6 leading-tight line-clamp-2 relative z-10 tracking-tighter uppercase transition-colors group-hover:text-indigo-950">
        {plan.title}
      </h3>

      <div className="transform-gpu grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 relative z-10 group-hover:-translate-y-1 transition-transform duration-500 delay-75">
        <div className="transform-gpu bg-white/80 p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-sm transition-colors duration-300 min-w-0 group-hover:border-indigo-200">
          <div className="transform-gpu flex items-center gap-1.5 sm:gap-2 text-slate-400 mb-1">
            <CheckCircle2 size={12} className="transform-gpu text-indigo-500 shrink-0" />
            <span className="transform-gpu text-[7px] sm:text-[8px] font-bold uppercase tracking-widest truncate">Tasks</span>
          </div>
          <p className="transform-gpu text-base sm:text-xl font-bold text-slate-800 tracking-tighter truncate">{taskCount}</p>
        </div>
        <div className="transform-gpu bg-white/80 p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-sm transition-colors duration-300 min-w-0 group-hover:border-indigo-200">
          <div className="transform-gpu flex items-center gap-1.5 sm:gap-2 text-slate-400 mb-1">
            <Clock size={12} className="transform-gpu text-indigo-500 shrink-0" />
            <span className="transform-gpu text-[7px] sm:text-[8px] font-bold uppercase tracking-widest truncate">Duration</span>
          </div>
          <p className="transform-gpu text-base sm:text-xl font-bold text-slate-800 tracking-tighter truncate">
            {formatHours(totalHours)}
          </p>
        </div>
      </div>

      <div className="transform-gpu mt-auto space-y-5 sm:space-y-6 relative z-10">
        <div className="transform-gpu space-y-2.5 sm:space-y-3 group-hover:-translate-y-1 transition-transform duration-500 delay-150">
          <div className="transform-gpu flex justify-between items-end">
            <div className="transform-gpu flex items-center gap-1.5 text-slate-500">
              <Sparkles size={12} className="transform-gpu text-indigo-500" />
              <span className="transform-gpu text-[7px] sm:text-[8px] font-bold uppercase tracking-widest">
                Progress
              </span>
            </div>
            <div className="transform-gpu flex items-baseline gap-0.5">
              <span className="transform-gpu text-lg sm:text-xl font-bold text-slate-800 tracking-tighter leading-none">{Math.round(progress)}</span>
              <span className="transform-gpu text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">%</span>
            </div>
          </div>
          <div className="transform-gpu h-2 bg-white rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="transform-gpu h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full relative transition-shadow duration-500 group-hover:shadow-[0_0_12px_rgba(79,70,229,0.6)]"
            />
          </div>
        </div>

        {/* Bottom vector bar */}
        <div className="transform-gpu relative w-full bg-slate-50/50 rounded-full border border-slate-200 flex items-center p-1 sm:p-1.5 overflow-hidden transition-all duration-300 group-hover:bg-indigo-50 group-hover:border-indigo-200">
          <span className="transform-gpu relative z-10 pl-3 sm:pl-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors duration-300">
            Access Vector
          </span>
          <div className="transform-gpu relative z-10 ml-auto w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300">
             <ArrowRight size={14} className="transform-gpu group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
