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
      className={`group relative w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 transition-all duration-300 flex flex-col gap-2 ${isDone ? 'opacity-40 grayscale-[0.5]' : 'shadow-sm hover:shadow-xl hover:shadow-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/30'}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${isDone ? 'bg-emerald-500/10 text-emerald-500' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] bg-[var(--bg-secondary)] group-hover:bg-[var(--accent-color)]/10 border border-[var(--border-color)] group-hover:border-[var(--accent-color)]/20 shadow-inner'}`}>
          {isDone ? <CheckCircle size={16} /> : isRevision ? <Zap size={16} /> : <Youtube size={16} />}
        </div>
        
        {/* Title & Metadata */}
        <div className="flex-1 min-w-0 flex flex-col text-left">
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5 px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[8px] font-black rounded-lg border border-[var(--border-color)] leading-none italic uppercase tracking-tighter">
              {displayIndex + 1}
            </span>
            <h3 className={`text-[11px] font-black leading-tight line-clamp-2 uppercase italic tracking-tighter ${isDone ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
              {unit.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5 ml-[2px]">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40">
              {unit.durationMinutes || 0} MIN
            </span>
            {watchPercentage > 0 && !isDone && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)] italic">
                  {Math.round(watchPercentage)}% COMPLETE
                </span>
              </>
            )}
            {isDone && isNotConfident && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500 italic">
                  NEURAL REVIEW REQ.
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-color)]/50">
        <div className="flex items-center gap-2">
          {!isDone ? (
            <>
              <button
                onClick={() => onAction('SESSION', unit)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] transition-all active:scale-95 italic"
              >
                <Play size={10} fill="currentColor" />
                ENGAGE
              </button>
              <button 
                onClick={() => onAction('COMPLETE', unit)}
                className="p-2 text-[var(--text-secondary)] opacity-40 hover:opacity-100 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all active:scale-95"
                title="Mark Complete"
              >
                <CheckCircle size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onAction('SESSION', unit)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all italic"
            >
              ACCESS LEDGER
            </button>
          )}
        </div>
        
        <button className="p-2 text-[var(--text-secondary)] opacity-20 hover:opacity-100 hover:text-[var(--text-primary)] transition-all rounded-xl hover:bg-[var(--bg-secondary)]">
          <MoreVertical size={14} />
        </button>
      </div>
      
      {/* Progress Bar (Compact) */}
      {!isDone && watchPercentage > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--bg-secondary)] rounded-b-xl overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${watchPercentage}%` }}
            className="h-full bg-[var(--accent-color)]"
          />
        </div>
      )}
    </motion.div>
  );
}
