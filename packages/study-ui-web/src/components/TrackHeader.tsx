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
  AlertCircle,
  Activity,
  ArrowUpRight,
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
          className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mastery Progress</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{Math.round(track.progressPercentage)}%</span>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{completedVideos} / {totalVideos} Lessons</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${track.progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-rose-600 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CheckCircle2 size={10} /> 
                  {track.progressPercentage === 100 ? "Course fully mastered" : "Continue your learning journey"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 w-full md:w-auto">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">Today's Focus Mode</h3>
              <div className="flex flex-col gap-2 min-w-[200px]">
                {energyLevels.map((cfg) => (
                  <button
                    key={cfg.level}
                    onClick={() => onEnergySelect(cfg.level)}
                    title={cfg.tooltip}
                    className={`flex items-center gap-3 p-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      currentEnergy === cfg.level ? `${cfg.color} scale-[1.02] shadow-lg` : 'bg-white text-slate-400 border border-slate-100 hover:border-rose-200'
                    }`}
                  >
                    <cfg.icon size={16} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-slate-50 relative z-10">
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
              icon={<Timer size={16} className="text-indigo-500" />}
              label="Study Effort"
              value={formatMins(studyTimeMins)}
            />
            <MetricItem 
              icon={<Clock size={16} className="text-emerald-500" />}
              label="Remaining"
              value={formatMins(track.remainingMinutes || 0)}
            />
          </div>
        </motion.div>

        {/* Card 2: Timeline & Analytics (The 'When will I finish' card) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-slate-900/40"
        >
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform text-white group-hover:opacity-[0.07]">
            <Target size={200} fill="currentColor" />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
                <Calendar size={20} className="text-rose-400" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Timeline Analysis</h3>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/[0.08] transition-colors">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Expected Completion</p>
                <p className="text-3xl font-black tracking-tighter">
                  {stats?.estCompletionDate ? new Date(stats.estCompletionDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'Calculating...'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className={`w-2 h-2 rounded-full ${isBehind ? 'bg-rose-500 animate-pulse' : isAhead ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                    {isBehind ? `${stats.daysDiff} days behind schedule` : isAhead ? `${stats.daysDiff} days ahead of goal` : 'On target'}
                  </span>
                </div>
              </div>

            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/[0.08] transition-colors group/target cursor-pointer" onClick={() => openModal('COMMIT')}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Initial Target</p>
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-400">
                    <Settings size={12} />
                    <span>Edit</span>
                  </div>
                </div>
                <p className="text-2xl font-black tracking-tighter">
                  {track.targetDate ? new Date(track.targetDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Set Target Date'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6">
            <button 
              onClick={onOptimize}
              className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 transition-all active:scale-95 shadow-xl shadow-rose-900/20 flex items-center justify-center gap-2 group"
            >
              <TrendingUp size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              Update Daily Plan
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <p className="text-lg font-black text-slate-900 tracking-tight">{value}</p>
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
