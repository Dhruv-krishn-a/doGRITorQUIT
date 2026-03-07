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

  // Premium Theme mapping for energy levels
  const energyLevels: { level: EnergyLevel; label: string; activeClass: string; tooltip: string; icon: any }[] = [
    { level: 'HIGH', label: 'Hyper-Focus', activeClass: 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-md shadow-fuchsia-200', tooltip: "1.5x study load", icon: Zap },
    { level: 'MEDIUM', label: 'Flow State', activeClass: 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-200', tooltip: "Standard pace", icon: Activity },
    { level: 'LOW', label: 'Maintenance', activeClass: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md shadow-amber-200', tooltip: "0.6x study load", icon: Clock }
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

  // Animation configuration
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: springConfig }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 w-full max-w-full overflow-hidden transform-gpu antialiased font-sans"
    >
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Card 1: Progress & Energy --- */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500"
        >
          {/* Moving Hover Gradient Injection */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />
          
          {/* Subtle Corner Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-300/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-100" />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
            <div className="space-y-8 flex-1 w-full">
              <div className="flex items-center gap-5">
                <motion.div 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl shadow-lg shadow-rose-200"
                >
                  <Sparkles size={24} />
                </motion.div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Neural Progress</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter">{Math.round(track.progressPercentage)}%</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completedVideos} / {totalVideos} Lessons</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-2 w-full bg-white rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${track.progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full relative shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {track.progressPercentage === 100 ? "Optimization Complete" : "Cognitive Upload in Progress"}
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-6 rounded-[2rem] border border-slate-100 shadow-sm w-full md:w-auto">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-5 px-2 text-center md:text-left">Focus Protocol</h3>
              <div className="flex flex-col gap-3 min-w-[220px]">
                {energyLevels.map((cfg) => {
                  const isActive = currentEnergy === cfg.level;
                  return (
                    <motion.button
                      whileHover={{ scale: isActive ? 1.02 : 1.01, x: isActive ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                      key={cfg.level}
                      onClick={() => onEnergySelect(cfg.level)}
                      title={cfg.tooltip}
                      className={`flex items-center gap-3.5 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                        isActive 
                          ? cfg.activeClass
                          : 'bg-white text-slate-500 border border-slate-200 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/50 shadow-sm'
                      }`}
                    >
                      <cfg.icon size={16} className={isActive ? 'animate-pulse' : ''} />
                      {cfg.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-slate-200/60 relative z-10">
            <MetricItem 
              icon={<Youtube size={16} className="text-rose-500 drop-shadow-sm" />}
              label="Course Duration"
              value={formatMins(track.totalDurationMinutes)}
            />
            <MetricItem 
              icon={<PlayCircleIcon size={16} className="text-emerald-500 drop-shadow-sm" />}
              label="Actual Watched"
              value={formatMins(watchTimeMins)}
            />
            <MetricItem 
              icon={<Timer size={16} className="text-fuchsia-500 drop-shadow-sm" />}
              label="Study Effort"
              value={formatMins(studyTimeMins)}
            />
            <MetricItem 
              icon={<Clock size={16} className="text-amber-500 drop-shadow-sm" />}
              label="Remaining"
              value={formatMins(track.remainingMinutes || 0)}
            />
          </div>
        </motion.div>

        {/* --- Card 2: Timeline & Analytics --- */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500"
        >
          {/* Moving Hover Gradient */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-rose-50/50 via-white to-fuchsia-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />

          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000 text-rose-500 group-hover:opacity-[0.05] pointer-events-none">
            <Target size={200} fill="currentColor" />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg border border-rose-100 shadow-sm">
                 <Target size={14} className="text-rose-500" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Timeline Analysis</h3>
            </div>

            <div className="space-y-5">
              <div className="p-6 bg-white/80 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-300">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Expected Finish</p>
                <p className="text-3xl font-black tracking-tighter uppercase text-slate-800">
                  {stats?.estCompletionDate ? new Date(stats.estCompletionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '---'}
                  <span className="text-[10px] text-slate-400 ml-2 font-black tracking-widest">{stats?.estCompletionDate ? new Date(stats.estCompletionDate).getFullYear() : ''}</span>
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className={`px-2 py-1 rounded-md border flex items-center gap-1.5 shadow-sm ${
                    isBehind ? 'bg-rose-50 border-rose-200 text-rose-600' : 
                    isAhead ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                    'bg-indigo-50 border-indigo-200 text-indigo-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isBehind ? 'bg-rose-500 animate-pulse' : isAhead ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {isBehind ? `${stats.daysDiff}D BEHIND` : isAhead ? `${stats.daysDiff}D AHEAD` : 'ON TARGET'}
                    </span>
                  </div>
                </div>
              </div>

            <div 
              className="p-6 bg-white/80 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-300 group/target cursor-pointer relative overflow-hidden" 
              onClick={() => openModal('COMMIT')}
            >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Initial Target</p>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest opacity-0 group-hover/target:opacity-100 transition-opacity translate-x-2 group-hover/target:translate-x-0 duration-300">
                    <Settings size={12} className="animate-spin-slow" />
                    <span>Re-Sync</span>
                  </div>
                </div>
                <p className="text-2xl font-black tracking-tighter uppercase text-slate-800">
                  {track.targetDate ? new Date(track.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'SET TARGET DATE'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOptimize}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-3 group/opt relative overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover/opt:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
              <TrendingUp size={16} className="group-hover/opt:-translate-y-0.5 group-hover/opt:translate-x-0.5 transition-transform" />
              <span className="pt-0.5 relative z-10">Update Neural Plan</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-2 group/metric cursor-default">
      <div className="flex items-center gap-2">
        <div className="group-hover/metric:scale-110 group-hover/metric:rotate-12 transition-transform duration-300">
          {icon}
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none group-hover/metric:text-slate-600 transition-colors">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{value}</p>
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