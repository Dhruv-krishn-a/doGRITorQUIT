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
  ThumbsDown
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
      <div className="mb-5">
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
          className="mb-5 outline-none"
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

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white p-5 rounded-[2rem] border transition-[box-shadow,border-color] duration-300 group relative will-change-transform ${
        isDragging 
          ? 'shadow-2xl border-rose-200 ring-8 ring-rose-50/50 scale-[1.04] z-50' 
          : isRevision 
            ? 'border-indigo-100 shadow-sm hover:border-indigo-300 bg-linear-to-b from-white to-indigo-50/10 hover:shadow-xl hover:shadow-indigo-100/20'
            : 'border-rose-50 shadow-sm hover:border-rose-200 hover:shadow-xl hover:shadow-rose-100/30'
      }`}
    >
      {/* Index Number Badge */}
      <div className="absolute -top-2.5 -left-2.5 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[10px] shadow-lg z-10 border-[3px] border-white group-hover:scale-110 group-hover:bg-rose-600 transition-all">
        {String((unit.orderIndex ?? index) + 1)}
      </div>

      <div className="flex justify-between items-start mb-3 pl-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border transition-colors ${
            isDone ? 'bg-rose-100 text-rose-600 border-rose-200' : 
            watchPercentage > 0 ? 'bg-rose-50 text-rose-500 border-rose-100' :
            'bg-slate-50 text-slate-400 border-slate-100'
          }`}>
            {isDone ? 'Done' : watchPercentage > 0 ? `${Math.round(watchPercentage)}%` : 'Next'}
          </span>
          
          {isRevision && (
            <span className="text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border bg-indigo-600 text-white border-indigo-700 flex items-center gap-1">
              <RefreshCcw size={6} /> Review
            </span>
          )}

          {isDone && isConfident && (
            <div className="w-4 h-4 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm" title="Confident">
              <ThumbsUp size={8} strokeWidth={3} />
            </div>
          )}
          {isDone && isNotConfident && (
            <div className="w-4 h-4 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-sm" title="Needs Work">
              <ThumbsDown size={8} strokeWidth={3} />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           {youtubeId && (
             <a href={`https://youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noreferrer" className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
               <Youtube size={12} />
             </a>
           )}
           <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <MoreVertical size={14} />
           </button>
        </div>
      </div>
      
      <h4 className={`text-xs font-bold mb-4 line-clamp-2 leading-snug transition-colors tracking-tight pl-3 ${isRevision ? 'text-indigo-900 group-hover:text-indigo-600' : 'text-slate-800 group-hover:text-rose-600'}`}>
        {unit.title}
      </h4>

      <div className="flex items-center gap-3 mb-5 pl-3">
        <div className="flex items-center gap-1.5">
            <History size={10} className={isRevision ? 'text-indigo-400' : 'text-rose-400'} />
            <span className="text-[9px] font-black text-slate-600">{studyTime}m</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-200" />
        <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-slate-300" />
            <span className="text-[9px] font-black text-slate-400">{unit.durationMinutes || 0}m</span>
        </div>
      </div>
      
      <div className="space-y-1.5">
        {!isDone ? (
          <>
            {renderLink({
              href: `/dashboard/study/${unit.trackId}/unit/${unit.id}`,
              className: `w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${unit.type === 'REVISION' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-rose-600'}`,
              children: (
                <>
                  {unit.type === 'REVISION' ? <Zap size={10} fill="currentColor" /> : <PlayCircle size={10} />}
                  <span>{unit.type === 'REVISION' ? 'Start Review' : 'Start Study'}</span>
                </>
              )
            })}
            
            <button 
              onClick={() => onAction('COMPLETE', unit)}
              title="Mark this lesson as finished"
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-rose-50/50 text-rose-500 border border-rose-100 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
            >
              <CheckCircle size={10} /> Mark as Done
            </button>
          </>
        ) : (
          <div className="flex gap-1.5">
            {renderLink({
                href: `/dashboard/study/${unit.trackId}/unit/${unit.id}`,
                className: "flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[8px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all",
                children: (
                  <>
                    <CheckCircle size={10} fill="currentColor" className="text-rose-200" />
                    Notes
                  </>
                )
            })}
            <button 
              onClick={() => onAction('COMPLETE', unit)}
              className="p-2.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-all"
              title="Update Confidence"
            >
              <Smile size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
