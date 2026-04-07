// packages/dashboard-ui-web/src/components/today/CompactUnitCard.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Youtube,
  Zap,
  Play,
  Clock,
  History,
  BookOpen
} from 'lucide-react';

interface CompactUnitCardProps {
  unit: any;
  index: number;
  onAction: (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: any) => void;
}

export function CompactUnitCard({ unit, index, onAction }: CompactUnitCardProps) {
  const isDone = unit.status === 'COMPLETED' || unit.status === 'DONE' || unit.status === 'completed';
  const isRevision = unit.type === 'REVISION';
  const isVideo = unit.type === 'VIDEO';
  const isProject = unit.trackType === 'PROJECT' || unit.type === 'FEATURE';
  
  const watchPercentage = unit.watchPercentage || 0;

  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      className={`group relative w-full bg-white border border-slate-100 rounded-2xl p-3 transition-all duration-300 flex items-center gap-3 transform-gpu ${isDone ? 'opacity-60 grayscale-[0.5]' : 'shadow-sm hover:shadow-md hover:border-rose-100'}`}
    >
      {/* Icon/Status Circle */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white'}`}>
        {isDone ? <CheckCircle size={18} /> : isRevision ? <Zap size={18} /> : isProject ? <BookOpen size={18} /> : <Youtube size={18} />}
      </div>

      {/* Info Content */}
      <div className="transform-gpu flex-1 min-w-0 flex flex-col justify-center">
        <h3 className={`text-sm font-bold tracking-tight truncate ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {unit.title}
        </h3>
        
        <div className="transform-gpu flex items-center gap-3 mt-0.5">
          <div className="transform-gpu flex items-center gap-1 text-[9px] font-semibold text-slate-400">
            <Clock size={10} /> {unit.durationMinutes || unit.duration || 0}m
          </div>
          {watchPercentage > 0 && !isDone && (
            <div className="transform-gpu flex items-center gap-2 flex-1 max-w-[60px]">
                <div className="transform-gpu h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="transform-gpu h-full bg-rose-500" style={{ width: `${watchPercentage}%` }} />
                </div>
                <span className="transform-gpu text-[8px] font-semibold text-rose-500">{Math.round(watchPercentage)}%</span>
            </div>
          )}
          <span className="transform-gpu text-[9px] font-semibold text-slate-300">• {unit.vectorName || 'Study'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="transform-gpu flex items-center gap-1">
        {!isDone ? (
          <>
            <button
              onClick={() => onAction('SESSION', unit)}
              className="transform-gpu flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl font-bold text-[9px] uppercase tracking-wider hover:bg-rose-500 transition-all active:scale-95 shadow-md"
            >
              <Play size={10} fill="currentColor" />
              <span>Start</span>
            </button>
            <button 
              onClick={() => onAction('COMPLETE', unit)}
              className="transform-gpu p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all active:scale-95"
              title="Finish"
            >
              <CheckCircle size={16} />
            </button>
          </>
        ) : (
          <span className="transform-gpu text-[9px] font-semibold text-emerald-500 uppercase tracking-widest px-2">Completed</span>
        )}
      </div>
    </motion.div>
  );
}
