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
          className="transform-gpu lg:col-span-8 min-w-0 bg-[var(--bg-card)]/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-[var(--border-color)] shadow-2xl relative overflow-hidden group hover:shadow-[var(--accent-color)]/10 transition-all duration-500"
        >
          {/* Soft Ethereal Glow */}
          <div className="transform-gpu absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-color)]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover:scale-110 opacity-60" />
          
          <div className="transform-gpu flex flex-col sm:flex-row justify-between items-start gap-6 mb-10 relative z-10 min-w-0">
            <div className="transform-gpu flex items-center gap-6 md:gap-8 min-w-0">
              <div className="transform-gpu relative shrink-0">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="transform-gpu w-24 h-24 md:w-28 md:h-28 border-[6px] border-[var(--bg-card)] bg-[var(--bg-secondary)] rounded-full flex items-center justify-center shadow-lg relative z-10"
                >
                   <span className="transform-gpu text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[var(--accent-color)] to-sky-500 drop-shadow-sm">
                     {data.stats?.currentLevel}
                   </span>
                </motion.div>
                <div className="transform-gpu absolute inset-0 rounded-full border-2 border-[var(--accent-color)]/20 scale-110 opacity-50" />
                <div className="transform-gpu absolute -bottom-2 -right-2 bg-gradient-to-br from-[var(--accent-color)] to-sky-600 p-2.5 rounded-2xl shadow-xl z-20 text-[var(--bg-primary)] border border-[var(--accent-color)]/30">
                  <Trophy size={18} fill="currentColor" />
                </div>
              </div>
              <div className="transform-gpu min-w-0 text-left">
                <h3 className="transform-gpu text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] mb-2 truncate italic">Cognitive Tier</h3>
                <p className="transform-gpu text-2xl md:text-4xl font-black tracking-tighter uppercase text-[var(--text-primary)] truncate italic">Advanced Learner</p>
              </div>
            </div>
            
            <div className="transform-gpu text-left sm:text-right shrink-0">
              <p className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-2">Neural Status</p>
              <div className="transform-gpu flex items-center gap-2 justify-start sm:justify-end bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-sm">
                <Activity size={14} className="transform-gpu text-emerald-500 animate-pulse drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]" />
                <span className="transform-gpu text-sm md:text-base font-black font-mono text-emerald-500 tracking-tighter italic uppercase">Synced</span>
              </div>
            </div>
          </div>

          <div className="transform-gpu relative z-10 space-y-4 text-left">
            <div className="transform-gpu flex justify-between text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] px-1">
              <span className="transform-gpu text-[var(--text-secondary)]">Current XP: <span className="transform-gpu text-[var(--text-primary)]">{data.stats?.totalXP}</span></span>
              <span className="transform-gpu text-[var(--accent-color)] text-right italic">Next Level: {Math.round((data.stats?.nextLevelXP || 0) - (data.stats?.totalXP || 0))} XP</span>
            </div>
            <div className="transform-gpu h-5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)] p-0.5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpProgress)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="transform-gpu h-full bg-gradient-to-r from-[var(--accent-color)] to-sky-500 rounded-full shadow-lg relative overflow-hidden"
              >
                <div className="transform-gpu absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Load Biosensor Gauge */}
        <motion.div 
          variants={item}
          className="transform-gpu lg:col-span-4 min-w-0 bg-[var(--bg-card)]/40 backdrop-blur-xl rounded-[3rem] border border-[var(--border-color)] shadow-2xl p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-[var(--accent-color)]/10 transition-all duration-500"
        >
           <div className="transform-gpu relative w-40 h-40 md:w-44 md:h-44 mb-6 transition-transform duration-700 group-hover:scale-105 shrink-0">
              <svg className="transform-gpu w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="transform-gpu text-[var(--bg-secondary)]" />
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
                 <span className={`text-4xl md:text-5xl font-black tracking-tighter italic uppercase ${loadColor}`}>{Math.round(data.dailyLoadPercentage || 0)}%</span>
                 <span className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">Daily Load</span>
              </div>
           </div>
           <h4 className="transform-gpu text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-2 italic">Neural Capacity</h4>
           <p className="transform-gpu text-[11px] text-[var(--text-secondary)] font-bold max-w-[200px] leading-relaxed break-words uppercase tracking-tighter">
             Optimized Trajectory Based on 14-day Cycle
           </p>
        </motion.div>
      </div>

      {/* SECTION 2: PROTOCOLS & REVISIONS */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-12 gap-8 w-full min-w-0">
        
        {/* Priority Protocol Engage (Main Active Course Card) */}
        <motion.div 
          variants={item}
          className="transform-gpu lg:col-span-7 min-w-0 bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl hover:shadow-[var(--accent-color)]/10 transition-all duration-500 flex flex-col justify-between"
        >
          {/* Internal Moving Glass Gradient */}
          <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[var(--accent-color)]/5 via-transparent to-sky-500/5 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />
          
          <div className="transform-gpu absolute -right-10 -top-10 p-10 opacity-[0.03] text-[var(--accent-color)] group-hover:-rotate-12 transition-transform duration-1000 scale-150 pointer-events-none">
            <Cpu size={280} />
          </div>
          
          <div className="transform-gpu relative z-10 flex flex-col h-full min-w-0 text-left">
            <div className="transform-gpu min-w-0 flex-1">
              <div className="transform-gpu flex items-center gap-4 mb-8">
                <div className="transform-gpu bg-[var(--accent-color)]/10 px-4 py-2 rounded-xl border border-[var(--accent-color)]/20 shadow-sm shrink-0 flex items-center gap-1.5">
                  <Zap size={12} className="transform-gpu text-[var(--accent-color)] fill-current" />
                  <span className="transform-gpu text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] mt-0.5">Priority Vector</span>
                </div>
                <div className="transform-gpu h-px w-8 md:w-12 bg-[var(--border-color)] shrink-0" />
                <span className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest truncate min-w-0 w-full block mt-0.5 italic">
                  {data.globalNextUnit?.track?.title || "No Track Locked"}
                </span>
              </div>

              <h2 className="transform-gpu text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-[1.05] max-w-lg break-words whitespace-normal text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors italic uppercase">
                {data.globalNextUnit?.title || "Neural engine idle. Initialize a learning vector."}
              </h2>
              
              <p className="transform-gpu text-[var(--text-secondary)] font-bold text-sm md:text-base max-w-md line-clamp-3 overflow-hidden leading-relaxed tracking-wide break-words whitespace-normal uppercase tracking-tighter">
                {data.globalNextUnit?.description || "Select a module from your active tracks to resume ingestion."}
              </p>
            </div>

            <div className="transform-gpu mt-10 md:mt-12 shrink-0">
              {data.globalNextUnit ? (
                renderLink({
                  href: `/dashboard/study/${data.globalNextUnit.track.id}`,
                  className: "inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-gradient-to-r from-[var(--accent-color)] to-sky-600 text-[var(--bg-primary)] px-8 py-4 md:py-5 rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-xl hover:opacity-90 hover:-translate-y-1 transition-all duration-300 active:scale-95 group/btn border border-[var(--accent-color)]/20 overflow-hidden relative",
                  children: (
                    <>
                      {/* Button Glass Shimmer */}
                      <div className="transform-gpu absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                      <PlayCircle size={22} fill="currentColor" className="transform-gpu group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform duration-300 relative z-10" />
                      <span className="transform-gpu truncate relative z-10 italic">Resume Optimization</span>
                    </>
                  )
                })
              ) : (
                <button disabled className="transform-gpu inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-8 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest cursor-not-allowed border border-[var(--border-color)] italic opacity-50">
                  Standby
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Neural Decay (Review) & Quick Stats */}
        <motion.div variants={item} className="transform-gpu lg:col-span-5 min-w-0 flex flex-col gap-8">
           
           {/* Review Pipeline Card */}
           <div className="transform-gpu bg-[var(--bg-card)]/40 backdrop-blur-xl rounded-[3.5rem] border border-[var(--border-color)] p-8 md:p-10 shadow-2xl flex-1 flex flex-col relative overflow-hidden min-h-[300px] max-h-[450px] group hover:shadow-[var(--accent-color)]/10 transition-all duration-500">
              <div className="transform-gpu flex items-center justify-between mb-8 px-2 relative z-10 shrink-0 text-left">
                <h3 className="transform-gpu text-[10px] md:text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] flex items-center gap-3 italic">
                  <History size={16} className="transform-gpu text-[var(--accent-color)] shrink-0 group-hover:-rotate-45 transition-transform duration-500" />
                  <span className="transform-gpu truncate mt-0.5">Review Pipeline</span>
                </h3>
                <span className="transform-gpu bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-black px-3 py-1.5 rounded-xl border border-[var(--accent-color)]/20 shadow-sm shrink-0 whitespace-nowrap italic">
                  {data.dueRevisions?.length || 0} Critical
                </span>
              </div>

              <div className="transform-gpu space-y-3 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 relative z-10">
                {data.dueRevisions && data.dueRevisions.length > 0 ? (
                  data.dueRevisions.map((unit) => (
                    <React.Fragment key={unit.id}>
                      {renderLink({
                        href: `/dashboard/study/${unit.trackId}`,
                        className: "group/item block p-4 md:p-5 rounded-[2rem] bg-[var(--bg-secondary)]/40 border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-secondary)] shadow-sm transition-all duration-300 min-w-0",
                        children: (
                          <>
                            <div className="transform-gpu flex justify-between items-start mb-2 gap-2 min-w-0 text-left">
                              <span className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest truncate w-full group-hover/item:text-[var(--accent-color)] transition-colors mt-0.5 italic">
                                {unit.track.title}
                              </span>
                              <ArrowRight size={14} className="transform-gpu text-[var(--text-secondary)]/30 group-hover/item:translate-x-1 transition-transform group-hover/item:text-[var(--accent-color)] shrink-0" />
                            </div>
                            <p className="transform-gpu text-sm font-black text-[var(--text-primary)] line-clamp-1 group-hover/item:text-[var(--text-primary)] transition-all tracking-tight break-words uppercase italic text-left">
                              {unit.title}
                            </p>
                          </>
                        )
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="transform-gpu h-full flex flex-col items-center justify-center text-center p-8 opacity-30 italic">
                    <div className="transform-gpu bg-[var(--bg-secondary)] p-6 rounded-full mb-4 shrink-0 border border-[var(--border-color)] shadow-inner">
                      <Brain size={40} className="transform-gpu text-[var(--text-secondary)]" />
                    </div>
                    <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Retention Stable</p>
                  </div>
                )}
              </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="transform-gpu grid grid-cols-2 gap-4 md:gap-6 w-full min-w-0">
              <motion.div 
                whileHover={{ y: -4 }}
                className="transform-gpu bg-[var(--bg-card)]/40 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl hover:shadow-[var(--accent-color)]/10 flex flex-col items-center justify-center text-center gap-4 group min-w-0 transition-all duration-500"
              >
                 <div className="transform-gpu bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-[var(--bg-primary)] transition-all duration-500 shadow-sm shrink-0">
                    <Flame size={24} fill="currentColor" className="transform-gpu group-hover:scale-110 transition-transform" />
                 </div>
                 <div className="transform-gpu min-w-0">
                    <p className="transform-gpu text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tighter leading-none truncate italic uppercase">{data.streak}</p>
                    <p className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 truncate italic">Day Streak</p>
                 </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -4 }}
                className="transform-gpu bg-[var(--bg-card)]/40 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl hover:shadow-[var(--accent-color)]/10 flex flex-col items-center justify-center text-center gap-4 group min-w-0 transition-all duration-500"
              >
                 <div className="transform-gpu bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 p-3 rounded-2xl text-[var(--accent-color)] group-hover:bg-[var(--accent-color)] group-hover:text-[var(--bg-primary)] transition-all duration-500 shadow-sm shrink-0">
                    <Clock size={24} className="transform-gpu group-hover:rotate-45 transition-transform duration-500" />
                 </div>
                 <div className="transform-gpu min-w-0">
                    <p className="transform-gpu text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tighter leading-none truncate italic uppercase">{Math.floor(data.weeklyTimeMinutes / 60)}h</p>
                    <p className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 truncate italic">Study Time</p>
                 </div>
              </motion.div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
};