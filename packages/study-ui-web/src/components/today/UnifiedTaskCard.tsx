// packages/study-ui-web/src/components/today/UnifiedTaskCard.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  Briefcase, 
  BookOpen, 
  Youtube, 
  Clock, 
  CalendarClock,
  Layout,
  MoreVertical,
  MinusCircle
} from 'lucide-react';

interface UnifiedTaskCardProps {
  item: {
    id: string;
    type: 'TASK' | 'VIDEO' | 'LESSON' | 'FEATURE' | string;
    title: string;
    vectorName: string;
    duration: number;
    priority?: string;
    status?: string;
    progress?: number;
    difficulty?: string;
    isOverdue?: boolean;
    trackType?: string;
  };
  onStart: (id: string, type: string) => void;
  onComplete: (id: string, type: string) => void;
  onPostpone?: (id: string, type: string) => void;
}

export function UnifiedTaskCard({ item, onStart, onComplete, onPostpone }: UnifiedTaskCardProps) {
  const isStudy = ['VIDEO', 'LESSON'].includes(item.type);
  const isProject = item.trackType === 'PROJECT';
  const isCourse = item.trackType === 'COURSE';
  
  const getIcon = () => {
    switch (item.type) {
      case 'VIDEO': return <Youtube size={16} className="text-rose-500" />;
      case 'LESSON': return <BookOpen size={16} className="text-indigo-500" />;
      case 'FEATURE': return <Briefcase size={16} className="text-emerald-500" />;
      default: return <Layout size={16} className="text-amber-500" />;
    }
  };

  const getPriorityColor = (p?: string) => {
    switch (p?.toUpperCase()) {
      case 'HIGH': case 'URGENT': return 'bg-rose-100 text-rose-600';
      case 'MEDIUM': return 'bg-amber-100 text-amber-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <motion.div 
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_50px_rgba(244,63,94,0.08)] transition-all overflow-hidden flex items-center justify-between"
    >
      {/* Visual Indicator Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isStudy ? 'bg-rose-500' : isProject ? 'bg-emerald-500' : 'bg-indigo-500'}`} />

      <div className="flex items-center gap-6 flex-1 min-w-0">
        {/* Domain Icon Circle */}
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-rose-50 group-hover:border-rose-100 transition-colors">
          {getIcon()}
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0 gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-500 transition-colors">{item.vectorName}</span>
            {item.priority && (
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
            )}
            {item.isOverdue && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase tracking-tighter">Overdue</span>
            )}
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight truncate group-hover:text-slate-900 transition-colors">{item.title}</h3>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Clock size={12} />
              {item.duration}m
            </div>
            {item.difficulty && (
              <div className="px-2 py-0.5 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {item.difficulty}
              </div>
            )}
          </div>

          {/* Progress Bar (if duration > 10m) */}
          {item.duration > 10 && typeof item.progress === 'number' && (
             <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                />
             </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-4">
        <button 
          onClick={() => onPostpone?.(item.id, item.type)}
          className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all active:scale-95"
          title="Postpone to tomorrow"
        >
          <CalendarClock size={18} />
        </button>
        <button 
          onClick={() => onStart(item.id, item.type)}
          className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-rose-500 hover:shadow-rose-200 transition-all active:scale-95 group/btn"
        >
          <Play size={12} fill="currentColor" />
          Focus
        </button>
        <button 
          onClick={() => onComplete(item.id, item.type)}
          className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all active:scale-95"
        >
          <CheckCircle2 size={20} />
        </button>
      </div>
    </motion.div>
  );
}
