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
      whileHover={{ y: -2 }}
      style={{ backfaceVisibility: "hidden", WebkitFontSmoothing: "antialiased", transform: "translateZ(0)" }}
      className={`group relative w-full bg-white border border-slate-100 rounded-xl p-3 transition-all duration-300 flex flex-col gap-2 ${isDone ? 'opacity-60 grayscale-[0.5]' : 'shadow-sm hover:shadow-md hover:border-rose-200'}`}
    >
      <div className="transform-gpu flex items-start gap-2">
        {/* Icon/Status Circle */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white'}`}>
          {isDone ? <CheckCircle size={16} /> : isRevision ? <Zap size={16} /> : <Youtube size={16} />}
        </div>
        
        <div className="transform-gpu flex-1 min-w-0 flex flex-col">
          <h3 className={`text-xs font-bold leading-tight line-clamp-2 ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {unit.title}
          </h3>
          <span className="transform-gpu text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
            {(unit.orderIndex ?? index) + 1} • {unit.durationMinutes || 0}m
          </span>
        </div>
      </div>

      {/* Info Content & Progress */}
      <div className="transform-gpu flex flex-col gap-1 mt-0.5">
        <div className="transform-gpu flex flex-wrap items-center gap-1.5">
          {watchPercentage > 0 && !isDone && (
            <span className="transform-gpu px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-500 text-[8px] font-bold uppercase border border-rose-100">
              {Math.round(watchPercentage)}%
            </span>
          )}
          {hasDailyGoal && !isDone && (
            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase border ${isGoalReached ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              {isGoalReached ? 'Goal Met' : `${goalRemaining}m Left`}
            </span>
          )}
        </div>
        
        {/* Subtle Metadata Row */}
        <div className="transform-gpu flex items-center gap-2">
          <div className="transform-gpu flex items-center gap-1 text-[9px] font-bold text-slate-400">
            <History size={10} />
            {studyTime}m Logged
          </div>
          {isDone && (
            <div className="transform-gpu flex items-center gap-1">
              <div className="transform-gpu w-1 h-1 rounded-full bg-slate-200" />
              {isConfident ? (
                <span className="transform-gpu text-[9px] font-bold text-emerald-500 flex items-center gap-0.5"><Smile size={10}/> High Conf</span>
              ) : isNotConfident ? (
                <span className="transform-gpu text-[9px] font-bold text-amber-500 flex items-center gap-0.5">Needs Review</span>
              ) : null}
            </div>
          )}
        </div>

        {/* Progress Bar (Compact) */}
        {!isDone && watchPercentage > 0 && (
          <div className="transform-gpu w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${watchPercentage}%` }}
              className="transform-gpu h-full bg-rose-500 rounded-full"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="transform-gpu flex items-center justify-between gap-1 pt-2 mt-1 border-t border-slate-50">
        <div className="transform-gpu flex items-center gap-1">
          {!isDone ? (
            <>
              <button
                onClick={() => onAction('SESSION', unit)}
                className="transform-gpu flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider hover:bg-rose-500 transition-all active:scale-95 shadow-sm shadow-slate-200"
              >
                <Play size={10} fill="currentColor" />
                Start
              </button>
              <button 
                onClick={() => onAction('COMPLETE', unit)}
                className="transform-gpu p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all active:scale-95"
                title="Finish Task"
              >
                <CheckCircle size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onAction('SESSION', unit)}
              className="transform-gpu flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg font-bold text-[9px] uppercase tracking-wider hover:bg-white hover:text-rose-500 border border-transparent hover:border-rose-100 transition-all active:scale-95"
            >
              Review Notes
            </button>
          )}
        </div>
        
        <button className="transform-gpu p-1 text-slate-300 hover:text-slate-600 transition-colors">
          <MoreVertical size={14} />
        </button>
      </div>
    </motion.div>
  );
}
