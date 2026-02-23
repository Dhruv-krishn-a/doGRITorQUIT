//packages/study-ui-web/src/components/TrackHeaderSummary.tsx
"use client";
import React from 'react';
import { Track, TrackStats, EnergyLevel, useStudy } from '@planner/study-core';
import { 
  CheckCircle2, 
  Sparkles, 
  Timer,
  Youtube,
  Activity,
  Zap,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TrackHeaderSummaryProps {
  track: Track;
  stats: TrackStats & {
    masteredContentMinutes: number;
    totalInvestmentMinutes: number;
  };
  currentEnergy: EnergyLevel;
  onEnergySelect: (level: EnergyLevel) => void;
}

export const TrackHeaderSummary: React.FC<TrackHeaderSummaryProps> = ({ 
  track, 
  stats, 
  currentEnergy,
  onEnergySelect
}) => {
  const { openModal, planToday } = useStudy();

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return { h, m };
  };

  const totalTime = formatMins(track.totalDurationMinutes || 0);
  const masteredTime = formatMins(stats.masteredContentMinutes);
  const investmentTime = formatMins(stats.totalInvestmentMinutes);
  
  const contentEfficiency = stats.masteredContentMinutes > 0 
    ? (stats.masteredContentMinutes / Math.max(1, stats.totalInvestmentMinutes)) 
    : 0;

  const getStatusColor = () => {
    if (stats.status === 'AHEAD') return 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-100/50';
    if (stats.status === 'BEHIND') return 'text-rose-600 bg-rose-50 border-rose-100 shadow-rose-100/50';
    return 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-indigo-100/50';
  };

  return (
    <div className="space-y-10 font-sans">
      {/* HUD: Intelligence Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl transition-all duration-700 ${getStatusColor()}`}
      >
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-white/80 shadow-lg">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 text-current">Course Status</p>
            <p className="text-base font-bold leading-tight tracking-tight text-current">
              {stats.status === 'BEHIND' ? (
                `You are ${stats.daysDiff} days behind. Let's pick up the pace!`
              ) : stats.status === 'AHEAD' ? (
                `Great job! You are ${stats.daysDiff} days ahead of schedule.`
              ) : (
                `On Track. Target: ${stats.todayTargetVideos} lessons (~${stats.todayTargetMins}m) today.`
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={() => planToday(track.id, currentEnergy)} 
          className="w-full md:w-auto bg-white/95 hover:bg-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-xl border border-black/5 hover:border-rose-200 text-slate-900"
        >
          Update Plan
        </button>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Card 1: Core Metrics */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-8 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 group-hover:scale-110 pointer-events-none">
            <Cpu size={240} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10 text-slate-900">
            {/* Total Content */}
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <Youtube size={20} className="text-rose-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Course Length</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{totalTime.h}</span>
                <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">H</span>
                <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none ml-4">{totalTime.m}</span>
                <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">M</span>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">Total time for all lessons in this course.</p>
            </div>

            {/* Mastered Content */}
            <div className="space-y-5 border-x border-slate-50 px-10">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Completed</span>
              </div>
              <div className="flex items-baseline gap-1.5 text-emerald-600">
                <span className="text-6xl font-black tracking-tighter leading-none">{masteredTime.h}</span>
                <span className="text-xl font-bold opacity-60 uppercase tracking-widest">H</span>
                <span className="text-6xl font-black tracking-tighter leading-none ml-4">{masteredTime.m}</span>
                <span className="text-xl font-bold opacity-60 uppercase tracking-widest">M</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.masteredContentMinutes / Math.max(1, track.totalDurationMinutes)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Learning progress</p>
              </div>
            </div>

            {/* Total Investment */}
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Timer size={20} className="text-indigo-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Study Time</span>
              </div>
              <div className="flex items-baseline gap-1.5 text-indigo-600">
                <span className="text-6xl font-black tracking-tighter leading-none">{investmentTime.h}</span>
                <span className="text-xl font-bold opacity-60 uppercase tracking-widest">H</span>
                <span className="text-6xl font-black tracking-tighter leading-none ml-4">{investmentTime.m}</span>
                <span className="text-xl font-bold opacity-60 uppercase tracking-widest">M</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl w-fit shadow-inner">
                <Activity size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Efficiency: {contentEfficiency.toFixed(1)}x</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Lessons</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.completedVideos} <span className="text-sm text-slate-300 font-bold uppercase tracking-widest ml-1">of</span> {stats.totalVideos}</p>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Daily Goal</p>
                <button 
                  onClick={() => openModal('COMMIT')} 
                  className="text-3xl font-black text-rose-600 hover:scale-105 transition-all flex items-center gap-2 group tracking-tighter"
                >
                  {track.dailyAllocationMinutes}<span className="text-[10px] opacity-40 font-black uppercase tracking-widest">m/day</span>
                </button>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Schedule</p>
                <div className={`text-sm font-black px-4 py-1.5 rounded-xl w-fit shadow-sm border ${getStatusColor()}`}>
                  {stats.status === 'AHEAD' ? `+${stats.daysDiff} Days` : stats.status === 'BEHIND' ? `-${stats.daysDiff} Days` : 'Aligned'}
                </div>
             </div>
             <div className="space-y-2 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estimated Finish</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">
                  {new Date(stats.estCompletionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  <span className="text-xs text-slate-300 ml-2 font-black uppercase tracking-widest">{new Date(stats.estCompletionDate).getFullYear()}</span>
                </p>
             </div>
          </div>
        </motion.div>

        {/* Card 2: Focus Energy */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-4 bg-white p-12 rounded-[4rem] shadow-2xl flex flex-col justify-between relative overflow-hidden border border-rose-100 shadow-rose-100/30"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-rose-600 rounded-2xl text-white shadow-[0_10px_25px_rgba(225,29,72,0.3)]">
                <Zap size={22} fill="currentColor" />
              </div>
              <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.4em]">Learning Speed</h3>
            </div>

            <div className="space-y-4">
              {[
                { id: 'LOW' as EnergyLevel, label: 'Low Energy', desc: 'Slow and steady progress', color: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100' },
                { id: 'MEDIUM' as EnergyLevel, label: 'Normal', desc: 'Standard study pace', color: 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' },
                { id: 'HIGH' as EnergyLevel, label: 'Full Power', desc: 'Maximum focus and speed', color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100 hover:bg-fuchsia-100' },
              ].map((level) => (
                <motion.button
                  key={level.id}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEnergySelect(level.id)}
                  className={`w-full flex flex-col items-start gap-1 p-6 rounded-[2rem] border-2 transition-all text-left shadow-sm ${
                    currentEnergy === level.id 
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-200 scale-[1.02]' 
                      : `${level.color} border-transparent`
                  }`}
                >
                  <span className={`font-black uppercase tracking-[0.2em] text-[11px] ${currentEnergy === level.id ? 'text-white' : ''}`}>{level.label}</span>
                  <span className={`text-[10px] font-bold opacity-70 ${currentEnergy === level.id ? 'text-rose-100' : ''}`}>{level.desc}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative z-10">
             <p className="text-[10px] font-black text-slate-400 leading-relaxed italic text-center uppercase tracking-widest opacity-80">
               Pace updated based on your energy.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
