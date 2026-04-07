import React from 'react';
import { motion } from 'framer-motion';
import { TodayStats } from '../types';
import { Zap, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GritRadarProps {
  stats: TodayStats;
  focusMode: boolean;
  onToggleFocus: () => void;
}

export const GritRadar: React.FC<GritRadarProps> = ({ stats, focusMode, onToggleFocus }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.momentum / 100) * circumference;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center bg-[var(--bg-card)]/30 p-10 rounded-[3rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-1000",
        focusMode ? "bg-[var(--accent-color)]/5 opacity-100" : "opacity-0"
      )} />

      {/* 1. Momentum Radar */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-[var(--bg-secondary)]"
          />
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className="text-[var(--accent-color)] shadow-lg"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-[var(--text-primary)] italic leading-none">{stats.momentum}%</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1">Grit Score</span>
        </div>
      </div>

      {/* 2. Strategy Metrics */}
      <div className="flex-1 flex flex-col gap-6 w-full lg:w-auto">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px] p-5 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-[var(--text-secondary)]">
              <Clock size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Finish Line</span>
            </div>
            <div className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">
              {stats.momentum === 100 ? "MISSION COMPLETE" : stats.estimatedFinishTime}
            </div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 uppercase">Estimated Departure</p>
          </div>

          <div className="flex-1 min-w-[140px] p-5 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-[var(--text-secondary)]">
              <Zap size={14} className="text-amber" />
              <span className="text-[10px] font-black uppercase tracking-widest">Efficiency</span>
            </div>
            <div className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">
              {stats.completedCount} <span className="text-[var(--bg-secondary)]">/</span> {stats.totalCount}
            </div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 uppercase">Vectors Executed</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[var(--bg-primary)] p-4 rounded-[2rem] border border-[var(--border-color)] shadow-2xl">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            focusMode ? "bg-amber text-[var(--bg-primary)] shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]"
          )}>
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5 text-[var(--text-secondary)]">Focus Lockdown</h4>
            <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">{focusMode ? "Active: Noise Cancelled" : "Standby: Normal Mode"}</p>
          </div>
          <button 
            onClick={onToggleFocus}
            className={cn(
              "w-16 h-8 rounded-full relative transition-colors duration-500",
              focusMode ? "bg-amber" : "bg-[var(--bg-secondary)] border border-[var(--border-color)]"
            )}
          >
            <motion.div 
              animate={{ x: focusMode ? 34 : 4 }}
              className={cn(
                "absolute top-1 left-0 w-6 h-6 rounded-full shadow-md",
                focusMode ? "bg-[var(--bg-primary)]" : "bg-[var(--text-secondary)]"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
