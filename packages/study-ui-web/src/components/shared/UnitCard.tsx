// packages/study-ui-web/src/components/shared/UnitCard.tsx
"use client";

import { Draggable } from '@hello-pangea/dnd';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  History,
  Youtube,
  Zap,
  Smile,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ArrowRight,
  Play
} from 'lucide-react';
import { Unit } from '@planner/study-core';
import { motion } from 'framer-motion';
import { useStudyUI } from '../../context/StudyUIContext';

interface UnitCardProps {
  unit: Unit & { 
    watchPercentage?: number; 
    actualTimeSpentMinutes?: number; 
    metadata?: any; 
    durationMinutes?: number;
    confidenceRating?: number;
    orderIndex: number;
  };
  index: number;
  onAction: (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: any) => void;
  isDraggable?: boolean;
}

export function UnitCard({ unit, index, onAction, isDraggable = true }: UnitCardProps) {
  if (!isDraggable) {
    return (
      <div className="transform-gpu h-full">
        <UnitCardContent unit={unit} index={index} onAction={onAction} />
      </div>
    );
  }

  return (
    <Draggable draggableId={unit.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="transform-gpu mb-4 outline-none"
        >
          <UnitCardContent 
            unit={unit} 
            index={index} 
            onAction={onAction} 
            isDragging={snapshot.isDragging} 
          />
        </div>
      )}
    </Draggable>
  );
}

function UnitCardContent({ 
  unit, 
  index, 
  onAction, 
  isDragging = false 
}: { 
  unit: any; 
  index: number; 
  onAction: any; 
  isDragging?: boolean;
}) {
  const { renderLink } = useStudyUI();
  
  const watchPercentage = unit.watchPercentage || 0;
  const isDone = unit.status === 'COMPLETED' || unit.status === 'DONE';
  const isRevision = unit.type === 'REVISION';
  const youtubeId = unit.metadata?.youtubeId;
  const studyTime = unit.actualTimeSpentMinutes || 0;
  
  const confidence = unit.confidenceRating || 0;
  const isConfident = confidence >= 4;
  const isNotConfident = confidence > 0 && confidence <= 2;

  const hasDailyGoal = !!unit.todayGoalMinutes;
  const currentMins = Math.floor((unit.totalWatchedSeconds || 0) / 60);
  const goalRemaining = hasDailyGoal ? Math.max(0, unit.todayGoalMinutes! - currentMins) : 0;
  const isGoalReached = hasDailyGoal && goalRemaining === 0;

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.005 }}
      className={`group relative w-full bg-white border border-slate-100 rounded-3xl p-5 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 ${isDone ? 'opacity-60 grayscale-[0.5]' : 'shadow-sm hover:shadow-[0_15px_40px_rgba(244,63,94,0.08)] hover:border-rose-100'}`}
    >
      {/* Icon/Status Circle */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white'}`}>
        {isDone ? <CheckCircle size={24} /> : isRevision ? <Zap size={24} /> : <Youtube size={24} />}
      </div>

      {/* Info Content */}
      <div className="transform-gpu flex-1 min-w-0 flex flex-col gap-1">
        <div className="transform-gpu flex items-center gap-3">
          <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {(unit.orderIndex ?? index) + 1} • {unit.durationMinutes || 0}m Total
          </span>
          {watchPercentage > 0 && !isDone && (
            <span className="transform-gpu px-2 py-0.5 rounded-lg bg-rose-50 text-rose-500 text-[9px] font-bold uppercase border border-rose-100">
              {Math.round(watchPercentage)}% Complete
            </span>
          )}
          {hasDailyGoal && !isDone && (
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${isGoalReached ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              {isGoalReached ? 'Goal Met' : `${goalRemaining}m Left Today`}
            </span>
          )}
        </div>
        <h3 className={`text-base font-bold tracking-tight truncate ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {unit.title}
        </h3>
        
        {/* Subtle Metadata Row */}
        <div className="transform-gpu flex items-center gap-4 mt-1">
          <div className="transform-gpu flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <History size={12} />
            {studyTime}m Logged
          </div>
          {isDone && (
            <div className="transform-gpu flex items-center gap-2">
              <div className="transform-gpu w-1 h-1 rounded-full bg-slate-200" />
              {isConfident ? (
                <span className="transform-gpu text-[10px] font-bold text-emerald-500 flex items-center gap-1"><Smile size={12}/> High Confidence</span>
              ) : isNotConfident ? (
                <span className="transform-gpu text-[10px] font-bold text-amber-500 flex items-center gap-1">Needs Review</span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar (Compact) */}
      {!isDone && watchPercentage > 0 && (
        <div className="transform-gpu hidden lg:block w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${watchPercentage}%` }}
            className="transform-gpu h-full bg-rose-500 rounded-full"
          />
        </div>
      )}

      {/* Actions (Horizontal) */}
      <div className="transform-gpu flex items-center gap-2">
        {!isDone ? (
          <>
            <button
              onClick={() => onAction('SESSION', unit)}
              className="transform-gpu flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.1em] hover:bg-rose-500 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <Play size={12} fill="currentColor" />
              Start
            </button>
            <button 
              onClick={() => onAction('COMPLETE', unit)}
              className="transform-gpu p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all active:scale-95"
              title="Finish Task"
            >
              <CheckCircle size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={() => onAction('SESSION', unit)}
            className="transform-gpu flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold text-[10px] uppercase tracking-[0.1em] hover:bg-white hover:text-rose-500 border border-transparent hover:border-rose-100 transition-all active:scale-95"
          >
            Review Notes
          </button>
        )}
        
        <button className="transform-gpu p-2 text-slate-300 hover:text-slate-600 transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </motion.div>
  );
}
