"use client";

import React from 'react';
import { 
  Flame, 
  Clock, 
  Brain, 
  Trophy,
  History,
  ArrowRight,
  PlayCircle,
  Activity,
  Cpu,
  Zap
} from 'lucide-react';
import { DashboardData } from '@gritorquit/study-core';
import { motion, Variants } from 'framer-motion';
import { useStudyUI } from '../../context/StudyUIContext';

interface DashboardOverviewProps {
  data: DashboardData | null;
}

// Added the explicitly typed Variants to fix the TS error
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data }) => {
  const { renderLink } = useStudyUI();
  if (!data) return null;

  const xpProgress = data.stats 
    ? (data.stats.totalXP / data.stats.nextLevelXP) * 100 
    : 0;

  // Premium load colors adapted for the light theme
  const loadColor = (data.dailyLoadPercentage || 0) > 90 
    ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]' 
    : (data.dailyLoadPercentage || 0) > 70 
      ? 'text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.4)]' 
      : 'text-fuchsia-500 drop-shadow-[0_0_12px_rgba(217,70,239,0.4)]';

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="transform-gpu flex-1 min-w-0 space-y-8 font-sans select-none w-full max-w-full overflow-hidden transform-gpu antialiased"
    >
      {/* SECTION 1: NEURAL HUD (TOP BAR) */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
        
        {/* Level & XP HUD */}
        <motion.div 
          variants={item}
          className="transform-gpu lg:col-span-8 min-w-0 bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500"
        >
          {/* Soft Ethereal Glow */}
          <div className="transform-gpu absolute top-0 right-0 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover:scale-110 opacity-60" />
          
          <div className="transform-gpu flex flex-col sm:flex-row justify-between items-start gap-6 mb-10 relative z-10 min-w-0">
            <div className="transform-gpu flex items-center gap-6 md:gap-8 min-w-0">
              <div className="transform-gpu relative shrink-0">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="transform-gpu w-24 h-24 md:w-28 md:h-28 border-[6px] border-white bg-slate-50 rounded-full flex items-center justify-center shadow-lg relative z-10"
                >
                   <span className="transform-gpu text-4xl md:text-5xl font-bold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-rose-500 to-pink-600 drop-shadow-sm">
                     {data.stats?.currentLevel}
                   </span>
                </motion.div>
                <div className="transform-gpu absolute inset-0 rounded-full border-2 border-rose-200 scale-110 opacity-50" />
                <div className="transform-gpu absolute -bottom-2 -right-2 bg-gradient-to-br from-rose-500 to-pink-600 p-2.5 rounded-2xl shadow-[0_4px_15px_rgba(244,63,94,0.4)] z-20 text-white border border-rose-400">
                  <Trophy size={18} fill="currentColor" />
                </div>
              </div>
              <div className="transform-gpu min-w-0">
                <h3 className="transform-gpu text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2 truncate">Cognitive Tier</h3>
                <p className="transform-gpu text-2xl md:text-4xl font-bold tracking-tighter uppercase text-slate-900 truncate">Advanced Learner</p>
              </div>
            </div>
            
            <div className="transform-gpu text-left sm:text-right shrink-0">
              <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Neural Status</p>
              <div className="transform-gpu flex items-center gap-2 justify-start sm:justify-end bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                <Activity size={14} className="transform-gpu text-emerald-500 animate-pulse drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]" />
                <span className="transform-gpu text-sm md:text-base font-bold font-mono text-emerald-600 tracking-tighter">SYNCED</span>
              </div>
            </div>
          </div>

          <div className="transform-gpu relative z-10 space-y-4">
            <div className="transform-gpu flex justify-between text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] px-1">
              <span className="transform-gpu text-slate-400">Current XP: <span className="transform-gpu text-slate-800">{data.stats?.totalXP}</span></span>
              <span className="transform-gpu text-rose-500 text-right">Next Level: {Math.round((data.stats?.nextLevelXP || 0) - (data.stats?.totalXP || 0))} XP</span>
            </div>
            <div className="transform-gpu h-5 w-full bg-white rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpProgress)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="transform-gpu h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)] relative overflow-hidden"
              >
                <div className="transform-gpu absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Load Biosensor Gauge */}
        <motion.div 
          variants={item}
          className="transform-gpu lg:col-span-4 min-w-0 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500"
        >
           <div className="transform-gpu relative w-40 h-40 md:w-44 md:h-44 mb-6 transition-transform duration-700 group-hover:scale-105 shrink-0">
              <svg className="transform-gpu w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="transform-gpu text-slate-100" />
                <motion.circle 
                  cx="50%" cy="50%" r="45%" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  strokeLinecap="round"
                  fill="transparent" 
                  strokeDasharray={502} 
                  initial={{ strokeDashoffset: 502 }}
                  animate={{ strokeDashoffset: 502 * (1 - (data.dailyLoadPercentage || 0) / 100) }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                  className={`${loadColor} transition-all`} 
                />
              </svg>
              <div className="transform-gpu absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-4xl md:text-5xl font-bold tracking-tighter ${loadColor}`}>{Math.round(data.dailyLoadPercentage || 0)}%</span>
                 <span className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Daily Load</span>
              </div>
           </div>
           <h4 className="transform-gpu text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-2">Neural Capacity</h4>
           <p className="transform-gpu text-[11px] text-slate-500 font-bold max-w-[200px] leading-relaxed break-words">
             Optimized based on your 14-day velocity trajectory.
           </p>
        </motion.div>
      </div>

      {/* SECTION 2: PROTOCOLS & REVISIONS */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-12 gap-8 w-full min-w-0">
        
        {/* Priority Protocol Engage (Main Active Course Card) */}
        <motion.div 
          variants={item}
          className="transform-gpu lg:col-span-7 min-w-0 bg-white/60 backdrop-blur-xl border border-white rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-rose-100/60 transition-all duration-500 flex flex-col justify-between"
        >
          {/* Internal Moving Glass Gradient */}
          <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />
          
          <div className="transform-gpu absolute -right-10 -top-10 p-10 opacity-[0.03] text-rose-500 group-hover:-rotate-12 transition-transform duration-1000 scale-150 pointer-events-none">
            <Cpu size={280} />
          </div>
          
          <div className="transform-gpu relative z-10 flex flex-col h-full min-w-0">
            <div className="transform-gpu min-w-0 flex-1">
              <div className="transform-gpu flex items-center gap-4 mb-8">
                <div className="transform-gpu bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 shadow-sm shrink-0 flex items-center gap-1.5">
                  <Zap size={12} className="transform-gpu text-rose-500 fill-current" />
                  <span className="transform-gpu text-[9px] font-bold uppercase tracking-[0.3em] text-rose-600 mt-0.5">Priority Vector</span>
                </div>
                <div className="transform-gpu h-px w-8 md:w-12 bg-slate-200 shrink-0" />
                <span className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate min-w-0 w-full block mt-0.5">
                  {data.globalNextUnit?.track?.title || "No Track"}
                </span>
              </div>

              <h2 className="transform-gpu text-4xl md:text-5xl font-bold tracking-tighter mb-6 leading-[1.05] max-w-lg break-words whitespace-normal text-slate-900 group-hover:text-rose-950 transition-colors">
                {data.globalNextUnit?.title || "Neural engine idle. Initialize a learning vector."}
              </h2>
              
              <p className="transform-gpu text-slate-500 font-bold text-sm md:text-base max-w-md line-clamp-3 overflow-hidden leading-relaxed tracking-wide break-words whitespace-normal">
                {data.globalNextUnit?.description || "Select a module from your active tracks to resume ingestion."}
              </p>
            </div>

            <div className="transform-gpu mt-10 md:mt-12 shrink-0">
              {data.globalNextUnit ? (
                renderLink({
                  href: `/dashboard/study/${data.globalNextUnit.track.id}`,
                  className: "inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 md:py-5 rounded-[2rem] font-bold text-xs md:text-sm uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.5)] hover:-translate-y-1 transition-all duration-300 active:scale-95 group/btn border border-rose-400 overflow-hidden relative",
                  children: (
                    <>
                      {/* Button Glass Shimmer */}
                      <div className="transform-gpu absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                      <PlayCircle size={22} fill="currentColor" className="transform-gpu group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform duration-300 relative z-10" />
                      <span className="transform-gpu truncate relative z-10">Resume Optimization</span>
                    </>
                  )
                })
              ) : (
                <button disabled className="transform-gpu inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-slate-50 text-slate-400 px-8 py-4 rounded-[2rem] font-bold text-sm uppercase tracking-widest cursor-not-allowed border border-slate-200">
                  Standby
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Neural Decay (Review) & Quick Stats */}
        <motion.div variants={item} className="transform-gpu lg:col-span-5 min-w-0 flex flex-col gap-8">
           
           {/* Review Pipeline Card */}
           <div className="transform-gpu bg-white/60 backdrop-blur-xl rounded-[3.5rem] border border-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col relative overflow-hidden min-h-[300px] max-h-[450px] group hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500">
              <div className="transform-gpu flex items-center justify-between mb-8 px-2 relative z-10 shrink-0">
                <h3 className="transform-gpu text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <History size={16} className="transform-gpu text-rose-500 shrink-0 group-hover:-rotate-45 transition-transform duration-500" />
                  <span className="transform-gpu truncate mt-0.5">Review Pipeline</span>
                </h3>
                <span className="transform-gpu bg-rose-50 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm shrink-0 whitespace-nowrap">
                  {data.dueRevisions?.length || 0} Critical
                </span>
              </div>

              <div className="transform-gpu space-y-3 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 relative z-10">
                {data.dueRevisions && data.dueRevisions.length > 0 ? (
                  data.dueRevisions.map((unit) => (
                    <React.Fragment key={unit.id}>
                      {renderLink({
                        href: `/dashboard/study/${unit.trackId}`,
                        className: "group/item block p-4 md:p-5 rounded-[2rem] bg-white/80 border border-slate-100 hover:border-rose-200 hover:bg-rose-50 hover:shadow-md transition-all duration-300 min-w-0",
                        children: (
                          <>
                            <div className="transform-gpu flex justify-between items-start mb-2 gap-2 min-w-0">
                              <span className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate w-full group-hover/item:text-rose-400 transition-colors mt-0.5">
                                {unit.track.title}
                              </span>
                              <ArrowRight size={14} className="transform-gpu text-slate-300 group-hover/item:translate-x-1 transition-transform group-hover/item:text-rose-500 shrink-0" />
                            </div>
                            <p className="transform-gpu text-sm font-bold text-slate-800 line-clamp-1 group-hover/item:text-rose-600 transition-all tracking-tight break-words">
                              {unit.title}
                            </p>
                          </>
                        )
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="transform-gpu h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                    <div className="transform-gpu bg-slate-50 p-6 rounded-full mb-4 shrink-0 border border-slate-100">
                      <Brain size={40} className="transform-gpu text-slate-300" />
                    </div>
                    <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Retention Stable</p>
                  </div>
                )}
              </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="transform-gpu grid grid-cols-2 gap-4 md:gap-6 w-full min-w-0">
              <motion.div 
                whileHover={{ y: -4 }}
                className="transform-gpu bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:shadow-rose-100/50 flex flex-col items-center justify-center text-center gap-4 group min-w-0 transition-all duration-500"
              >
                 <div className="transform-gpu bg-rose-50 border border-rose-100 p-3 rounded-2xl text-rose-500 group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-pink-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_4px_15px_rgba(244,63,94,0.4)] shrink-0">
                    <Flame size={24} fill="currentColor" className="transform-gpu group-hover:scale-110 transition-transform" />
                 </div>
                 <div className="transform-gpu min-w-0">
                    <p className="transform-gpu text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter leading-none truncate">{data.streak}</p>
                    <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 truncate">Day Streak</p>
                 </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -4 }}
                className="transform-gpu bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:shadow-fuchsia-100/50 flex flex-col items-center justify-center text-center gap-4 group min-w-0 transition-all duration-500"
              >
                 <div className="transform-gpu bg-fuchsia-50 border border-fuchsia-100 p-3 rounded-2xl text-fuchsia-500 group-hover:bg-gradient-to-br group-hover:from-fuchsia-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_4px_15px_rgba(217,70,239,0.4)] shrink-0">
                    <Clock size={24} className="transform-gpu group-hover:rotate-45 transition-transform duration-500" />
                 </div>
                 <div className="transform-gpu min-w-0">
                    <p className="transform-gpu text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter leading-none truncate">{Math.floor(data.weeklyTimeMinutes / 60)}h</p>
                    <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 truncate">Study Time</p>
                 </div>
              </motion.div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
};