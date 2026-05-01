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
          className="transform-gpu lg:col-span-8 bg-[var(--bg-card)] rounded-[3rem] p-6 md:p-10 shadow-2xl border border-[var(--border-color)] relative overflow-hidden group"
        >
          <div className="transform-gpu absolute top-0 right-0 w-125 h-125 bg-[var(--accent-color)]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover:scale-110 opacity-60" />
          
          <div className="transform-gpu flex flex-col sm:flex-row justify-between items-start gap-6 mb-10 relative z-10">
            <div className="transform-gpu flex items-center gap-6 md:gap-8">
              <div className="transform-gpu relative shrink-0">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="transform-gpu w-24 h-24 md:w-28 md:h-28 border-[6px] border-[var(--bg-secondary)] bg-[var(--bg-primary)] rounded-full flex items-center justify-center shadow-inner relative z-10"
                >
                   <span className="transform-gpu text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[var(--accent-color)] to-fuchsia-500">
                     {data.stats?.currentLevel}
                   </span>
                </motion.div>
                <div className="transform-gpu absolute inset-0 rounded-full border-2 border-[var(--accent-color)]/20 scale-110 opacity-50" />
                <div className="transform-gpu absolute -bottom-2 -right-2 bg-[var(--accent-color)] p-2.5 rounded-2xl shadow-lg z-20 text-[var(--bg-primary)]">
                  <Trophy size={18} fill="currentColor" />
                </div>
              </div>
              <div>
                <h3 className="transform-gpu text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] mb-2 italic opacity-40">Cognitive Tier</h3>
                <p className="transform-gpu text-2xl md:text-4xl font-black tracking-tight uppercase text-[var(--text-primary)] italic">Advanced Learner</p>
              </div>
            </div>
            
            <div className="transform-gpu text-left sm:text-right shrink-0">
              <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 italic opacity-40">Smart Status</p>
              <div className="transform-gpu flex items-center gap-2 justify-start sm:justify-end bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20">
                <Activity size={16} className="transform-gpu text-emerald-500 animate-pulse" />
                <span className="transform-gpu text-sm md:text-lg font-black font-mono text-emerald-500 tracking-tighter">SYNCED</span>
              </div>
            </div>
          </div>

          <div className="transform-gpu relative z-10 space-y-4">
            <div className="transform-gpu flex justify-between text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] px-1 italic">
              <span className="transform-gpu text-[var(--text-secondary)]">Current XP: <span className="transform-gpu text-[var(--text-primary)]">{data.stats?.totalXP}</span></span>
              <span className="transform-gpu text-[var(--accent-color)] text-right">Next Level: {Math.round((data.stats?.nextLevelXP || 0) - (data.stats?.totalXP || 0))} XP</span>
            </div>
            <div className="transform-gpu h-6 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)] p-1 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpProgress)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="transform-gpu h-full bg-gradient-to-r from-[var(--accent-color)] via-fuchsia-500 to-rose-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)] relative overflow-hidden"
              >
                <div className="transform-gpu absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Load Biosensor Gauge */}
        <motion.div 
          variants={item}
          className="transform-gpu lg:col-span-4 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-color)] p-10 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all"
        >
           <div className="transform-gpu relative w-40 h-40 md:w-44 md:h-44 mb-6 transition-transform duration-500 group-hover:scale-105 shrink-0">
              <svg className="transform-gpu w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="transform-gpu text-[var(--bg-secondary)]" />
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
                 <span className={`text-4xl md:text-5xl font-black tracking-tighter ${loadColor} italic`}>{Math.round(data.dailyLoadPercentage || 0)}%</span>
                 <span className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 italic opacity-40">Daily Load</span>
              </div>
           </div>
           <h4 className="transform-gpu text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-2 italic">Smart Capacity</h4>
           <p className="transform-gpu text-[11px] text-[var(--text-secondary)] font-bold max-w-50 leading-relaxed wrap-break-word italic opacity-60">
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
          className="transform-gpu lg:col-span-7 bg-gradient-to-br from-[var(--accent-color)] to-indigo-900 rounded-[3.5rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl shadow-[var(--accent-color)]/20"
        >
          <div className="transform-gpu absolute -right-10 -top-10 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000 scale-150">
            <Cpu size={280} />
          </div>
          
          <div className="transform-gpu relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="transform-gpu flex items-center gap-4 mb-8">
                <div className="transform-gpu bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 shadow-lg shrink-0">
                  <span className="transform-gpu text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Next Unit</span>
                </div>
                <div className="transform-gpu h-px w-8 md:w-12 bg-white/20 shrink-0" />
                <span className="transform-gpu text-[10px] font-black text-white/60 uppercase tracking-widest truncate w-full block italic">
                  {data.globalNextUnit?.track?.title || "System Hub Idle"}
                </span>
              </div>

              <h2 className="transform-gpu text-3xl md:text-5xl font-black tracking-tight mb-6 leading-[1.05] max-w-lg uppercase italic drop-shadow-sm wrap-break-word">
                {data.globalNextUnit?.title || "Initialize a new learning path."}
              </h2>
              
              <p className="transform-gpu text-white/80 font-bold text-sm md:text-base max-w-md line-clamp-3 leading-relaxed tracking-wide wrap-break-word italic opacity-90">
                {data.globalNextUnit?.description || "Select a step from your active paths to resume learning."}
              </p>
            </div>

            <div className="transform-gpu mt-10 md:mt-12 shrink-0">
              {data.globalNextUnit ? (
                renderLink({
                  href: `/dashboard/study/${data.globalNextUnit.track.id}`,
                  className: "inline-flex items-center justify-center w-full sm:w-auto gap-5 bg-white text-[var(--accent-color)] px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all shadow-2xl hover:scale-105 active:scale-95 group/btn italic",
                  children: (
                    <>
                      <PlayCircle size={22} fill="currentColor" className="transform-gpu group-hover/btn:rotate-12 transition-transform text-[var(--accent-color)] shrink-0" />
                      <span>Resume Protocol</span>
                    </>
                  )
                })
              ) : (
                <button disabled className="transform-gpu inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-white/10 text-white/40 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest cursor-not-allowed border border-white/5 italic">
                  Standby
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Smart Decay (Review) */}
        <motion.div variants={item} className="transform-gpu lg:col-span-5 flex flex-col gap-8">
           <div className="transform-gpu bg-[var(--bg-card)] rounded-[3.5rem] border border-[var(--border-color)] p-8 md:p-10 shadow-xl flex-1 flex flex-col relative overflow-hidden min-h-75 max-h-112.5">
              <div className="transform-gpu flex items-center justify-between mb-8 px-2 relative z-10 shrink-0">
                <h3 className="transform-gpu text-[10px] md:text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] flex items-center gap-3 italic opacity-40">
                  <History size={18} className="transform-gpu text-[var(--accent-color)] shrink-0" />
                  <span>Smart Decay</span>
                </h3>
                <span className="transform-gpu bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-black px-4 py-2 rounded-xl border border-[var(--accent-color)]/20 shadow-sm shrink-0 whitespace-nowrap italic">
                  {data.dueRevisions?.length || 0} Lessons
                </span>
              </div>

              <div className="transform-gpu space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {data.dueRevisions && data.dueRevisions.length > 0 ? (
                  data.dueRevisions.map((unit) => (
                    <React.Fragment key={unit.id}>
                      {renderLink({
                        href: `/dashboard/study/${unit.trackId}`,
                        className: "group block p-5 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-card)] transition-all duration-300 shadow-sm hover:shadow-xl",
                        children: (
                          <>
                            <div className="transform-gpu flex justify-between items-start mb-2 gap-2">
                              <span className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest truncate w-full italic opacity-40">
                                {unit.track.title}
                              </span>
                              <ArrowRight size={14} className="transform-gpu group-hover:translate-x-1 transition-transform text-[var(--accent-color)] shrink-0 opacity-40 group-hover:opacity-100" />
                            </div>
                            <p className="transform-gpu text-sm font-black text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--accent-color)] transition-colors uppercase tracking-tight wrap-break-word italic">
                              {unit.title}
                            </p>
                          </>
                        )
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="transform-gpu h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                    <div className="transform-gpu bg-[var(--bg-secondary)] p-8 rounded-full mb-6 border border-[var(--border-color)] shadow-inner">
                      <Brain size={48} className="transform-gpu text-[var(--text-secondary)]" />
                    </div>
                    <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] italic">Retention Stable</p>
                  </div>
                )}
              </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="transform-gpu grid grid-cols-2 gap-4 md:gap-6 w-full">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="transform-gpu bg-[var(--bg-card)] p-6 md:p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl flex flex-col items-center justify-center text-center gap-3 group transition-all"
              >
                 <div className="transform-gpu bg-amber-500/10 p-4 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm shrink-0">
                    <Flame size={24} fill="currentColor" />
                 </div>
                 <div>
                    <p className="transform-gpu text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none italic">{data.streak}</p>
                    <p className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 italic opacity-40">Day Streak</p>
                 </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="transform-gpu bg-[var(--bg-card)] p-6 md:p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl flex flex-col items-center justify-center text-center gap-3 group transition-all"
              >
                 <div className="transform-gpu bg-[var(--accent-color)]/10 p-4 rounded-2xl text-[var(--accent-color)] group-hover:bg-[var(--accent-color)] group-hover:text-[var(--bg-primary)] transition-all shadow-sm shrink-0">
                    <Clock size={24} />
                 </div>
                 <div>
                    <p className="transform-gpu text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none italic">{Math.floor(data.weeklyTimeMinutes / 60)}h</p>
                    <p className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 italic opacity-40">Focus Time</p>
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
            <motion.div variants={item} className="transform-gpu bg-slate-950 rounded-[2.5rem] p-8 flex gap-6 items-center border border-rose-500/20 shadow-2xl relative overflow-hidden">
              <div className="transform-gpu absolute inset-0 bg-rose-500/5 animate-pulse" />
              <div className="transform-gpu p-4 bg-rose-600 text-white rounded-2xl shadow-lg relative z-10 shrink-0">
                <AlertCircle size={28} />
              </div>
              <div className="transform-gpu relative z-10">
                <p className="transform-gpu text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-1 italic">Burnout Warning</p>
                <p className="transform-gpu text-sm font-black text-white leading-tight wrap-break-word italic uppercase tracking-tight">Critical neural fatigue. Initiate rest protocol.</p>
              </div>
            </motion.div>
          )}
          {data.overloadRisk && (
            <motion.div variants={item} className="transform-gpu bg-[var(--bg-card)] rounded-[2.5rem] p-8 flex gap-6 items-center border border-amber-500/20 shadow-xl shadow-amber-500/5">
              <div className="transform-gpu p-4 bg-amber-500/10 text-amber-500 rounded-2xl shadow-sm shrink-0">
                <Zap size={28} fill="currentColor" />
              </div>
              <div>
                <p className="transform-gpu text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1 italic opacity-60">Overload Risk</p>
                <p className="transform-gpu text-sm font-black text-[var(--text-primary)] leading-tight wrap-break-word italic uppercase tracking-tight">Load exceeds capacity. Decouple {data.recommendedReduction} nodes.</p>
              </div>
            </motion.div>
          )}
          {data.contextSwitchRisk && (
            <motion.div variants={item} className="transform-gpu bg-[var(--bg-card)] rounded-[2.5rem] p-8 flex gap-6 items-center border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
              <div className="transform-gpu p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl shadow-sm shrink-0">
                <BarChart3 size={28} />
              </div>
              <div>
                <p className="transform-gpu text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 italic opacity-60">Focus Diffusion</p>
                <p className="transform-gpu text-sm font-black text-[var(--text-primary)] leading-tight wrap-break-word italic uppercase tracking-tight">Context switching high. Prioritize top nodes.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
