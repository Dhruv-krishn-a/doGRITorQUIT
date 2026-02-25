//packages/study-ui-web/src/components/UnitCard.tsx
"use client";

import { Draggable } from '@hello-pangea/dnd';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  History,
  Youtube,
  RefreshCcw,
  Zap,
  Smile,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react';
import { Unit } from '@planner/study-core';
import { motion } from 'framer-motion';
import { useStudyUI } from '../context/StudyUIContext';

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
      <div className="mb-6">
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
          className="mb-6 outline-none"
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

  // Partial Goal Logic
  const hasDailyGoal = !!unit.todayGoalMinutes;
  const currentMins = Math.floor((unit.totalWatchedSeconds || 0) / 60);
  const goalRemaining = hasDailyGoal ? Math.max(0, unit.todayGoalMinutes! - currentMins) : 0;
  const isGoalReached = hasDailyGoal && goalRemaining === 0;

  // Animation variants for smooth Framer Motion physics
  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  return (
    <motion.div
      // Entrance Animation
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.05 }}
      
      // Card Lift Micro-interaction
      whileHover={!isDragging ? { y: -4 } : {}}
      
      // Premium Layout & Layered Styling - COMPACT VERSION
      className={`relative w-full p-3.5 md:p-4 rounded-2xl border transition-[box-shadow,border-color] duration-300 group overflow-hidden will-change-transform ${
        isDragging 
          ? 'shadow-[0_0_20px_rgba(244,63,94,0.3)] border-rose-400 bg-[#1c0510] scale-[1.02] z-50' 
          : isRevision 
            ? 'bg-gradient-to-br from-[#2a081a] to-[#14030b] border-fuchsia-900/40 hover:border-fuchsia-500/50 shadow-md hover:shadow-xl hover:shadow-fuchsia-900/20'
            : 'bg-gradient-to-br from-[#2a081a] to-[#14030b] border-rose-900/40 hover:border-rose-500/40 shadow-md hover:shadow-xl hover:shadow-rose-900/20'
      }`}
    >
      {/* Background Subtle Glow Injection */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] -mr-8 -mt-8 transition-opacity duration-500 pointer-events-none ${isRevision ? 'bg-fuchsia-500/10 opacity-50 group-hover:opacity-100' : 'bg-rose-500/10 opacity-40 group-hover:opacity-100'}`} />

      {/* --- Header Section --- */}
      <div className="relative z-10 flex justify-between items-start mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Elegant Badge Pill */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1c0510] border border-rose-500/20 shadow-[inset_0_0_5px_rgba(244,63,94,0.1)] group-hover:border-rose-500/40 transition-all duration-300">
            <Sparkles size={8} className={`${isRevision ? 'text-fuchsia-500 drop-shadow-[0_0_3px_rgba(217,70,239,0.8)]' : 'text-rose-500 drop-shadow-[0_0_3px_rgba(244,63,94,0.8)]'}`} />
            <span className={`text-[7px] font-black uppercase tracking-widest leading-none pt-0.5 ${isRevision ? 'text-fuchsia-300' : 'text-rose-300'}`}>
              {(unit.orderIndex ?? index) + 1}
            </span>
          </div>
          
          {/* Status Indicators */}
          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest border transition-colors ${
            isDone ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
            watchPercentage > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
            'bg-[#14030b] text-rose-400/30 border-rose-900/50'
          }`}>
            {isDone ? 'Done' : watchPercentage > 0 ? `${Math.round(watchPercentage)}%` : 'Next'}
          </span>

          {/* Daily Goal Badge */}
          {hasDailyGoal && !isDone && (
            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest border transition-all ${
              isGoalReached 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
            }`}>
              {isGoalReached ? 'Goal Met' : `Target: ${goalRemaining}m`}
            </span>
          )}

          {/* Confidence Badges */}
          {isDone && isConfident && (
            <div className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20" title="Confident">
              <ThumbsUp size={8} strokeWidth={3} />
            </div>
          )}
          {isDone && isNotConfident && (
            <div className="w-4 h-4 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/20" title="Needs Work">
              <ThumbsDown size={8} strokeWidth={3} />
            </div>
          )}
        </div>
        
        {/* Top Right Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
           {youtubeId && (
             <a href={`https://youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noreferrer" className="p-1 text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all">
               <Youtube size={10} />
             </a>
           )}
           <button className="p-1 text-rose-400/50 hover:text-rose-300 hover:bg-rose-500/10 rounded-full transition-all">
              <MoreVertical size={12} />
           </button>
        </div>
      </div>
      
      {/* --- Title --- */}
      <h3 className={`relative z-10 text-[13px] font-black leading-tight tracking-tight mb-3 line-clamp-2 transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)] ${
        isRevision ? 'text-fuchsia-50 group-hover:text-white' : 'text-rose-50 group-hover:text-white'
      }`}>
        {unit.title}
      </h3>

      {/* --- Metadata Row --- */}
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 cursor-default">
            <History size={10} className={`transition-all duration-300 ${isRevision ? 'text-fuchsia-500 drop-shadow-[0_0_3px_rgba(217,70,239,0.5)]' : 'text-rose-500 drop-shadow-[0_0_3px_rgba(244,63,94,0.5)]'}`} />
            <span className="text-[8px] font-bold text-rose-200/50 uppercase tracking-widest pt-0.5">
              {studyTime}m
            </span>
        </div>
        <div className="w-0.5 h-0.5 rounded-full bg-rose-900/50" />
        <div className="flex items-center gap-1 cursor-default">
            <Clock size={10} className="text-rose-400/30 transition-all duration-300" />
            <span className="text-[8px] font-bold text-rose-300/40 uppercase tracking-widest pt-0.5">
              {unit.durationMinutes || 0}m
            </span>
        </div>
      </div>
      
      {/* --- Action Buttons --- */}
      <div className="relative z-10 flex flex-col gap-2">
        {!isDone ? (
          <>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springConfig}
              className="w-full"
            >
              {renderLink({
                href: `/dashboard/study/${unit.trackId}/unit/${unit.id}`,
                className: `w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.15em] shadow-md border ${
                  unit.type === 'REVISION' 
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 border-fuchsia-400/50' 
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 border-rose-400/50'
                }`,
                children: (
                  <>
                    {unit.type === 'REVISION' ? <Zap size={10} fill="currentColor" /> : <PlayCircle size={10} />}
                    <span className="pt-0.5">{unit.type === 'REVISION' ? 'Review' : 'Start'}</span>
                  </>
                )
              })}
            </motion.div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springConfig}
              onClick={() => onAction('COMPLETE', unit)}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#14030b] text-rose-400/60 border border-rose-900/60 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] hover:bg-rose-500/10 hover:border-rose-500/50 transition-colors duration-300"
            >
              <CheckCircle size={10} /> Finish
            </motion.button>
          </>
        ) : (
          <div className="flex gap-1.5">
            <motion.div
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springConfig}
              className="flex-1"
            >
              {renderLink({
                  href: `/dashboard/study/${unit.trackId}/unit/${unit.id}`,
                  className: "w-full flex items-center justify-center gap-1.5 py-2 bg-rose-500/10 text-rose-300 rounded-xl text-[8px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500/20 transition-all",
                  children: (
                    <>
                      <CheckCircle size={10} fill="currentColor" className="text-rose-500" />
                      <span className="pt-0.5">Notes</span>
                    </>
                  )
              })}
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springConfig}
              onClick={() => onAction('COMPLETE', unit)}
              className="px-2.5 bg-[#14030b] text-rose-400/40 border border-rose-900/50 rounded-xl hover:text-rose-300 hover:bg-rose-500/10 transition-all flex items-center justify-center"
              title="Confidence"
            >
              <Smile size={12} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}