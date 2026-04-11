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
  BarChart3,
  AlertCircle,
  Zap
} from 'lucide-react';
import { DashboardData } from '@gritorquit/study-core';
import { motion } from 'framer-motion';
import { useStudyUI } from '@gritorquit/study-ui-web';

interface StudyDashboardHUDProps {
  data: DashboardData | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function StudyDashboardHUD({ data }: StudyDashboardHUDProps) {
  const { renderLink } = useStudyUI();
  if (!data) return null;

  const xpProgress = data.stats 
    ? (data.stats.totalXP / data.stats.nextLevelXP) * 100 
    : 0;

  const loadColor = (data.dailyLoadPercentage || 0) > 90 ? 'text-rose-600' : (data.dailyLoadPercentage || 0) > 70 ? 'text-pink-500' : 'text-fuchsia-500';

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="transform-gpu w-full space-y-10 font-sans select-none"
    >
      {/* SECTION 1: NEURAL HUD (TOP BAR) */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Level & XP HUD */}
        <motion.div 
          variants={item}
          className="transform-gpu lg:col-span-8 bg-white rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-pink-100/40 relative overflow-hidden group border border-pink-50"
        >
          <div className="transform-gpu absolute top-0 right-0 w-125 h-125 bg-linear-to-br from-pink-50 to-rose-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover:scale-110 opacity-60" />
          
          <div className="transform-gpu flex flex-col sm:flex-row justify-between items-start gap-6 mb-10 relative z-10">
            <div className="transform-gpu flex items-center gap-6 md:gap-8">
              <div className="transform-gpu relative shrink-0">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="transform-gpu w-24 h-24 md:w-28 md:h-28 border-[6px] border-white bg-linear-to-br from-pink-50 to-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(236,72,153,0.15)] relative z-10"
                >
                   <span className="transform-gpu text-4xl md:text-5xl font-bold italic tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-pink-600 to-rose-500">
                     {data.stats?.currentLevel}
                   </span>
                </motion.div>
                <div className="transform-gpu absolute inset-0 rounded-full border-2 border-pink-100 scale-110 opacity-50" />
                <div className="transform-gpu absolute -bottom-2 -right-2 bg-pink-600 p-2.5 rounded-2xl shadow-lg shadow-pink-200 z-20 text-white">
                  <Trophy size={18} fill="currentColor" />
                </div>
              </div>
              <div>
                <h3 className="transform-gpu text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2">Cognitive Tier</h3>
                <p className="transform-gpu text-2xl md:text-4xl font-bold tracking-tight uppercase text-slate-900">Advanced Learner</p>
              </div>
            </div>
            
            <div className="transform-gpu text-left sm:text-right shrink-0">
              <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Smart Status</p>
              <div className="transform-gpu flex items-center gap-2 justify-start sm:justify-end bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                <Activity size={16} className="transform-gpu text-emerald-500 animate-pulse" />
                <span className="transform-gpu text-sm md:text-lg font-bold font-mono text-emerald-600 tracking-tighter">SYNCED</span>
              </div>
            </div>
          </div>

          <div className="transform-gpu relative z-10 space-y-4">
            <div className="transform-gpu flex justify-between text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] px-1">
              <span className="transform-gpu text-slate-400">Current XP: <span className="transform-gpu text-slate-900">{data.stats?.totalXP}</span></span>
              <span className="transform-gpu text-pink-500 text-right">Next Level: {Math.round((data.stats?.nextLevelXP || 0) - (data.stats?.totalXP || 0))} XP</span>
            </div>
            <div className="transform-gpu h-6 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpProgress)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="transform-gpu h-full bg-linear-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-full shadow-[0_2px_10px_rgba(236,72,153,0.3)] relative overflow-hidden"
              >
                <div className="transform-gpu absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Load Biosensor Gauge */}
        <motion.div 
          variants={item}
          className="transform-gpu lg:col-span-4 bg-white rounded-[3rem] border border-pink-50 p-10 shadow-xl shadow-pink-100/30 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-pink-100 transition-colors"
        >
           <div className="transform-gpu relative w-40 h-40 md:w-44 md:h-44 mb-6 transition-transform duration-500 group-hover:scale-105 shrink-0">
              <svg className="transform-gpu w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="transform-gpu text-slate-50" />
                <motion.circle 
                  cx="50%" cy="50%" r="45%" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={502} 
                  initial={{ strokeDashoffset: 502 }}
                  animate={{ strokeDashoffset: 502 * (1 - (data.dailyLoadPercentage || 0) / 100) }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className={`${loadColor} transition-all stroke-round drop-shadow-md`} 
                />
              </svg>
              <div className="transform-gpu absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-4xl md:text-5xl font-bold tracking-tighter ${loadColor}`}>{Math.round(data.dailyLoadPercentage || 0)}%</span>
                 <span className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Load</span>
              </div>
           </div>
           <h4 className="transform-gpu text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-2">Smart Capacity</h4>
           <p className="transform-gpu text-[11px] text-slate-400 font-bold max-w-50 leading-relaxed wrap-break-word">
             Optimized based on your 14-day velocity trajectory.
           </p>
        </motion.div>
      </div>

      {/* SECTION 2: PROTOCOLS & REVISIONS */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Priority Protocol Engage */}
        <motion.div 
          variants={item}
          whileHover={{ y: -5 }}
          className="transform-gpu lg:col-span-7 bg-linear-to-br from-pink-600 to-rose-700 rounded-[3.5rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl shadow-pink-200/50"
        >
          <div className="transform-gpu absolute -right-10 -top-10 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000 scale-150">
            <Cpu size={280} />
          </div>
          
          <div className="transform-gpu relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="transform-gpu flex items-center gap-4 mb-8">
                <div className="transform-gpu bg-white/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 shadow-lg shrink-0">
                  <span className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] text-white">Next Unit</span>
                </div>
                <div className="transform-gpu h-px w-8 md:w-12 bg-white/20 shrink-0" />
                <span className="transform-gpu text-[10px] font-bold text-pink-100 uppercase tracking-widest truncate w-full block">
                  {data.globalNextUnit?.track?.title || "No Track"}
                </span>
              </div>

              <h2 className="transform-gpu text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.05] max-w-lg drop-shadow-sm wrap-break-word">
                {data.globalNextUnit?.title || "Smart engine idle. Initialize a learning vector."}
              </h2>
              
              <p className="transform-gpu text-pink-100 font-bold text-sm md:text-base max-w-md line-clamp-3 leading-relaxed tracking-wide opacity-90 wrap-break-word">
                {data.globalNextUnit?.description || "Select a module from your active tracks to resume ingestion."}
              </p>
            </div>

            <div className="transform-gpu mt-10 md:mt-12 shrink-0">
              {data.globalNextUnit ? (
                renderLink({
                  href: `/dashboard/study/${data.globalNextUnit.track.id}`,
                  className: "inline-flex items-center justify-center w-full sm:w-auto gap-5 bg-white text-pink-700 px-8 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-pink-50 transition-all shadow-2xl hover:scale-105 active:scale-95 group/btn",
                  children: (
                    <>
                      <PlayCircle size={22} fill="currentColor" className="transform-gpu group-hover/btn:rotate-12 transition-transform text-pink-500 shrink-0" />
                      <span>Resume Protocol</span>
                    </>
                  )
                })
              ) : (
                <button disabled className="transform-gpu inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-white/10 text-white/40 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest cursor-not-allowed border border-white/5">
                  Standby
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Smart Decay (Review) */}
        <motion.div variants={item} className="transform-gpu lg:col-span-5 flex flex-col gap-8">
           <div className="transform-gpu bg-white rounded-[3.5rem] border border-slate-100 p-8 md:p-10 shadow-xl shadow-slate-200/20 flex-1 flex flex-col relative overflow-hidden min-h-75 max-h-112.5">
              <div className="transform-gpu flex items-center justify-between mb-8 px-2 relative z-10 shrink-0">
                <h3 className="transform-gpu text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <History size={18} className="transform-gpu text-indigo-500 shrink-0" />
                  <span>Smart Decay</span>
                </h3>
                <span className="transform-gpu bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm shrink-0 whitespace-nowrap">
                  {data.dueRevisions?.length || 0} Modules
                </span>
              </div>

              <div className="transform-gpu space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {data.dueRevisions && data.dueRevisions.length > 0 ? (
                  data.dueRevisions.map((unit) => (
                    <React.Fragment key={unit.id}>
                      {renderLink({
                        href: `/dashboard/study/${unit.trackId}`,
                        className: "group block p-4 md:p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:border-pink-200 hover:bg-white hover:shadow-lg hover:shadow-pink-100/20 transition-all duration-300",
                        children: (
                          <>
                            <div className="transform-gpu flex justify-between items-start mb-2 gap-2">
                              <span className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate w-full">
                                {unit.track.title}
                              </span>
                              <ArrowRight size={14} className="transform-gpu group-hover:translate-x-1 transition-transform text-pink-400 group-hover:text-pink-500 shrink-0" />
                            </div>
                            <p className="transform-gpu text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-pink-600 transition-colors uppercase tracking-tight wrap-break-word">
                              {unit.title}
                            </p>
                          </>
                        )
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="transform-gpu h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <div className="transform-gpu bg-slate-50 p-6 rounded-full mb-4 shrink-0">
                      <Brain size={40} className="transform-gpu text-slate-300" />
                    </div>
                    <p className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Retention Stable</p>
                  </div>
                )}
              </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="transform-gpu grid grid-cols-2 gap-4 md:gap-6 w-full">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="transform-gpu bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/20 flex flex-col items-center justify-center text-center gap-3 group"
              >
                 <div className="transform-gpu bg-orange-50 p-3 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-500 shadow-sm shrink-0">
                    <Flame size={24} fill="currentColor" />
                 </div>
                 <div>
                    <p className="transform-gpu text-2xl md:text-3xl font-bold text-slate-900 tracking-tighter leading-none">{data.streak}</p>
                    <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Day Streak</p>
                 </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="transform-gpu bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/20 flex flex-col items-center justify-center text-center gap-3 group"
              >
                 <div className="transform-gpu bg-rose-50 p-3 rounded-2xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-500 shadow-sm shrink-0">
                    <Clock size={24} />
                 </div>
                 <div>
                    <p className="transform-gpu text-2xl md:text-3xl font-bold text-slate-900 tracking-tighter leading-none">{Math.floor(data.weeklyTimeMinutes / 60)}h</p>
                    <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Focus Time</p>
                 </div>
              </motion.div>
           </div>
        </motion.div>
      </div>

      {/* SECTION 3: SYSTEM ALERTS */}
      {(data.overloadRisk || data.burnoutRisk || data.contextSwitchRisk) && (
        <motion.div 
          variants={container}
          className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-4 w-full"
        >
          {data.burnoutRisk && (
            <motion.div variants={item} className="transform-gpu bg-slate-950 rounded-[2.5rem] p-6 md:p-8 flex gap-6 items-center border border-pink-500/20 shadow-2xl shadow-pink-900/20 relative overflow-hidden">
              <div className="transform-gpu absolute inset-0 bg-pink-500/5 animate-pulse" />
              <div className="transform-gpu p-4 bg-pink-600 text-white rounded-2xl shadow-lg shadow-pink-500/40 relative z-10 shrink-0">
                <AlertCircle size={28} />
              </div>
              <div className="transform-gpu relative z-10">
                <p className="transform-gpu text-[10px] font-bold text-pink-400 uppercase tracking-[0.3em] mb-1">Burnout Warning</p>
                <p className="transform-gpu text-sm font-bold text-white leading-tight wrap-break-word">Critical neural fatigue. Initiate rest protocol immediately.</p>
              </div>
            </motion.div>
          )}
          {data.overloadRisk && (
            <motion.div variants={item} className="transform-gpu bg-white rounded-[2.5rem] p-6 md:p-8 flex gap-6 items-center border border-rose-100 shadow-xl shadow-rose-100/50">
              <div className="transform-gpu p-4 bg-rose-100 text-rose-600 rounded-2xl shadow-sm shrink-0">
                <Zap size={28} fill="currentColor" />
              </div>
              <div>
                <p className="transform-gpu text-[10px] font-bold text-rose-400 uppercase tracking-[0.3em] mb-1">Overload Risk</p>
                <p className="transform-gpu text-sm font-bold text-slate-700 leading-tight wrap-break-word">Planned load exceeds capacity. Decouple {data.recommendedReduction} nodes.</p>
              </div>
            </motion.div>
          )}
          {data.contextSwitchRisk && (
            <motion.div variants={item} className="transform-gpu bg-white rounded-[2.5rem] p-6 md:p-8 flex gap-6 items-center border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="transform-gpu p-4 bg-slate-100 text-slate-600 rounded-2xl shadow-sm shrink-0">
                <BarChart3 size={28} />
              </div>
              <div>
                <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Focus Diffusion</p>
                <p className="transform-gpu text-sm font-bold text-slate-700 leading-tight wrap-break-word">Context switching high. Prioritize top 2 learning vectors.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}