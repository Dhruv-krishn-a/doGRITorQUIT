// packages/study-ui-web/src/components/today/VitalityBar.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

interface VitalityBarProps {
  stats: {
    totalPlannedMinutes: number;
    completedMinutes: number;
    loadState: 'OPTIMAL' | 'HEAVY' | 'OVERLOADED';
    focusSessionsPlanned: number;
    executionScore: number;
  };
  energyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  onEnergyChange: (level: 'LOW' | 'MEDIUM' | 'HIGH') => void;
}

export function VitalityBar({ stats, energyLevel, onEnergyChange }: VitalityBarProps) {
  const getStatusColor = (state: string) => {
    switch (state) {
      case 'OPTIMAL': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'HEAVY': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'OVERLOADED': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'IMPOSSIBLE': return 'text-white bg-slate-900 border-slate-800 shadow-lg';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getStatusDot = (state: string) => {
    switch (state) {
      case 'OPTIMAL': return '🟢';
      case 'HEAVY': return '🟡';
      case 'OVERLOADED': return '🔴';
      case 'IMPOSSIBLE': return '💀';
      default: return '⚪';
    }
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const energyOptions = [
    { id: 'LOW', label: 'Low', icon: '🔋' },
    { id: 'MEDIUM', label: 'Mid', icon: '⚡' },
    { id: 'HIGH', label: 'Peak', icon: '🔥' }
  ];

  return (
    <div className="w-full bg-white/90 backdrop-blur-2xl rounded-[3rem] p-6 md:p-8 lg:p-10 border border-rose-100/50 shadow-[0_20px_80px_rgba(244,63,94,0.08)] mb-10 relative overflow-hidden">
      {/* Background Accent Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-100/20 to-pink-50/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 items-stretch lg:items-center">
        
        {/* Vital Stats Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-4 flex-1">
          
          {/* Cognitive Load */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Activity size={12} className="text-rose-500 shrink-0" />
              <span className="truncate">Cognitive Load</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">{formatTime(stats.totalPlannedMinutes)}</span>
              <div className={`mt-1 px-2.5 py-0.5 rounded-full border text-[8px] md:text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 w-fit shadow-sm ${getStatusColor(stats.loadState)}`}>
                <span className="animate-pulse shrink-0">{getStatusDot(stats.loadState)}</span>
                <span className="truncate">{stats.loadState}</span>
              </div>
            </div>
          </div>

          {/* Planned Sessions */}
          <div className="flex flex-col gap-1.5 min-w-0 border-l border-slate-100 pl-4 md:pl-6 lg:pl-8">
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Zap size={12} className="text-amber-500 shrink-0" />
              <span className="truncate">Planned Sessions</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">{stats.focusSessionsPlanned}</span>
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Vectors</span>
            </div>
          </div>

          {/* Execution Score */}
          <div className="flex flex-col gap-1.5 min-w-0 border-l border-slate-100 pl-4 md:pl-6 lg:pl-8">
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <TrendingUp size={12} className="text-indigo-500 shrink-0" />
              <span className="truncate">Execution Score</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">{stats.executionScore}</span>
                <span className="text-xs font-bold text-slate-300">/100</span>
              </div>
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Momentum</span>
            </div>
          </div>

          {/* Remaining Time */}
          <div className="flex flex-col gap-1.5 min-w-0 border-l border-slate-100 pl-4 md:pl-6 lg:pl-8">
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Clock size={12} className="text-emerald-500 shrink-0" />
              <span className="truncate">Time Remaining</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">{formatTime(Math.max(0, stats.totalPlannedMinutes - stats.completedMinutes))}</span>
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">To goal</span>
            </div>
          </div>
        </div>

        {/* Energy Toggle Panel */}
        <div className="shrink-0 p-1.5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-1 shadow-inner h-fit lg:mt-0 mt-4 self-center lg:self-center">
          {energyOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => onEnergyChange(opt.id as any)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${energyLevel === opt.id ? 'bg-white text-rose-600 shadow-lg shadow-rose-100 border border-rose-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="text-sm md:text-base leading-none">{opt.icon}</span>
              <span className="hidden sm:inline">{opt.label}</span>
              <span className="sm:hidden">{opt.label.substring(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Neural Load Progress Bar */}
      <div className="mt-8 relative h-2 bg-slate-100 rounded-full overflow-hidden">
         <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (stats.completedMinutes / (stats.totalPlannedMinutes || 1)) * 100)}%` }}
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]"
         />
      </div>
      <div className="mt-3 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
         <span>Sync Starting</span>
         <span className="text-rose-500">{Math.round((stats.completedMinutes / (stats.totalPlannedMinutes || 1)) * 100)}% Synchronized</span>
         <span>Objective Reached</span>
      </div>
    </div>
  );
}
