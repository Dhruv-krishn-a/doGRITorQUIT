"use client";

import React from 'react';
import { 
  Flame, 
  Clock, 
  Brain, 
  AlertTriangle, 
  Zap,
  Target,
  Trophy,
  History,
  ArrowRight,
  PlayCircle,
  Activity,
  Cpu,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { Unit } from '@prisma/client';
import Link from 'next/link';

export interface DriftingTrack {
  title: string;
}

export interface DashboardData {
  streak: number;
  weeklyTimeMinutes: number;
  fatigueLevel: string;
  suggestedMode: string;
  overloadRisk?: boolean;
  burnoutRisk?: boolean;
  contextSwitchRisk?: boolean;
  driftingTracks?: DriftingTrack[];
  recommendedReduction?: string | number;
  dueRevisions?: (Unit & { track: { title: string } })[];
  globalNextUnit?: (Unit & { track: { title: string, id: string } }) | null;
  dailyLoadPercentage?: number;
  maxNeuralCapacity?: number;
  stats?: {
    totalXP: number;
    currentLevel: number;
    nextLevelXP: number;
  };
}

interface DashboardOverviewProps {
  data: DashboardData | null;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data }) => {
  if (!data) return null;

  const xpProgress = data.stats 
    ? (data.stats.totalXP / data.stats.nextLevelXP) * 100 
    : 0;

  const loadColor = (data.dailyLoadPercentage || 0) > 90 ? 'text-rose-500' : (data.dailyLoadPercentage || 0) > 70 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="space-y-8 font-sans select-none">
      {/* SECTION 1: NEURAL HUD (TOP BAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Level & XP HUD */}
        <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-rose-500/20 rounded-full flex items-center justify-center">
                   <span className="text-4xl font-black italic">{data.stats?.currentLevel}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-rose-600 p-1.5 rounded-lg shadow-lg">
                  <Trophy size={14} fill="currentColor" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-rose-400 mb-1">Study Level</h3>
                <p className="text-2xl font-black tracking-tight uppercase">Advanced Learner</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2 justify-end">
                <Activity size={16} className="text-emerald-500 animate-pulse" />
                <span className="text-xl font-bold font-mono text-emerald-400">SYNCED</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-slate-400">Total XP: {data.stats?.totalXP}</span>
              <span className="text-rose-400">Next Level: {Math.round((data.stats?.nextLevelXP || 0) - (data.stats?.totalXP || 0))} XP</span>
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 p-1">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(225,29,72,0.4)]" 
                style={{ width: `${Math.min(100, xpProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Load Biosensor Gauge */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
           <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-50" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={364} strokeDashoffset={364 * (1 - (data.dailyLoadPercentage || 0) / 100)} className={`${loadColor} transition-all duration-1000 stroke-round shadow-lg`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-3xl font-black ${loadColor}`}>{Math.round(data.dailyLoadPercentage || 0)}%</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Daily Load</span>
              </div>
           </div>
           <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Mental Energy</h4>
           <p className="text-[10px] text-slate-400 font-bold max-w-[150px] leading-tight">
             Based on your study performance over the last 14 days.
           </p>
        </div>
      </div>

      {/* SECTION 2: PROTOCOLS & REVISIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Priority Protocol Engage */}
        <div className="lg:col-span-7 bg-gradient-to-br from-rose-600 to-rose-700 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-rose-200">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Cpu size={180} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next Video</span>
              </div>
              <div className="h-px w-12 bg-white/20" />
              <span className="text-[10px] font-bold text-rose-200 uppercase tracking-widest truncate max-w-[200px]">
                {data.globalNextUnit?.track?.title || "No Track"}
              </span>
            </div>

            <h2 className="text-4xl font-black tracking-tight mb-4 leading-[1.1] max-w-lg">
              {data.globalNextUnit?.title || "No active videos. Start a new track to begin."}
            </h2>
            
            <p className="text-rose-100/80 font-medium text-sm max-w-sm mb-10 line-clamp-2 leading-relaxed">
              {data.globalNextUnit?.description || "Pick a video from your playlist to start your next study session."}
            </p>

            <div className="mt-auto">
              {data.globalNextUnit ? (
                <Link 
                  href={`/dashboard/study/${data.globalNextUnit.track.id}`}
                  className="inline-flex items-center gap-4 bg-white text-rose-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                >
                  <PlayCircle size={20} fill="currentColor" />
                  Start Study Now
                </Link>
              ) : (
                <button disabled className="inline-flex items-center gap-4 bg-white/10 text-white/40 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed border border-white/5">
                  Standby
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Neural Decay (Review) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <History size={16} className="text-blue-500" />
                  Need to Review
                </h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-lg border border-blue-100">
                  {data.dueRevisions?.length || 0} Videos
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                {data.dueRevisions && data.dueRevisions.length > 0 ? (
                  data.dueRevisions.map((unit) => (
                    <Link 
                      key={unit.id} 
                      href={`/dashboard/study/${unit.trackId}`}
                      className="group block p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                          {unit.track.title}
                        </span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 uppercase tracking-tight">
                        {unit.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40 grayscale">
                    <Brain size={48} className="text-slate-200 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retention High</p>
                  </div>
                )}
              </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                 <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500">
                    <Flame size={20} fill="currentColor" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Streak</p>
                    <p className="text-lg font-black text-slate-900">{data.streak}D</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                 <div className="bg-rose-50 p-2.5 rounded-xl text-rose-500">
                    <Clock size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Focus</p>
                    <p className="text-lg font-black text-slate-900">{Math.floor(data.weeklyTimeMinutes / 60)}h</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* SECTION 3: SYSTEM ALERTS */}
      {(data.overloadRisk || data.burnoutRisk || data.contextSwitchRisk) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-1000">
          {data.burnoutRisk && (
            <div className="bg-rose-950 rounded-3xl p-6 flex gap-5 items-center border border-rose-500/20">
              <div className="p-3 bg-rose-600 text-white rounded-2xl animate-pulse shadow-lg shadow-rose-500/40">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Burnout Alert</p>
                <p className="text-sm font-bold text-white leading-tight">Critical neural fatigue detected. Rest protocol initiated.</p>
              </div>
            </div>
          )}
          {data.overloadRisk && (
            <div className="bg-amber-50 rounded-3xl p-6 flex gap-5 items-center border border-amber-200">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Overload Risk</p>
                <p className="text-sm font-bold text-amber-900 leading-tight">Planned load exceeds capacity. Decouple {data.recommendedReduction} nodes.</p>
              </div>
            </div>
          )}
          {data.contextSwitchRisk && (
            <div className="bg-slate-100 rounded-3xl p-6 flex gap-5 items-center border border-slate-200">
              <div className="p-3 bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-800/20">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Focus Diffusion</p>
                <p className="text-sm font-bold text-slate-900 leading-tight">Context switching high. Prioritize top 2 vectors.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
