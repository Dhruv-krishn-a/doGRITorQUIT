"use client";

import React, { useMemo } from 'react';
import { 
  Clock, 
  Zap, 
  Target, 
  TrendingUp, 
  Youtube, 
  Timer, 
  Sparkles, 
  CheckCircle2,
  Activity,
  Settings,
  ArrowRight
} from 'lucide-react';
import { Track, EnergyLevel, useStudy } from '@gritorquit/study-core';
import { motion } from 'framer-motion';

interface TrackHeaderProps {
  track: Track & { units: any[] };
  stats: any;
  currentEnergy: EnergyLevel;
  onEnergySelect: (level: EnergyLevel) => void;
  onOptimize?: () => void;
}

export function TrackHeader({ track, stats, currentEnergy, onEnergySelect, onOptimize }: TrackHeaderProps) {
  const { openModal } = useStudy();

  const energyLevels: { level: EnergyLevel; label: string; activeClass: string; tooltip: string; icon: any }[] = [
    { level: 'HIGH', label: 'Intense', activeClass: 'bg-rose-500 text-white shadow-sm', tooltip: "1.5x study load", icon: Zap },
    { level: 'MEDIUM', label: 'Normal', activeClass: 'bg-rose-400 text-white shadow-sm', tooltip: "Standard pace", icon: Activity },
    { level: 'LOW', label: 'Light', activeClass: 'bg-amber-400 text-white shadow-sm', tooltip: "0.6x study load", icon: Clock }
  ];

  const totalVideos = track.units?.length || 0;
  const completedVideos = track.units?.filter(u => u.status === 'DONE' || u.status === 'COMPLETED').length || 0;
  
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

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const isBehind = stats?.status === 'BEHIND';
  const isAhead = stats?.status === 'AHEAD';
  const hasStarted = watchTimeMins > 0 || completedVideos > 0;

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden antialiased font-sans">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Card 1: Progress & Energy --- */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
            <div className="space-y-6 flex-1 w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Course Progress</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-slate-800 tracking-tight">{Math.round(track.progressPercentage)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{completedVideos} / {totalVideos} Lessons</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${track.progressPercentage}%` }}
                    className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out"
                  />
                </div>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {track.progressPercentage === 100 ? "Completed" : "In Progress"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 w-full md:w-auto">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-1 text-center md:text-left">Study Intensity</h3>
              <div className="flex flex-col gap-2 min-w-[200px]">
                {energyLevels.map((cfg) => {
                  const isActive = currentEnergy === cfg.level;
                  return (
                    <button
                      key={cfg.level}
                      onClick={() => onEnergySelect(cfg.level)}
                      title={cfg.tooltip}
                      className={`flex items-center gap-3 p-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                        isActive 
                          ? cfg.activeClass
                          : 'bg-white text-slate-500 border border-slate-200 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      <cfg.icon size={14} />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
              <button 
                onClick={onOptimize}
                className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp size={14} />
                Plan Today's Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-100 relative z-10">
            <MetricItem 
              icon={<Youtube size={14} className="text-rose-500" />}
              label="Course Duration"
              value={formatMins(track.totalDurationMinutes)}
            />
            <MetricItem 
              icon={<PlayCircleIcon size={14} className="text-emerald-500" />}
              label="Actual Watched"
              value={formatMins(watchTimeMins)}
            />
            <MetricItem 
              icon={<Timer size={14} className="text-fuchsia-500" />}
              label="Study Effort"
              value={formatMins(studyTimeMins)}
            />
            <MetricItem 
              icon={<Clock size={14} className="text-amber-500" />}
              label="Remaining"
              value={formatMins(track.remainingMinutes || 0)}
            />
          </div>
        </div>

        {/* --- Card 2: Timeline & Analytics --- */}
        <div className="bg-white rounded-3xl p-6 flex flex-col justify-between border border-slate-100 shadow-sm relative">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                 <Target size={14} />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Timeline Analysis</h3>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Finish</p>
                {hasStarted ? (
                  <>
                    <p className="text-2xl font-bold tracking-tight text-slate-800">
                      {stats?.estCompletionDate ? new Date(stats.estCompletionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className={`px-2 py-1 rounded border flex items-center gap-1.5 ${
                        isBehind ? 'bg-rose-50 border-rose-200 text-rose-600' : 
                        isAhead ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                        'bg-indigo-50 border-indigo-200 text-indigo-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isBehind ? 'bg-rose-500' : isAhead ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">
                          {isBehind ? `${stats.daysDiff}D BEHIND` : isAhead ? `${stats.daysDiff}D AHEAD` : 'ON TARGET'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-medium text-slate-500 mt-2">
                    No session data to calculate expected time. Start studying!
                  </p>
                )}
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Finish Date</p>
                <p className="text-xl font-bold tracking-tight text-slate-800 mb-1">
                  {track.targetDate ? new Date(track.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Set'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-auto">
            <button 
              onClick={() => openModal('COMMIT')}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Settings size={14} />
              {track.targetDate ? 'Recalibrate Plan' : 'Calibrate Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-800 tracking-tight">{value}</p>
    </div>
  );
}

function PlayCircleIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  );
}