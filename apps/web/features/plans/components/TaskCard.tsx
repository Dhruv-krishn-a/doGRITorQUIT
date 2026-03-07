// apps/web/features/plans/components/TaskCard.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  ChevronRight,
  Layout,
  CalendarClock,
  CheckCircle
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
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onPostpone?: () => void;
  onStart?: () => void;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
}

export function TaskCard({ task, onEdit, onDelete, onComplete, onPostpone, onStart, onToggleSubtask }: TaskCardProps) {
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
      whileHover={{ y: -2 }}
      className={`group relative bg-white border border-slate-100 rounded-[2.5rem] p-6 transition-all duration-300 ${isCompleted ? "opacity-60 grayscale-[0.5]" : "shadow-sm hover:shadow-[0_15px_40px_rgba(99,102,241,0.08)] hover:border-indigo-100"}`}
    >
        {/* Main Content Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            
            {/* Status Icon */}
            <button 
                onClick={(e) => { e.stopPropagation(); onComplete?.(); }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${isCompleted ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white"}`}
            >
                {isCompleted ? <CheckCircle size={24} /> : <Layout size={24} />}
            </button>

            {/* Title & Meta */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.plan?.title || 'Inbox Vector'}</span>
                    {task.priority && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                        </span>
                    )}
                </div>
                <h4 className={`text-lg font-black tracking-tight truncate ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {task.title}
                </h4>
                <div className="flex items-center gap-4 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <Clock size={12} /> {task.estimatedMinutes}m Estimated
                    </div>
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                            {task.subtasks.filter((s:any) => s.completed).length}/{task.subtasks.length} Modules
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:ml-4">
                {!isCompleted && (
                    <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onStart?.(); }}
                            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            <Play size={12} fill="currentColor" />
                            Focus
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPostpone?.(); }}
                            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all active:scale-95"
                            title="Reschedule"
                        >
                            <CalendarClock size={18} />
                        </button>
                    </>
                )}
                
                <div className="w-px h-8 bg-slate-100 mx-2 hidden md:block" />
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                    className="p-3 text-slate-300 hover:text-indigo-500 transition-colors"
                >
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>

        {/* Nested Subtasks Area - Only if they exist and not collapsed */}
        {task.subtasks && task.subtasks.length > 0 && !isCompleted && (
            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {task.subtasks.map((st: any) => (
                        <button 
                            key={st.id}
                            onClick={(e) => { e.stopPropagation(); onToggleSubtask?.(st.id, !st.completed); }}
                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${st.completed ? "bg-emerald-50/50 border-emerald-100 text-emerald-700" : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200"}`}
                        >
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${st.completed ? "bg-emerald-500 border-emerald-500 shadow-sm" : "bg-white border-slate-200"}`}>
                                {st.completed && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <span className={`text-[11px] font-bold truncate ${st.completed ? "opacity-60 line-through" : ""}`}>{st.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}
    </motion.div>
  );
}

// Minimal icons used in component
const Play = ({ size, fill, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

const MoreVertical = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);
