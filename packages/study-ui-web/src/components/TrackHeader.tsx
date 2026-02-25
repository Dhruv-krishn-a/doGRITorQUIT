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
  Calendar,
  CheckCircle2,
  Activity,
  Settings
} from 'lucide-react';
import { Track, EnergyLevel, useStudy } from '@planner/study-core';
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

  const energyLevels: { level: EnergyLevel; label: string; color: string; tooltip: string; icon: any }[] = [
    { level: 'HIGH', label: 'Hyper-Focus', color: 'bg-rose-600 text-white shadow-rose-200', tooltip: "1.5x study load", icon: Zap },
    { level: 'MEDIUM', label: 'Flow State', color: 'bg-rose-100 text-rose-700', tooltip: "Standard pace", icon: Activity },
    { level: 'LOW', label: 'Maintenance', color: 'bg-slate-100 text-slate-600', tooltip: "0.6x study load", icon: Clock }
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

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Progress & Energy (The 'Where am I' card) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-[#13091a] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl shadow-black flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-900/20">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/50">Neural Progress</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-white tracking-tighter">{Math.round(track.progressPercentage)}%</span>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{completedVideos} / {totalVideos} Lessons</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${track.progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-rose-600 rounded-full relative shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                  {track.progressPercentage === 100 ? "Optimization Complete" : "Cognitive Upload in Progress"}
                </p>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 w-full md:w-auto backdrop-blur-xl">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-5 px-2">Focus Protocol</h3>
              <div className="flex flex-col gap-3 min-w-[220px]">
                {energyLevels.map((cfg) => (
                  <button
                    key={cfg.level}
                    onClick={() => onEnergySelect(cfg.level)}
                    title={cfg.tooltip}
                    className={`flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      currentEnergy === cfg.level 
                        ? 'bg-rose-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.3)] scale-[1.02]' 
                        : 'bg-white/5 text-white/30 border border-white/5 hover:border-rose-500/30 hover:text-white'
                    }`}
                  >
                    <cfg.icon size={16} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-10 border-t border-white/5 relative z-10">
            <MetricItem 
              icon={<Youtube size={16} className="text-rose-500" />}
              label="Course Duration"
              value={formatMins(track.totalDurationMinutes)}
            />
            <MetricItem 
              icon={<PlayCircleIcon size={16} className="text-rose-500" />}
              label="Actual Watched"
              value={formatMins(watchTimeMins)}
            />
            <MetricItem 
              icon={<Timer size={16} className="text-fuchsia-500" />}
              label="Study Effort"
              value={formatMins(studyTimeMins)}
            />
            <MetricItem 
              icon={<Clock size={16} className="text-rose-500" />}
              label="Remaining"
              value={formatMins(track.remainingMinutes || 0)}
            />
          </div>
        </motion.div>

        {/* Card 2: Timeline & Analytics (The 'When will I finish' card) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#13091a] rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group border border-white/5 shadow-2xl shadow-black"
        >
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform text-white group-hover:opacity-[0.05]">
            <Target size={200} fill="currentColor" />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Timeline Analysis</h3>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/[0.08] transition-colors">
                <p className="text-[9px] font-black text-rose-500/50 uppercase tracking-[0.3em] mb-2">Expected Finish</p>
                <p className="text-4xl font-black tracking-tighter uppercase">
                  {stats?.estCompletionDate ? new Date(stats.estCompletionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '---'}
                  <span className="text-xs text-white/20 ml-2 font-black tracking-widest">{stats?.estCompletionDate ? new Date(stats.estCompletionDate).getFullYear() : ''}</span>
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${isBehind ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]' : isAhead ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    {isBehind ? `${stats.daysDiff}D BEHIND_SCHEDULE` : isAhead ? `${stats.daysDiff}D AHEAD_OF_GOAL` : 'ON_TARGET'}
                  </span>
                </div>
              </div>

            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/[0.08] transition-colors group/target cursor-pointer" onClick={() => openModal('COMMIT')}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Initial Target</p>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest opacity-0 group-hover/target:opacity-100 transition-opacity">
                    <Settings size={10} />
                    <span>Re-Sync</span>
                  </div>
                </div>
                <p className="text-2xl font-black tracking-tighter uppercase text-white/80">
                  {track.targetDate ? new Date(track.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'SET_TARGET_DATE'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8">
            <button 
              onClick={onOptimize}
              className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500 transition-all active:scale-95 shadow-xl shadow-rose-900/20 flex items-center justify-center gap-3 group"
            >
              <TrendingUp size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              Update Neural Plan
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] leading-none">{label}</span>
      </div>
      <p className="text-xl font-black text-white tracking-tighter uppercase">{value}</p>
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
