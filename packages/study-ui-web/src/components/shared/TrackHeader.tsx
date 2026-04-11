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
    { level: 'HIGH', label: 'Hyper-Focus', activeClass: 'bg-rose-500 text-white shadow-xl shadow-rose-500/20', tooltip: "Intense session", icon: Zap },
    { level: 'MEDIUM', label: 'Flow State', activeClass: 'bg-sky-500 text-white shadow-xl shadow-sky-500/20', tooltip: "Standard pace", icon: Activity },
    { level: 'LOW', label: 'Maintenance', activeClass: 'bg-[var(--text-secondary)] text-[var(--bg-primary)] shadow-xl shadow-black/10', tooltip: "Light session", icon: Clock }
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

  const formatDate = (dateInput: string | number | Date | undefined | null) => {
    if (!dateInput) return '---';
    try {
      const d = new Date(dateInput);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    } catch (e) {
      return '---';
    }
  };

  const isBehind = stats?.status === 'BEHIND';
  const isAhead = stats?.status === 'AHEAD';
  const hasStarted = watchTimeMins > 0 || completedVideos > 0;

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden antialiased font-sans text-left">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Card 1: Progress & Energy --- */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-[3rem] p-8 border border-[var(--border-color)] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
            <div className="space-y-8 flex-1 w-full">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-2xl border border-[var(--accent-color)]/20 shadow-sm">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40">System Progress</h3>
                  <div className="flex items-baseline gap-4 mt-1">
                    <span className="text-5xl font-black text-[var(--text-primary)] italic tracking-tighter">{Math.round(track.progressPercentage)}%</span>
                    <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic opacity-60">{completedVideos} / {totalVideos} Steps</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-2.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50 p-0.5">
                  <div 
                    style={{ width: `${track.progressPercentage}%` }}
                    className="h-full bg-gradient-to-r from-[var(--accent-color)] to-sky-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_var(--accent-color)]"
                  />
                </div>
                <p className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-[0.3em] flex items-center gap-2 italic">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
                  {track.progressPercentage === 100 ? "PATH COMPLETED" : "PATH ACTIVE"}
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-color)] w-full md:w-auto shadow-inner">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-5 px-1 text-center md:text-left italic opacity-40">Load Intensity</h3>
              <div className="flex flex-col gap-2.5 min-w-[220px]">
                {energyLevels.map((cfg) => {
                  const isActive = currentEnergy === cfg.level;
                  return (
                    <button
                      key={cfg.level}
                      onClick={() => onEnergySelect(cfg.level)}
                      title={cfg.tooltip}
                      className={`flex items-center gap-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 italic ${
                        isActive 
                          ? cfg.activeClass
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <cfg.icon size={16} />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
              <button 
                onClick={onOptimize}
                className="mt-6 w-full py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:opacity-90 flex items-center justify-center gap-3 shadow-xl active:scale-95 italic"
              >
                <TrendingUp size={16} strokeWidth={3} />
                Optimize Execution
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 pt-8 border-t border-[var(--border-color)] relative z-10">
            <MetricItem 
              icon={<Youtube size={16} className="text-rose-500" />}
              label="Total Duration"
              value={formatMins(track.totalDurationMinutes)}
            />
            <MetricItem 
              icon={<PlayCircleIcon size={16} className="text-emerald-500" />}
              label="Completed"
              value={formatMins(watchTimeMins)}
            />
            <MetricItem 
              icon={<Timer size={16} className="text-fuchsia-500" />}
              label="Time Spent"
              value={formatMins(studyTimeMins)}
            />
            <MetricItem 
              icon={<Clock size={16} className="text-amber-500" />}
              label="Remaining"
              value={formatMins(track.remainingMinutes || 0)}
            />
          </div>
        </div>

        {/* --- Card 2: Timeline & Analytics --- */}
        <div className="bg-[var(--bg-card)] rounded-[3rem] p-8 flex flex-col justify-between border border-[var(--border-color)] shadow-2xl relative overflow-hidden group">
          <div className="transform-gpu absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-500/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4 leading-none">
              <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500 border border-sky-500/20 shadow-sm">
                 <Target size={18} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40">Timeline Topology</h3>
            </div>

            <div className="space-y-5">
              <div className="p-6 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] shadow-inner">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 italic opacity-40">Calculated Horizon</p>
                {hasStarted ? (
                  <>
                    <p className="text-2xl font-black tracking-tight text-[var(--text-primary)] italic uppercase leading-none">
                      {stats?.estCompletionDate ? formatDate(stats.estCompletionDate) : '---'}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                        isBehind ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                        isAhead ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 
                        'bg-sky-500/10 border-sky-500/20 text-sky-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${isBehind ? 'bg-rose-500 shadow-[0_0_8px_rose-500]' : isAhead ? 'bg-emerald-500 shadow-[0_0_8px_emerald-500]' : 'bg-sky-500 shadow-[0_0_8px_sky-500]'}`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">
                          {isBehind ? `${stats.daysDiff}D BEHIND` : isAhead ? `${stats.daysDiff}D AHEAD` : 'ON TARGET'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-4 opacity-30 italic">
                    <Activity size={24} className="mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                      Awaiting initial ingestion data to project horizon.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] shadow-inner">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 italic opacity-40">Target Convergence</p>
                <p className="text-xl font-black tracking-tight text-[var(--text-primary)] italic uppercase leading-none">
                  {track.targetDate ? formatDate(track.targetDate) : 'NOT SET'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-auto">
            <button 
              onClick={() => openModal('COMMIT')}
              className="w-full py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] shadow-sm flex items-center justify-center gap-3 active:scale-95 italic"
            >
              <Settings size={16} />
              {track.targetDate ? 'Update Date' : 'Set Deadline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] leading-none italic opacity-40">{label}</span>
      </div>
      <p className="text-xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">{value}</p>
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