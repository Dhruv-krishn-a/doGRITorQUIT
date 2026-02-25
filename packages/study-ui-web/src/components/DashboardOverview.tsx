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
import { DashboardData } from '@planner/study-core';
import { motion } from 'framer-motion';
import { useStudyUI } from '../context/StudyUIContext';

interface DashboardOverviewProps {
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

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data }) => {
  const { renderLink } = useStudyUI();
  if (!data) return null;

  const xpProgress = data.stats 
    ? (data.stats.totalXP / data.stats.nextLevelXP) * 100 
    : 0;

  // Added drop-shadows to the load colors to make them glow on the dark background
  const loadColor = (data.dailyLoadPercentage || 0) > 90 ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]' : (data.dailyLoadPercentage || 0) > 70 ? 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]' : 'text-fuchsia-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]';

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex-1 min-w-0 space-y-10 font-sans select-none w-full max-w-full overflow-hidden"
    >
      {/* SECTION 1: NEURAL HUD (TOP BAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
        
        {/* Level & XP HUD */}
        <motion.div 
          variants={item}
          // CHANGED: Dark cherry background with a subtle neon pink border glow
          className="lg:col-span-8 min-w-0 bg-[#1c0510] rounded-[3rem] p-6 md:p-10 shadow-[0_0_20px_rgba(244,63,94,0.05)] relative overflow-hidden group border border-rose-500/20 hover:border-rose-500/40 transition-colors duration-500"
        >
          {/* CHANGED: Adjusted blur gradient to blend into the dark theme */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-rose-500/10 to-fuchsia-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover:scale-110 opacity-60" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10 relative z-10 min-w-0">
            <div className="flex items-center gap-6 md:gap-8 min-w-0">
              <div className="relative shrink-0">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  // CHANGED: Level ring background
                  className="w-24 h-24 md:w-28 md:h-28 border-[6px] border-[#14030b] bg-[#2a081a] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.2)] relative z-10"
                >
                   <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-pink-600 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                     {data.stats?.currentLevel}
                   </span>
                </motion.div>
                <div className="absolute inset-0 rounded-full border-2 border-rose-500/30 scale-110 opacity-50" />
                <div className="absolute -bottom-2 -right-2 bg-rose-600 p-2.5 rounded-2xl shadow-[0_0_15px_rgba(225,29,72,0.6)] z-20 text-white border border-rose-400/50">
                  <Trophy size={18} fill="currentColor" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-300/50 mb-2 truncate">Cognitive Tier</h3>
                <p className="text-2xl md:text-4xl font-black tracking-tight uppercase text-rose-50 truncate drop-shadow-sm">Advanced Learner</p>
              </div>
            </div>
            
            <div className="text-left sm:text-right shrink-0">
              <p className="text-[10px] font-black text-rose-300/50 uppercase tracking-widest mb-2">Neural Status</p>
              <div className="flex items-center gap-2 justify-start sm:justify-end bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Activity size={16} className="text-emerald-400 animate-pulse drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                <span className="text-sm md:text-lg font-black font-mono text-emerald-400 tracking-tighter drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">SYNCED</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex justify-between text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] px-1">
              <span className="text-rose-300/50">Current XP: <span className="text-rose-100">{data.stats?.totalXP}</span></span>
              <span className="text-rose-400 text-right">Next Level: {Math.round((data.stats?.nextLevelXP || 0) - (data.stats?.totalXP || 0))} XP</span>
            </div>
            <div className="h-6 w-full bg-[#2a081a] rounded-full overflow-hidden border border-rose-900/50 p-1 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpProgress)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Load Biosensor Gauge */}
        <motion.div 
          variants={item}
          className="lg:col-span-4 min-w-0 bg-[#1c0510] rounded-[3rem] border border-rose-900/40 p-10 shadow-lg shadow-black/50 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-rose-500/30 transition-colors"
        >
           <div className="relative w-40 h-40 md:w-44 md:h-44 mb-6 transition-transform duration-500 group-hover:scale-105 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[#2a081a]" />
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-4xl md:text-5xl font-black tracking-tighter ${loadColor}`}>{Math.round(data.dailyLoadPercentage || 0)}%</span>
                 <span className="text-[10px] font-black text-rose-300/50 uppercase tracking-widest mt-1">Daily Load</span>
              </div>
           </div>
           <h4 className="text-xs font-black text-rose-100 uppercase tracking-[0.2em] mb-2">Neural Capacity</h4>
           <p className="text-[11px] text-rose-200/50 font-bold max-w-[200px] leading-relaxed break-words">
             Optimized based on your 14-day velocity trajectory.
           </p>
        </motion.div>
      </div>

      {/* SECTION 2: PROTOCOLS & REVISIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full min-w-0">
        
        {/* Priority Protocol Engage (Main Active Course Card) */}
        <motion.div 
          variants={item}
          whileHover={{ y: -5 }}
          // CHANGED: Made this the centerpiece with a strong dark gradient and glowing magenta borders
          className="lg:col-span-7 min-w-0 bg-gradient-to-br from-[#2a081a] to-[#1c0510] border border-rose-500 rounded-[3.5rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-[0_0_30px_rgba(244,63,94,0.15)] flex flex-col justify-between"
        >
          {/* Subtle neon grid/glow effect mimicking your image */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-rose-500/10 to-transparent pointer-events-none" />
          
          <div className="absolute -right-10 -top-10 p-10 opacity-5 text-rose-500 group-hover:rotate-12 transition-transform duration-1000 scale-150">
            <Cpu size={280} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-rose-500/20 backdrop-blur-md px-5 py-2 rounded-full border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)] shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-200">Priority Vector</span>
                </div>
                <div className="h-px w-8 md:w-12 bg-rose-500/30 shrink-0" />
                <span className="text-[10px] font-black text-rose-300/80 uppercase tracking-widest truncate min-w-0 w-full block">
                  {data.globalNextUnit?.track?.title || "No Track"}
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-[1.05] max-w-lg drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] break-words whitespace-normal text-white">
                {data.globalNextUnit?.title || "Neural engine idle. Initialize a learning vector."}
              </h2>
              
              <p className="text-rose-200/70 font-bold text-sm md:text-base max-w-md line-clamp-3 overflow-hidden leading-relaxed tracking-wide opacity-90 break-words whitespace-normal">
                {data.globalNextUnit?.description || "Select a module from your active tracks to resume ingestion."}
              </p>
            </div>

            <div className="mt-10 md:mt-12 shrink-0">
              {data.globalNextUnit ? (
                renderLink({
                  href: `/dashboard/study/${data.globalNextUnit.track.id}`,
                  // CHANGED: Button now matches the bright glowing pink/gradient style
                  className: "inline-flex items-center justify-center w-full sm:w-auto gap-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:from-rose-400 hover:to-pink-500 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:scale-105 active:scale-95 group/btn border border-rose-400/50",
                  children: (
                    <>
                      <PlayCircle size={22} fill="currentColor" className="group-hover/btn:rotate-12 transition-transform text-white shrink-0 drop-shadow-md" />
                      <span className="truncate drop-shadow-md">Resume Optimization</span>
                    </>
                  )
                })
              ) : (
                <button disabled className="inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-[#2a081a] text-rose-500/50 px-8 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest cursor-not-allowed border border-rose-900/40">
                  Standby
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Neural Decay (Review) */}
        <motion.div variants={item} className="lg:col-span-5 min-w-0 flex flex-col gap-8">
           <div className="bg-[#1c0510] rounded-[3.5rem] border border-rose-900/40 p-8 md:p-10 shadow-lg shadow-black/50 flex-1 flex flex-col relative overflow-hidden min-h-[300px] max-h-[450px]">
              <div className="flex items-center justify-between mb-8 px-2 relative z-10 shrink-0">
                <h3 className="text-[10px] md:text-xs font-black text-rose-300/50 uppercase tracking-[0.4em] flex items-center gap-3">
                  <History size={18} className="text-rose-500 shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  <span className="truncate">Review Pipeline</span>
                </h3>
                <span className="bg-[#2a081a] text-rose-400 text-[10px] font-black px-3 py-1.5 rounded-xl border border-rose-500/20 shadow-sm shrink-0 whitespace-nowrap">
                  {data.dueRevisions?.length || 0} Critical
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 relative z-10">
                {data.dueRevisions && data.dueRevisions.length > 0 ? (
                  data.dueRevisions.map((unit) => (
                    <React.Fragment key={unit.id}>
                      {renderLink({
                        href: `/dashboard/study/${unit.trackId}`,
                        // CHANGED: List items to fit dark theme
                        className: "group block p-4 md:p-5 rounded-[2rem] bg-[#2a081a]/50 border border-rose-900/40 hover:border-rose-500/50 hover:bg-[#2a081a] hover:shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all duration-300 min-w-0",
                        children: (
                          <>
                            <div className="flex justify-between items-start mb-2 gap-2 min-w-0">
                              <span className="text-[9px] font-black text-rose-300/50 uppercase tracking-widest truncate w-full">
                                {unit.track.title}
                              </span>
                              <ArrowRight size={14} className="text-rose-500/50 group-hover:translate-x-1 transition-transform group-hover:text-rose-400 shrink-0" />
                            </div>
                            <p className="text-sm font-bold text-rose-100 line-clamp-1 group-hover:text-rose-400 group-hover:drop-shadow-[0_0_5px_rgba(244,63,94,0.5)] transition-all uppercase tracking-tight break-words">
                              {unit.title}
                            </p>
                          </>
                        )
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <div className="bg-[#2a081a] p-6 rounded-full mb-4 shrink-0 border border-rose-900/50">
                      <Brain size={40} className="text-rose-500/30" />
                    </div>
                    <p className="text-xs font-black text-rose-300/50 uppercase tracking-[0.3em]">Retention Stable</p>
                  </div>
                )}
              </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="grid grid-cols-2 gap-4 md:gap-6 w-full min-w-0">
              <motion.div className="bg-[#1c0510] p-6 md:p-8 rounded-[2.5rem] border border-rose-900/40 shadow-lg shadow-black/50 flex flex-col items-center justify-center text-center gap-3 group min-w-0 hover:border-rose-500/30 transition-colors">
                 <div className="bg-[#2a081a] border border-rose-500/20 p-3 rounded-2xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] shrink-0">
                    <Flame size={24} fill="currentColor" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-2xl md:text-3xl font-black text-rose-50 tracking-tighter leading-none truncate">{data.streak}</p>
                    <p className="text-[9px] font-black text-rose-300/50 uppercase tracking-widest mt-1 truncate">Day Streak</p>
                 </div>
              </motion.div>
              <motion.div className="bg-[#1c0510] p-6 md:p-8 rounded-[2.5rem] border border-rose-900/40 shadow-lg shadow-black/50 flex flex-col items-center justify-center text-center gap-3 group min-w-0 hover:border-rose-500/30 transition-colors">
                 <div className="bg-[#2a081a] border border-rose-500/20 p-3 rounded-2xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] shrink-0">
                    <Clock size={24} />
                 </div>
                 <div className="min-w-0">
                    <p className="text-2xl md:text-3xl font-black text-rose-50 tracking-tighter leading-none truncate">{Math.floor(data.weeklyTimeMinutes / 60)}h</p>
                    <p className="text-[9px] font-black text-rose-300/50 uppercase tracking-widest mt-1 truncate">Study Time</p>
                 </div>
              </motion.div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
};