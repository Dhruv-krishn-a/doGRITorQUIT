// packages/dashboard-ui-web/src/components/today/TaskCard.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Layout,
  CalendarClock,
  CheckCircle,
  MoreVertical,
  Play
} from 'lucide-react';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    priority?: string | null;
    estimatedMinutes?: number | null;
    status?: string;
    subtasks?: any[];
    plan?: { title: string };
  };
  isCompact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onPostpone?: () => void;
  onStart?: () => void;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
}

export function TaskCard({ task, isCompact, onEdit, onDelete, onComplete, onPostpone, onStart, onToggleSubtask }: TaskCardProps) {
  const isCompleted = task.status === "Completed" || task.status === "completed";
  
  const getPriorityStyle = (p?: string | null) => {
    switch (p?.toLowerCase()) {
      case 'high': case 'urgent': return 'bg-rose-50 text-rose-600 border border-rose-100';
      default: return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
    }
  };

  return (
    <motion.div 
      layout
      whileHover={{ y: -1 }}
      className={`group relative bg-white border border-slate-100 transition-all duration-300 transform-gpu ${isCompact ? "rounded-2xl p-3" : "rounded-[2.5rem] p-6"} ${isCompleted ? "opacity-60 grayscale-[0.5]" : "shadow-sm hover:shadow-md hover:border-indigo-100"}`}
    >
        {/* Main Content Row */}
        <div className={`flex items-center ${isCompact ? "gap-3" : "gap-6"}`}>
            
            {/* Status Icon */}
            <button 
                onClick={(e) => { e.stopPropagation(); onComplete?.(); }}
                className={`flex items-center justify-center shrink-0 transition-all ${isCompact ? "w-10 h-10 rounded-xl" : "w-14 h-14 rounded-2xl"} ${isCompleted ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white"}`}
            >
                {isCompleted ? <CheckCircle size={isCompact ? 18 : 24} /> : <Layout size={isCompact ? 18 : 24} />}
            </button>

            {/* Title & Meta */}
            <div className="transform-gpu flex-1 min-w-0">
                <div className="transform-gpu flex items-center gap-2 mb-0.5">
                    {!isCompact && <span className="transform-gpu text-[10px] font-semibold uppercase tracking-widest text-slate-400">{task.plan?.title || 'Inbox Vector'}</span>}
                    {task.priority && (
                        <span className={`text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                        </span>
                    )}
                </div>
                <h4 className={`${isCompact ? "text-sm" : "text-lg"} font-bold tracking-tight truncate ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {task.title}
                </h4>
                <div className="transform-gpu flex items-center gap-3 mt-0.5">
                    <div className="transform-gpu flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                        <Clock size={10} /> {task.estimatedMinutes}m
                    </div>
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="transform-gpu flex items-center gap-1 text-[9px] font-semibold text-indigo-500">
                            {task.subtasks.filter((s:any) => s.completed).length}/{task.subtasks.length} Modules
                        </div>
                    )}
                    {isCompact && <span className="transform-gpu text-[9px] font-semibold text-slate-300">• {task.plan?.title || 'Inbox'}</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="transform-gpu flex items-center gap-1">
                {!isCompleted && (
                    <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onStart?.(); }}
                            className={`flex items-center gap-2 bg-slate-900 text-white font-bold text-[9px] uppercase tracking-wider hover:bg-indigo-500 transition-all active:scale-95 shadow-md ${isCompact ? "px-3 py-2 rounded-xl" : "px-5 py-3 rounded-2xl"}`}
                        >
                            <Play size={10} fill="currentColor" />
                            <span>Focus</span>
                        </button>
                        {!isCompact && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onPostpone?.(); }}
                                className="transform-gpu p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all active:scale-95"
                                title="Reschedule"
                            >
                                <CalendarClock size={18} />
                            </button>
                        )}
                    </>
                )}
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                    className="transform-gpu p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                >
                    <MoreVertical size={16} />
                </button>
            </div>
        </div>

        {/* Nested Subtasks Area - Only if they exist and NOT compact */}
        {task.subtasks && task.subtasks.length > 0 && !isCompleted && !isCompact && (
            <div className="transform-gpu mt-4 pt-4 border-t border-slate-50 space-y-2">
                <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 gap-2">
                    {task.subtasks.map((st: any) => (
                        <button 
                            key={st.id}
                            onClick={(e) => { e.stopPropagation(); onToggleSubtask?.(st.id, !st.completed); }}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${st.completed ? "bg-emerald-50/50 border-emerald-100 text-emerald-700" : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200"}`}
                        >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${st.completed ? "bg-emerald-500 border-emerald-500 shadow-sm" : "bg-white border-slate-200"}`}>
                                {st.completed && <CheckCircle2 size={10} className="transform-gpu text-white" />}
                            </div>
                            <span className={`text-[10px] font-semibold truncate ${st.completed ? "opacity-60 line-through" : ""}`}>{st.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}
    </motion.div>
  );
}
