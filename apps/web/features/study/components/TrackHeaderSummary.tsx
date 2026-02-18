"use client";
import React from 'react';
import { Track, EnergyLevel } from '@prisma/client';
import { 
  Clock, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  Timer,
  Youtube,
  History,
  Activity
} from 'lucide-react';

interface TrackHeaderSummaryProps {
  track: Track;
  stats: {
    avgMinsPerDay: number;
    estCompletionDate: Date;
    status: 'AHEAD' | 'BEHIND' | 'ON_TRACK';
    daysDiff: number;
    todayTargetMins: number;
    todayTargetVideos: number;
    completedVideos: number;
    totalVideos: number;
    masteredContentMinutes: number;
    totalInvestmentMinutes: number;
  };
  currentEnergy: EnergyLevel;
  onEnergySelect: (level: EnergyLevel) => void;
  onCommitClick: () => void;
  onPlanClick: () => void;
}

export const TrackHeaderSummary: React.FC<TrackHeaderSummaryProps> = ({ 
  track, 
  stats, 
  currentEnergy,
  onEnergySelect,
  onCommitClick, 
  onPlanClick 
}) => {
  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return { h, m };
  };

  const totalTime = formatMins(track.totalDurationMinutes || 0);
  const masteredTime = formatMins(stats.masteredContentMinutes);
  const investmentTime = formatMins(stats.totalInvestmentMinutes);
  
  const videoProgress = stats.totalVideos > 0 
    ? (stats.completedVideos / stats.totalVideos) * 100 
    : 0;

  const contentEfficiency = stats.masteredContentMinutes > 0 
    ? (stats.masteredContentMinutes / Math.max(1, stats.totalInvestmentMinutes)) 
    : 0;

  const getStatusColor = () => {
    if (stats.status === 'AHEAD') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (stats.status === 'BEHIND') return 'text-rose-600 bg-rose-50 border-rose-100';
    return 'text-blue-600 bg-blue-50 border-blue-100';
  };

  return (
    <div className="space-y-8 font-sans">
      {/* HUD: Intelligence Banner */}
      <div className={`p-5 rounded-[2rem] border flex items-center justify-between gap-6 shadow-xl shadow-slate-200/20 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700 ${getStatusColor()}`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/80 shadow-sm">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Study Status</p>
            <p className="text-sm font-bold leading-tight">
              {stats.status === 'BEHIND' ? (
                `You are ${stats.daysDiff} days behind. Try to Hyper Focus today.`
              ) : stats.status === 'AHEAD' ? (
                `You are ${stats.daysDiff} days ahead. Great work!`
              ) : (
                `On Track. Goal: Finish ${stats.todayTargetVideos} videos today (~${stats.todayTargetMins}m).`
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={onPlanClick} 
          className="bg-white/90 hover:bg-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border border-black/5"
        >
          Update Plan
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Card 1: Core Metrics (The Big 3 Times) */}
        <div className="xl:col-span-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
            <Target size={200} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {/* Total Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Youtube size={18} className="text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Playlist</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900 leading-none">{totalTime.h}</span>
                <span className="text-xl font-bold text-slate-400 uppercase">h</span>
                <span className="text-5xl font-black text-slate-900 leading-none ml-2">{totalTime.m}</span>
                <span className="text-xl font-bold text-slate-400 uppercase">m</span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Total duration of all videos in this track.</p>
            </div>

            {/* Mastered Content */}
            <div className="space-y-4 border-x border-slate-50 px-8">
              <div className="flex items-center gap-3 text-slate-400">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Content Finished</span>
              </div>
              <div className="flex items-baseline gap-1 text-emerald-600">
                <span className="text-5xl font-black leading-none">{masteredTime.h}</span>
                <span className="text-xl font-bold opacity-60 uppercase">h</span>
                <span className="text-5xl font-black leading-none ml-2">{masteredTime.m}</span>
                <span className="text-xl font-bold opacity-60 uppercase">m</span>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stats.masteredContentMinutes / Math.max(1, track.totalDurationMinutes)) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-400 font-medium">How much of the video content you've watched.</p>
              </div>
            </div>

            {/* Total Investment */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Timer size={18} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Time Spent</span>
              </div>
              <div className="flex items-baseline gap-1 text-blue-600">
                <span className="text-5xl font-black leading-none">{investmentTime.h}</span>
                <span className="text-xl font-bold opacity-60 uppercase">h</span>
                <span className="text-5xl font-black leading-none ml-2">{investmentTime.m}</span>
                <span className="text-xl font-bold opacity-60 uppercase">m</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <Activity size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Efficiency: {contentEfficiency.toFixed(1)}x</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Videos Done</p>
                <p className="text-xl font-black text-slate-800">{stats.completedVideos} / {stats.totalVideos}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Daily Goal</p>
                <button onClick={onCommitClick} className="text-xl font-black text-rose-600 hover:scale-105 transition-transform flex items-center gap-2 group">
                  {track.dailyAllocationMinutes}m<span className="text-[10px] opacity-50">/day</span>
                </button>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Pace</p>
                <div className={`text-sm font-black px-2 py-0.5 rounded-lg w-fit ${getStatusColor()}`}>
                  {stats.status === 'AHEAD' ? `+${stats.daysDiff} Days` : stats.status === 'BEHIND' ? `-${stats.daysDiff} Days` : 'On Track'}
                </div>
             </div>
             <div className="space-y-1 text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Finish Date</p>
                <p className="text-xl font-black text-slate-800">{new Date(stats.estCompletionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
             </div>
          </div>
        </div>

        {/* Card 2: Focus Energy */}
        <div className="xl:col-span-4 bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-500/20">
                <Zap size={20} fill="currentColor" />
              </div>
              <h3 className="text-white font-black text-sm uppercase tracking-[0.2em]">Study Energy</h3>
            </div>

            <div className="space-y-3">
              {[
                { id: 'LOW' as EnergyLevel, label: 'Low Energy', desc: 'Light study (0.6x goal)', color: 'border-amber-500/20 hover:bg-amber-500/10 text-amber-500' },
                { id: 'MEDIUM' as EnergyLevel, label: 'Standard', desc: 'Your regular study goal', color: 'border-rose-500/20 hover:bg-rose-500/10 text-rose-500' },
                { id: 'HIGH' as EnergyLevel, label: 'Hyper Focus', desc: 'Intense study (1.5x throughput)', color: 'border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-400' },
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => onEnergySelect(level.id)}
                  className={`w-full flex flex-col items-start gap-1 p-5 rounded-3xl border-2 transition-all text-left ${
                    currentEnergy === level.id 
                      ? 'bg-white border-white text-slate-900 shadow-2xl scale-[1.02]' 
                      : `bg-slate-800/50 border-white/5 text-slate-400 ${level.color}`
                  }`}
                >
                  <span className="font-black uppercase tracking-widest text-xs">{level.label}</span>
                  <span className={`text-[10px] font-medium opacity-60 ${currentEnergy === level.id ? 'text-slate-500' : ''}`}>{level.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 p-5 bg-white/5 rounded-3xl border border-white/5 relative z-10">
             <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
               "System automatically adjusts your plan based on your energy selection."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
