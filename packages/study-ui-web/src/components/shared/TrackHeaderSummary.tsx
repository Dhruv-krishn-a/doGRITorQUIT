"use client";
import React from 'react';
import { Track, TrackStats, EnergyLevel, useStudy } from '@gritorquit/study-core';
import { 
  CheckCircle2, 
  Sparkles, 
  Timer,
  Youtube,
  Activity,
  Zap,
  Cpu,
  ArrowRight
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
    const m = Math.round(mins % 60);
    return { h, m };
  };

  const totalTime = formatMins(track.totalDurationMinutes || 0);
  const masteredTime = formatMins(stats.masteredContentMinutes);
  const investmentTime = formatMins(stats.totalInvestmentMinutes);
  
  const contentEfficiency = stats.masteredContentMinutes > 0 
    ? (stats.masteredContentMinutes / Math.max(1, stats.totalInvestmentMinutes)) 
    : 0;

  // Premium Dynamic Theming for the HUD Banner
  const getBannerTheme = () => {
    if (stats.status === 'AHEAD') return {
      bg: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-200/50',
      text: 'text-emerald-800',
      iconGlow: 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      btnHover: 'hover:text-emerald-600 hover:border-emerald-300'
    };
    if (stats.status === 'BEHIND') return {
      bg: 'bg-gradient-to-r from-rose-500/10 to-pink-500/10',
      border: 'border-rose-200/50',
      text: 'text-rose-900',
      iconGlow: 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]',
      btnHover: 'hover:text-rose-600 hover:border-rose-300'
    };
    return {
      bg: 'bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10',
      border: 'border-fuchsia-200/50',
      text: 'text-fuchsia-900',
      iconGlow: 'text-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]',
      btnHover: 'hover:text-fuchsia-600 hover:border-fuchsia-300'
    };
  };

  const bannerTheme = getBannerTheme();
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: springConfig }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="transform-gpu space-y-8 font-sans transform-gpu antialiased"
    >
      {/* --- HUD: Intelligence Banner --- */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.01 }}
        className={`p-5 md:p-6 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg backdrop-blur-xl transition-all duration-500 relative overflow-hidden group ${bannerTheme.bg} ${bannerTheme.border}`}
      >
        <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/20 transition-opacity duration-700 pointer-events-none" />
        
        <div className="transform-gpu flex items-center gap-5 relative z-10 w-full md:w-auto">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="transform-gpu p-3.5 rounded-2xl bg-white/90 shadow-sm border border-white flex-shrink-0"
          >
            <Sparkles size={24} className={bannerTheme.iconGlow} />
          </motion.div>
          <div className="transform-gpu space-y-1">
            <p className={`text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 ${bannerTheme.text}`}>Neural Status</p>
            <p className={`text-sm md:text-base font-bold leading-tight tracking-tight ${bannerTheme.text}`}>
              {stats.status === 'BEHIND' ? (
                `You are ${stats.daysDiff} days behind. Let's pick up the pace!`
              ) : stats.status === 'AHEAD' ? (
                `Great job! You are ${stats.daysDiff} days ahead of schedule.`
              ) : (
                `On Track. Target: ${stats.todayTargetVideos} tasks (~${stats.todayTargetMins}m) today.`
              )}
            </p>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => planToday(track.id, currentEnergy)} 
          className={`w-full md:w-auto bg-white/90 px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-sm border border-white ${bannerTheme.text} ${bannerTheme.btnHover} flex items-center justify-center gap-2 relative z-10 group/btn`}
        >
          <span>Update Plan</span>
          <ArrowRight size={14} className="transform-gpu group-hover/btn:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      <div className="transform-gpu grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- Card 1: Core Metrics --- */}
        <motion.div 
          variants={itemVariants}
          className="transform-gpu xl:col-span-8 bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-rose-100/50 relative overflow-hidden group transition-all duration-500"
        >
          {/* Moving Glass Gradient */}
          <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-rose-50/50 via-white to-fuchsia-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />
          
          <div className="transform-gpu absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] group-hover:text-rose-500 transition-all duration-1000 group-hover:scale-110 pointer-events-none">
            <Cpu size={280} />
          </div>

          <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
            {/* 1. Total Content */}
            <div className="transform-gpu space-y-5 group/metric cursor-default">
              <div className="transform-gpu flex items-center gap-3 text-slate-400">
                <div className="transform-gpu p-2.5 bg-rose-50 rounded-xl border border-rose-100 shadow-sm group-hover/metric:scale-110 group-hover/metric:-rotate-12 transition-transform duration-500">
                  <Youtube size={18} className="transform-gpu text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                </div>
                <span className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] group-hover/metric:text-rose-500 transition-colors">Vector Length</span>
              </div>
              <div className="transform-gpu flex items-baseline gap-1">
                <span className="transform-gpu text-6xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tighter leading-none">{totalTime.h}</span>
                <span className="transform-gpu text-lg font-bold text-slate-300 uppercase tracking-widest">H</span>
                <span className="transform-gpu text-6xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tighter leading-none ml-2">{totalTime.m}</span>
                <span className="transform-gpu text-lg font-bold text-slate-300 uppercase tracking-widest">M</span>
              </div>
            </div>

            {/* 2. Mastered Content */}
            <div className="transform-gpu space-y-5 md:border-x border-slate-200/60 md:px-8 group/metric cursor-default">
              <div className="transform-gpu flex items-center gap-3 text-slate-400">
                <div className="transform-gpu p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm group-hover/metric:scale-110 group-hover/metric:rotate-12 transition-transform duration-500">
                  <CheckCircle2 size={18} className="transform-gpu text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                </div>
                <span className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] group-hover/metric:text-emerald-500 transition-colors">Completed</span>
              </div>
              <div className="transform-gpu flex items-baseline gap-1 text-emerald-600">
                <span className="transform-gpu text-6xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none">{masteredTime.h}</span>
                <span className="transform-gpu text-lg font-bold opacity-40 uppercase tracking-widest">H</span>
                <span className="transform-gpu text-6xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none ml-2">{masteredTime.m}</span>
                <span className="transform-gpu text-lg font-bold opacity-40 uppercase tracking-widest">M</span>
              </div>
              <div className="transform-gpu space-y-2.5">
                <div className="transform-gpu h-2 w-full bg-white rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stats.masteredContentMinutes / Math.max(1, track.totalDurationMinutes)) * 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="transform-gpu h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  />
                </div>
              </div>
            </div>

            {/* 3. Total Investment */}
            <div className="transform-gpu space-y-5 group/metric cursor-default">
              <div className="transform-gpu flex items-center gap-3 text-slate-400">
                <div className="transform-gpu p-2.5 bg-fuchsia-50 rounded-xl border border-fuchsia-100 shadow-sm group-hover/metric:scale-110 group-hover/metric:rotate-180 transition-transform duration-700">
                  <Timer size={18} className="transform-gpu text-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.4)]" />
                </div>
                <span className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] group-hover/metric:text-fuchsia-500 transition-colors">Study Time</span>
              </div>
              <div className="transform-gpu flex items-baseline gap-1 text-fuchsia-600">
                <span className="transform-gpu text-6xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none">{investmentTime.h}</span>
                <span className="transform-gpu text-lg font-bold opacity-40 uppercase tracking-widest">H</span>
                <span className="transform-gpu text-6xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none ml-2">{investmentTime.m}</span>
                <span className="transform-gpu text-lg font-bold opacity-40 uppercase tracking-widest">M</span>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="transform-gpu flex items-center gap-2 px-3 py-1.5 bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600 rounded-lg w-fit shadow-sm"
              >
                <Activity size={12} className="transform-gpu animate-pulse" />
                <span className="transform-gpu text-[9px] font-bold uppercase tracking-[0.2em]">Efficiency: {contentEfficiency.toFixed(1)}x</span>
              </motion.div>
            </div>
          </div>

          {/* Footer Grid */}
          <div className="transform-gpu mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
             <div className="transform-gpu space-y-1 group/foot">
                <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover/foot:text-rose-500 transition-colors">Lessons</p>
                <p className="transform-gpu text-2xl font-bold text-slate-800 tracking-tighter">{stats.completedVideos} <span className="transform-gpu text-[10px] text-slate-300 font-bold uppercase tracking-widest ml-0.5">of</span> {stats.totalVideos}</p>
             </div>
             <div className="transform-gpu space-y-1 group/foot">
                <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover/foot:text-rose-500 transition-colors">Daily Goal</p>
                <button 
                  onClick={() => openModal('COMMIT')} 
                  className="transform-gpu text-2xl font-bold text-rose-500 hover:text-rose-600 hover:scale-105 transition-all flex items-baseline gap-1 tracking-tighter origin-left"
                >
                  {track.dailyAllocationMinutes}<span className="transform-gpu text-[9px] text-rose-300 font-bold uppercase tracking-widest">m/day</span>
                </button>
             </div>
             <div className="transform-gpu space-y-1 group/foot">
                <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover/foot:text-rose-500 transition-colors">Schedule</p>
                <div className={`text-[10px] font-bold px-3 py-1 rounded-md w-fit shadow-sm border mt-1 ${bannerTheme.bg} ${bannerTheme.text} ${bannerTheme.border}`}>
                  {stats.status === 'AHEAD' ? `+${stats.daysDiff} Days` : stats.status === 'BEHIND' ? `-${stats.daysDiff} Days` : 'Aligned'}
                </div>
             </div>
             <div className="transform-gpu space-y-1 text-right group/foot">
                <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover/foot:text-rose-500 transition-colors">Est. Finish</p>
                <p className="transform-gpu text-2xl font-bold text-slate-800 tracking-tighter">
                  {new Date(stats.estCompletionDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                  <span className="transform-gpu text-[10px] text-slate-300 ml-1.5 font-bold uppercase tracking-widest">{new Date(stats.estCompletionDate).getFullYear()}</span>
                </p>
             </div>
          </div>
        </motion.div>

        {/* --- Card 2: Focus Energy --- */}
        <motion.div 
          variants={itemVariants}
          className="transform-gpu xl:col-span-4 bg-white/60 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden border border-white hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500 group"
        >
          {/* Internal Glow */}
          <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-rose-300/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="transform-gpu relative z-10">
            <div className="transform-gpu flex items-center gap-4 mb-8">
              <div className="transform-gpu p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl text-white shadow-md shadow-rose-200">
                <Zap size={18} fill="currentColor" className="transform-gpu animate-pulse" />
              </div>
              <h3 className="transform-gpu text-slate-800 font-bold text-[11px] uppercase tracking-[0.4em]">Energy Load</h3>
            </div>

            <div className="transform-gpu space-y-3">
              {[
                { id: 'LOW' as EnergyLevel, label: 'Low Energy', desc: 'Slow & steady progress', color: 'from-amber-400 to-orange-400', activeBg: 'bg-amber-50 border-amber-200 text-amber-700', inactiveBg: 'bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:bg-amber-50/50' },
                { id: 'MEDIUM' as EnergyLevel, label: 'Normal', desc: 'Standard study pace', color: 'from-rose-400 to-pink-500', activeBg: 'bg-rose-50 border-rose-200 text-rose-700', inactiveBg: 'bg-white border-slate-100 text-slate-400 hover:border-rose-200 hover:bg-rose-50/50' },
                { id: 'HIGH' as EnergyLevel, label: 'Full Power', desc: 'Maximum focus & speed', color: 'from-fuchsia-500 to-purple-600', activeBg: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700', inactiveBg: 'bg-white border-slate-100 text-slate-400 hover:border-fuchsia-200 hover:bg-fuchsia-50/50' },
              ].map((level) => {
                const isActive = currentEnergy === level.id;
                
                return (
                  <motion.button
                    key={level.id}
                    whileHover={{ scale: isActive ? 1.02 : 1.01, x: isActive ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEnergySelect(level.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-[1.5rem] border transition-all duration-300 relative overflow-hidden ${
                      isActive ? `${level.activeBg} shadow-sm` : level.inactiveBg
                    }`}
                  >
                    {/* Active State Gradient Background */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeEnergy"
                        className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-10`}
                        initial={false}
                        transition={springConfig}
                      />
                    )}
                    
                    <div className="transform-gpu flex flex-col items-start relative z-10">
                      <span className={`font-bold uppercase tracking-[0.2em] text-[10px] ${isActive ? '' : 'text-slate-600'}`}>{level.label}</span>
                      <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'opacity-80' : 'opacity-60'}`}>{level.desc}</span>
                    </div>

                    {/* Radio Bubble Indicator */}
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center relative z-10 transition-colors duration-300 ${isActive ? 'border-current' : 'border-slate-300'}`}>
                       {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-2 h-2 rounded-full bg-current`} />}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="transform-gpu mt-8 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 relative z-10 text-center">
             <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80 flex items-center justify-center gap-1.5">
               <Activity size={12} /> Auto-adjusts vector pacing
             </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};