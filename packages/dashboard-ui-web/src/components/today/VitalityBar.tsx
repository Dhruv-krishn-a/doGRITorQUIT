// packages/dashboard-ui-web/src/components/today/VitalityBar.tsx
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
      case 'OVERLOADED': return 'text-[var(--accent-color)] bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20';
      case 'IMPOSSIBLE': return 'text-[var(--bg-primary)] bg-[var(--text-primary)] border-[var(--text-primary)] shadow-lg';
      default: return 'text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-[var(--border-color)]';
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
    <div className="transform-gpu w-full bg-[var(--bg-card)]/90 backdrop-blur-2xl rounded-[3rem] p-6 md:p-8 lg:p-10 border border-[var(--border-color)]/50 shadow-[0_20px_80px_var(--accent-color)]/10 mb-10 relative overflow-hidden">
      {/* Background Accent Decorative */}
      <div className="transform-gpu absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--accent-color)]/10 to-[var(--accent-color)]/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
      
      <div className="transform-gpu flex flex-col xl:flex-row gap-8 xl:gap-6 items-stretch xl:items-center">
        
        {/* Vital Stats Grid */}
        <div className="transform-gpu w-full grid grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-4 flex-1">
          
          {/* Cognitive Load */}
          <div className="transform-gpu flex flex-col gap-1.5 min-w-0">
            <div className="transform-gpu flex items-center gap-2 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <Activity size={12} className="transform-gpu text-[var(--accent-color)] shrink-0" />
              <span className="transform-gpu truncate">Cognitive Load</span>
            </div>
            <div className="transform-gpu flex flex-col">
              <span className="transform-gpu text-xl md:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] leading-tight">{formatTime(stats.totalPlannedMinutes)}</span>
              <div className={`mt-1 px-2.5 py-0.5 rounded-full border text-[8px] md:text-[9px] font-semibold uppercase tracking-tighter flex items-center gap-1.5 w-fit shadow-sm ${getStatusColor(stats.loadState)}`}>
                <span className="transform-gpu animate-pulse shrink-0">{getStatusDot(stats.loadState)}</span>
                <span className="transform-gpu truncate">{stats.loadState}</span>
              </div>
            </div>
          </div>

          {/* Planned Sessions */}
          <div className="transform-gpu flex flex-col gap-1.5 min-w-0 border-l border-[var(--border-color)] pl-4 xl:pl-8">
            <div className="transform-gpu flex items-center gap-2 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <Zap size={12} className="transform-gpu text-amber-500 shrink-0" />
              <span className="transform-gpu truncate">Planned Sessions</span>
            </div>
            <div className="transform-gpu flex flex-col">
              <span className="transform-gpu text-xl md:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] leading-tight">{stats.focusSessionsPlanned}</span>
              <span className="transform-gpu text-[8px] md:text-[10px] font-semibold text-[var(--text-secondary)] mt-0.5 uppercase tracking-widest">Vectors</span>
            </div>
          </div>

          {/* Execution Score */}
          <div className="transform-gpu flex flex-col gap-1.5 min-w-0 xl:border-l xl:border-[var(--border-color)] xl:pl-8">
            <div className="transform-gpu flex items-center gap-2 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <TrendingUp size={12} className="transform-gpu text-indigo-500 shrink-0" />
              <span className="transform-gpu truncate">Execution Score</span>
            </div>
            <div className="transform-gpu flex flex-col">
              <div className="transform-gpu flex items-baseline gap-0.5">
                <span className="transform-gpu text-xl md:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] leading-tight">{stats.executionScore}</span>
                <span className="transform-gpu text-xs font-semibold text-[var(--text-secondary)]/60">/100</span>
              </div>
              <span className="transform-gpu text-[8px] md:text-[10px] font-semibold text-[var(--text-secondary)] mt-0.5 uppercase tracking-widest">Momentum</span>
            </div>
          </div>

          {/* Remaining Time */}
          <div className="transform-gpu flex flex-col gap-1.5 min-w-0 border-l border-[var(--border-color)] pl-4 xl:pl-8">
            <div className="transform-gpu flex items-center gap-2 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <Clock size={12} className="transform-gpu text-emerald-500 shrink-0" />
              <span className="transform-gpu truncate">Time Remaining</span>
            </div>
            <div className="transform-gpu flex flex-col">
              <span className="transform-gpu text-xl md:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] leading-tight">{formatTime(Math.max(0, stats.totalPlannedMinutes - stats.completedMinutes))}</span>
              <span className="transform-gpu text-[8px] md:text-[10px] font-semibold text-[var(--text-secondary)] mt-0.5 uppercase tracking-widest">To goal</span>
            </div>
          </div>
        </div>

        {/* Energy Toggle Panel */}
        <div className="transform-gpu shrink-0 p-1.5 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] flex items-center gap-1 shadow-inner h-fit lg:mt-0 mt-4 self-center lg:self-center">
          {energyOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => onEnergyChange(opt.id as any)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl text-[9px] md:text-[10px] font-semibold uppercase tracking-widest transition-all duration-500 ${energyLevel === opt.id ? 'bg-[var(--bg-card)] text-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20 border border-[var(--accent-color)]/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              <span className="transform-gpu text-sm md:text-base leading-none">{opt.icon}</span>
              <span className="transform-gpu hidden sm:inline">{opt.label}</span>
              <span className="transform-gpu sm:hidden">{opt.label.substring(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Neural Load Progress Bar */}
      <div className="transform-gpu mt-8 relative h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
         <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (stats.completedMinutes / (stats.totalPlannedMinutes || 1)) * 100)}%` }}
            className="transform-gpu h-full bg-[var(--accent-color)] rounded-full shadow-[0_0_15px_var(--accent-color)]/40 transform-gpu"
         />
      </div>
      <div className="transform-gpu mt-3 flex justify-between items-center text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
         <span>Sync Starting</span>
         <span className="transform-gpu text-[var(--accent-color)] font-bold">{Math.round((stats.completedMinutes / (stats.totalPlannedMinutes || 1)) * 100)}% Synchronized</span>
         <span className="transform-gpu font-bold">Objective Reached</span>
      </div>
    </div>
  );
}
