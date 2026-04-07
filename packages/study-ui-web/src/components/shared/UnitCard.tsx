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
import { Unit } from '@gritorquit/study-core';
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
    playlistIndex?: number;
  };
  index: number;
  onAction: (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: any) => void;
  isDraggable?: boolean;
}

export function UnitCard({ unit, index, onAction, isDraggable = true }: UnitCardProps) {
  if (!isDraggable) {
    return (
      <div className="h-full">
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
          className="mb-4 outline-none"
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
  
  // Use metadata.playlistIndex as the absolute source of truth for original numbering
  const displayIndex = (unit.metadata?.playlistIndex !== undefined) 
    ? unit.metadata.playlistIndex 
    : (unit.playlistIndex !== undefined ? unit.playlistIndex : unit.orderIndex);

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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className={`group relative w-full bg-white border border-slate-100 rounded-xl p-2.5 transition-all duration-300 flex flex-col gap-1.5 ${isDone ? 'opacity-50 grayscale-[0.3]' : 'shadow-sm hover:shadow-md hover:border-rose-200'}`}
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ${isDone ? 'text-emerald-500' : 'text-slate-400 group-hover:text-rose-500 bg-slate-50 group-hover:bg-rose-50'}`}>
          {isDone ? <CheckCircle size={14} /> : isRevision ? <Zap size={14} /> : <Youtube size={14} />}
        </div>
        
        {/* Title & Metadata */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start gap-1.5">
            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded-md border border-slate-200 leading-none">
              {displayIndex + 1}
            </span>
            <h3 className={`text-[11px] font-bold leading-tight line-clamp-2 ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {unit.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 ml-[26px]">
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
              {unit.durationMinutes || 0}m
            </span>
            {watchPercentage > 0 && !isDone && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-rose-500">
                  {Math.round(watchPercentage)}%
                </span>
              </>
            )}
            {isDone && isNotConfident && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500">
                  Review
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-50/80">
        <div className="flex items-center gap-1">
          {!isDone ? (
            <>
              <button
                onClick={() => onAction('SESSION', unit)}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-600 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-rose-100 hover:text-rose-700 transition-colors"
              >
                <Play size={10} fill="currentColor" />
                Start
              </button>
              <button 
                onClick={() => onAction('COMPLETE', unit)}
                className="p-1 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                title="Mark Complete"
              >
                <CheckCircle size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onAction('SESSION', unit)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
              Review Notes
            </button>
          )}
        </div>
        
        <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors rounded hover:bg-slate-50">
          <MoreVertical size={12} />
        </button>
      </div>
      
      {/* Progress Bar (Compact) */}
      {!isDone && watchPercentage > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 rounded-b-xl overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${watchPercentage}%` }}
            className="h-full bg-rose-400"
          />
        </div>
      )}
    </motion.div>
  );
}
