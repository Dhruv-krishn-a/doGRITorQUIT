"use client";

import React, { useMemo, useState } from 'react';
import { Clock, Trash2, ArrowRight, Sparkles, Calendar, Timer, Youtube, Briefcase, AlertTriangle, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Track, useStudy } from '@planner/study-core';
import { useStudyUI } from '../../context/StudyUIContext';

interface TrackCardProps {
  track: Track;
  onDelete?: (id: string) => void;
}

// Moved outside to prevent object recreation on every render
const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };

const THEME_CONFIG = {
  PROJECT: {
    wrapperHover: 'hover:border-emerald-100 hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)]',
    bgGradient: 'from-emerald-50/60 via-white to-teal-50/60',
    glow: 'bg-emerald-300/20',
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    titleHover: 'group-hover:text-emerald-950',
    statHover: 'group-hover:border-emerald-200',
    iconPrimary: 'text-emerald-500',
    progressBg: 'from-emerald-400 to-teal-400',
    progressShadow: 'group-hover:shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    footerHover: 'group-hover:border-emerald-300 group-hover:shadow-[0_8px_20px_rgba(16,185,129,0.2)]',
    footerGradient: 'from-emerald-500 to-teal-500',
    label1: 'Logged',
    label2: 'Remaining',
    Icon: Briefcase,
    Stat1Icon: Timer,
    Stat2Icon: Clock,
  },
  PLAYLIST: {
    wrapperHover: 'hover:border-rose-100 hover:shadow-[0_20px_40px_rgba(244,63,94,0.1)]',
    bgGradient: 'from-red-50/60 via-white to-rose-50/60',
    glow: 'bg-red-300/20',
    badgeBg: 'bg-red-50 text-red-600 border-red-200',
    titleHover: 'group-hover:text-rose-950',
    statHover: 'group-hover:border-red-200',
    iconPrimary: 'text-red-500',
    progressBg: 'from-red-500 to-rose-500',
    progressShadow: 'group-hover:shadow-[0_0_12px_rgba(244,63,94,0.6)]',
    footerHover: 'group-hover:border-red-300 group-hover:shadow-[0_8px_20px_rgba(244,63,94,0.2)]',
    footerGradient: 'from-red-500 to-rose-500',
    label1: 'Watched',
    label2: 'Total Time',
    Icon: Youtube,
    Stat1Icon: Timer,
    Stat2Icon: Youtube,
  },
  COURSE: {
    wrapperHover: 'hover:border-fuchsia-100 hover:shadow-[0_20px_40px_rgba(217,70,239,0.1)]',
    bgGradient: 'from-fuchsia-50/60 via-white to-purple-50/60',
    glow: 'bg-fuchsia-300/20',
    badgeBg: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
    titleHover: 'group-hover:text-fuchsia-950',
    statHover: 'group-hover:border-fuchsia-200',
    iconPrimary: 'text-fuchsia-500',
    progressBg: 'from-fuchsia-400 to-purple-500',
    progressShadow: 'group-hover:shadow-[0_0_12px_rgba(217,70,239,0.6)]',
    footerHover: 'group-hover:border-fuchsia-300 group-hover:shadow-[0_8px_20px_rgba(217,70,239,0.2)]',
    footerGradient: 'from-fuchsia-500 to-purple-500',
    label1: 'Effort',
    label2: 'Runtime',
    Icon: Youtube,
    Stat1Icon: Timer,
    Stat2Icon: Clock,
  }
};

export function TrackCard({ track, onDelete }: TrackCardProps) {
  const { navigate } = useStudyUI();
  const { openModal, fetchTrack } = useStudy();
  const [isDeleting, setIsDeleting] = useState(false);

  const isProject = track.type === 'PROJECT';
  const isYouTube = track.type === 'PLAYLIST';
  
  // Safely fallback to COURSE theme if an unknown track type is passed
  const theme = THEME_CONFIG[track.type as keyof typeof THEME_CONFIG] || THEME_CONFIG.COURSE;

  const studyTimeMins = useMemo(() => {
    return track.units?.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0) || 0;
  }, [track.units]);

  const totalDuration = track.totalDurationMinutes || track.totalTimeMinutes || 0;
  const remainingMins = track.remainingMinutes || Math.max(0, totalDuration - studyTimeMins);
  
  const isAtRisk = track.targetDate && new Date(track.targetDate) < new Date() && track.progressPercentage < 100;
  
  const activePhase = isProject ? (track.units?.find(u => u.status === 'IN_PROGRESS')?.title || 'Planning') : null;
  const nextMilestone = isProject ? (track.units?.find(u => u.status === 'BACKLOG' || u.status === 'THIS_WEEK')?.title || 'Completion') : null;

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const getNavigateUrl = () => {
    if (track.type === 'PROJECT') return `/dashboard/study/project/${track.id}`;
    if (track.type === 'PLAYLIST') return `/dashboard/study/youtube/${track.id}`;
    if (track.type === 'COURSE') return `/dashboard/study/course/${track.id}`;
    return `/dashboard/study/${track.id}`;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await fetchTrack(track.id);
      if (onDelete) {
        onDelete(track.id);
      } else {
        openModal('DELETE');
      }
    } catch (error) {
      console.error("Failed to prepare track deletion:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      transition={springConfig}
      onClick={() => navigate(getNavigateUrl())}
      className={`bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-5 sm:p-6 lg:p-8 transition-all h-full flex flex-col group relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer transform-gpu antialiased ${theme.wrapperHover}`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${theme.bgGradient} bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10`} />
      <div className={`absolute top-0 right-0 w-40 h-40 ${theme.glow} rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
      
      <button 
        onClick={handleDelete} 
        disabled={isDeleting}
        title="Delete Track"
        // UI Fix: Changed from rounded-[1.25rem] to rounded-full for a perfect circle
        className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 bg-white shadow-sm border border-slate-100 hover:border-red-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-105 active:scale-95 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Trash2 size={16} strokeWidth={2.5} className={isDeleting ? 'animate-pulse' : ''} />
      </button>
      
      <div className="transform-gpu flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5 relative z-10 pr-8">
        {/* UI Fix: Changed from rounded-lg to rounded-full for pill shape */}
        <span className={`text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border shadow-sm flex items-center gap-1.5 ${theme.badgeBg}`}>
          <theme.Icon size={10} /> {track.type.toLowerCase()}
        </span>
        
        {isProject && isAtRisk && (
          <span className="transform-gpu text-[8px] font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-full uppercase tracking-widest border border-red-200 shadow-sm flex items-center gap-1.5 animate-pulse">
            <AlertTriangle size={10} /> At Risk
          </span>
        )}

        {!isProject && track.targetDate && (
          <div className="transform-gpu flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <Calendar size={10} className="transform-gpu text-slate-400"/> 
            <span className="transform-gpu text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              Sync: {new Date(track.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>
      
      <h3 className={`text-lg sm:text-xl font-bold text-slate-900 mb-5 sm:mb-6 leading-tight line-clamp-2 relative z-10 tracking-tighter uppercase transition-colors ${theme.titleHover}`}>
        {track.title}
      </h3>

      {isProject && (
        <div className="transform-gpu flex items-center justify-between mb-5 sm:mb-6 relative z-10 group-hover:-translate-y-1 transition-transform duration-500 gap-2">
          <div className="transform-gpu flex flex-col min-w-0 flex-1">
            <span className="transform-gpu text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <Zap size={10} className="transform-gpu text-emerald-500 shrink-0" /> Phase
            </span>
            <span className="transform-gpu text-xs sm:text-sm font-bold text-slate-700 truncate">{activePhase}</span>
          </div>
          <div className="transform-gpu w-px h-8 bg-slate-200 shrink-0" />
          <div className="transform-gpu flex flex-col text-right min-w-0 flex-1">
            <span className="transform-gpu text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1 mb-1">
              <Target size={10} className="transform-gpu text-teal-500 shrink-0" /> Milestone
            </span>
            <span className="transform-gpu text-xs sm:text-sm font-bold text-slate-700 truncate">{nextMilestone}</span>
          </div>
        </div>
      )}
      
      <div className="transform-gpu grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 relative z-10 group-hover:-translate-y-1 transition-transform duration-500 delay-75">
        {/* UI Fix: Smoothed corners using rounded-3xl inside the main rounded-[2.5rem] card */}
        <div className={`bg-white/80 p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-sm transition-colors duration-300 min-w-0 ${theme.statHover}`}>
          <div className="transform-gpu flex items-center gap-1.5 sm:gap-2 text-slate-400 mb-1">
            <theme.Stat1Icon size={12} className={`${theme.iconPrimary} shrink-0`} />
            <span className="transform-gpu text-[7px] sm:text-[8px] font-bold uppercase tracking-widest truncate">{theme.label1}</span>
          </div>
          <p className="transform-gpu text-base sm:text-xl font-bold text-slate-800 tracking-tighter truncate">{formatMins(studyTimeMins)}</p>
        </div>
        <div className={`bg-white/80 p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-sm transition-colors duration-300 min-w-0 ${theme.statHover}`}>
          <div className="transform-gpu flex items-center gap-1.5 sm:gap-2 text-slate-400 mb-1">
            <theme.Stat2Icon size={12} className={`${theme.iconPrimary} shrink-0`} />
            <span className="transform-gpu text-[7px] sm:text-[8px] font-bold uppercase tracking-widest truncate">{theme.label2}</span>
          </div>
          <p className="transform-gpu text-base sm:text-xl font-bold text-slate-800 tracking-tighter truncate">
            {formatMins(isProject ? remainingMins : totalDuration)}
          </p>
        </div>
      </div>

      <div className="transform-gpu mt-auto space-y-5 sm:space-y-6 relative z-10">
        <div className="transform-gpu space-y-2.5 sm:space-y-3 group-hover:-translate-y-1 transition-transform duration-500 delay-150">
          <div className="transform-gpu flex justify-between items-end">
            <div className="transform-gpu flex items-center gap-1.5 text-slate-500">
              <Sparkles size={12} className={theme.iconPrimary} />
              <span className="transform-gpu text-[7px] sm:text-[8px] font-bold uppercase tracking-widest">
                {isProject ? 'Completion' : isYouTube ? 'Progress' : 'Optimization'}
              </span>
            </div>
            <div className="transform-gpu flex items-baseline gap-0.5">
              <span className="transform-gpu text-lg sm:text-xl font-bold text-slate-800 tracking-tighter leading-none">{Math.round(track.progressPercentage)}</span>
              <span className="transform-gpu text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">%</span>
            </div>
          </div>
          <div className="transform-gpu h-2 bg-white rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${track.progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${theme.progressBg} rounded-full relative transition-shadow duration-500 ${theme.progressShadow}`}
            />
          </div>
        </div>

        {/* Bottom vector bar */}
        <div className={`relative w-full bg-slate-50/50 rounded-full border border-slate-200 flex items-center p-1 sm:p-1.5 overflow-hidden transition-all duration-300 group-hover:bg-rose-50 group-hover:border-rose-200`}>
          <span className="transform-gpu relative z-10 pl-3 sm:pl-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-rose-600 transition-colors duration-300">
            Access Vector
          </span>
          <div className="transform-gpu relative z-10 ml-auto w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all duration-300">
             <ArrowRight size={14} className="transform-gpu group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}