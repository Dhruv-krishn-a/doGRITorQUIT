"use client";

import React, { useMemo } from 'react';
import { Clock, Trash2, ArrowRight, Sparkles, Calendar, Timer, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { Track, Unit, useStudy } from '@planner/study-core';
import { useStudyUI } from '../context/StudyUIContext';

interface TrackCardProps {
  track: Track;
  onDelete: (id: string) => void;
}

export function TrackCard({ track, onDelete }: TrackCardProps) {
  const { navigate } = useStudyUI();
  const { openModal, fetchTrack } = useStudy();

  const studyTimeMins = useMemo(() => {
    return track.units?.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0) || 0;
  }, [track.units]);

  const watchTimeMins = useMemo(() => {
    return track.units?.reduce((acc, u) => {
      const percent = u.watchPercentage || 0;
      const duration = u.durationMinutes || 0;
      return acc + (duration * (percent / 100));
    }, 0) || 0;
  }, [track.units]);

  const totalDuration = track.totalDurationMinutes || 0;
  const remainingMins = track.remainingMinutes || 0;

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div 
      onClick={() => navigate(`/dashboard/study/${track.id}`)}
      className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:border-rose-200 hover:shadow-2xl hover:shadow-slate-100/30 transition-all h-full flex flex-col group relative overflow-hidden shadow-sm shadow-slate-200/50 cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-50 transition-colors duration-700" />
      
      <button 
        onClick={async (e) => { 
          e.preventDefault(); 
          e.stopPropagation();
          await fetchTrack(track.id);
          openModal('DELETE'); 
        }} 
        title="Delete this track"
        className="absolute top-6 right-6 p-4 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-20 hover:shadow-xl hover:shadow-rose-100/50 active:scale-90"
      >
        <Trash2 size={20} strokeWidth={2.5} />
      </button>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <span className="text-[8px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest">{track.type === 'PLAYLIST' ? 'Course' : 'Manual'}</span>
        {track.targetDate && (
          <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
            <Calendar size={12} className="text-rose-500"/> 
            <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">
              By {new Date(track.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-black text-slate-900 mb-6 leading-tight line-clamp-2 relative z-10 group-hover:text-rose-600 transition-colors tracking-tight">
        {track.title}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 group-hover:bg-white group-hover:border-rose-100 transition-all">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Timer size={12} className="text-rose-500" />
            <span className="text-[8px] font-black uppercase tracking-widest">Study Effort</span>
          </div>
          <p className="text-sm font-black text-slate-700">{formatMins(studyTimeMins)}</p>
          <p className="text-[7px] text-slate-400 mt-1 uppercase font-bold">Total time spent</p>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 group-hover:bg-white group-hover:border-rose-100 transition-all">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Youtube size={12} className="text-rose-500" />
            <span className="text-[8px] font-black uppercase tracking-widest">Watch Time</span>
          </div>
          <p className="text-sm font-black text-slate-700">{formatMins(watchTimeMins)}</p>
          <p className="text-[7px] text-slate-400 mt-1 uppercase font-bold">of {formatMins(totalDuration)} total</p>
        </div>
      </div>

      <div className="mt-auto space-y-6 relative z-10">
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-rose-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mastery Progress</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors tracking-tighter">{Math.round(track.progressPercentage)}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase">%</span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${track.progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-slate-900 rounded-full group-hover:bg-rose-500 transition-colors relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
           <div className="flex flex-col">
             <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Remaining</span>
             <span className="text-[10px] font-black text-rose-600">{formatMins(remainingMins)}</span>
           </div>
           <div className="bg-slate-900 p-3 rounded-xl text-white group-hover:bg-rose-600 transition-all duration-300 active:scale-90 shadow-lg shadow-slate-200">
              <ArrowRight size={18} />
           </div>
        </div>
      </div>
    </div>
  );
}
