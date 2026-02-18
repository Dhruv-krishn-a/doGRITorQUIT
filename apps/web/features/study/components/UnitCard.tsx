"use client";

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  ExternalLink, 
  MoreVertical,
  History,
  Timer,
  Youtube
} from 'lucide-react';
import { Unit } from '@prisma/client';
import Link from 'next/link';

interface UnitCardProps {
  unit: Unit;
  index: number;
  onComplete?: (unit: Unit) => void;
  onStartSession?: (unit: Unit) => void;
  onStartTimer?: (unit: Unit) => void;
  onNotesClick?: (unit: Unit) => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({ 
  unit, 
  index, 
  onComplete, 
  onStartSession,
  onStartTimer,
  onNotesClick
}) => {
  const watchPercentage = unit.watchPercentage || 0;
  const isDone = unit.status === 'DONE';
  const youtubeId = (unit.metadata as any)?.youtubeId;
  const studyTime = unit.actualTimeSpentMinutes || 0;

  return (
    <Draggable draggableId={unit.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-5 rounded-[2rem] border transition-all group relative mb-4 ${
            snapshot.isDragging 
              ? 'shadow-2xl border-rose-200 ring-8 ring-rose-50/50 scale-[1.05] z-50' 
              : 'border-slate-100 shadow-sm hover:border-rose-200 hover:shadow-2xl hover:-translate-y-1'
          }`}
        >
          {/* Header Area */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2">
              <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border ${
                isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                watchPercentage > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                {isDone ? 'Fully Mastered' : watchPercentage > 0 ? `${Math.round(watchPercentage)}% Mastery` : 'Neural Queue'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
               {youtubeId && (
                 <a href={`https://youtube.com/watch?v=${youtubeId}`} target="_blank" className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                   <Youtube size={14} />
                 </a>
               )}
               <button className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors">
                 <MoreVertical size={14} />
               </button>
            </div>
          </div>
          
          <h4 className="text-sm font-bold text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-rose-600 transition-colors min-h-[2.5rem]">
            {unit.title}
          </h4>

          {/* Core Data Bar (Investment vs Progress) */}
          <div className="bg-slate-50/50 rounded-2xl p-3 mb-5 border border-slate-100/50 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Studied</span>
                   <span className="text-xs font-black text-rose-600 flex items-center gap-1">
                      <History size={10} /> {studyTime}m
                   </span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Length</span>
                   <span className="text-xs font-black text-slate-600 flex items-center gap-1">
                      <Clock size={10} /> {unit.durationMinutes || 0}m
                   </span>
                </div>
             </div>
             
             {/* Circular Mini Progress */}
             <div className="relative w-8 h-8">
                <svg className="w-full h-full transform -rotate-90">
                   <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-200" />
                   <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={88} strokeDashoffset={88 * (1 - watchPercentage / 100)} className="text-emerald-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-slate-500">
                   {Math.round(watchPercentage)}%
                </div>
             </div>
          </div>
          
          {/* Action Interface */}
          <div className="space-y-2">
            {!isDone ? (
              <>
                <button 
                  onClick={() => onStartSession?.(unit)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95 group/btn"
                >
                  <PlayCircle size={16} className="group-hover:scale-110 transition-transform" />
                  Start Study
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => onStartTimer?.(unit)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    <Timer size={12} /> Timer
                  </button>
                  <button 
                    onClick={() => onComplete?.(unit)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
                  >
                    <CheckCircle size={12} /> Mark Done
                  </button>
                </div>
              </>
            ) : (
              <Link
                href={`/dashboard/study/${unit.trackId}/unit/${unit.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all"
              >
                <CheckCircle size={16} fill="currentColor" className="text-emerald-200" />
                Analysis Complete
              </Link>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
