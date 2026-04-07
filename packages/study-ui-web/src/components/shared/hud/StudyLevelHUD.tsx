"use client";

import { Trophy, Zap, Target } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { DashboardData } from '@gritorquit/study-core';

interface StudyLevelHUDProps {
  stats: DashboardData['stats'];
}

export function StudyLevelHUD({ stats }: StudyLevelHUDProps) {
  if (!stats) return null;

  const xpProgress = (stats.totalXP / stats.nextLevelXP) * 100;

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: springConfig }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      className="transform-gpu bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 sm:p-10 md:p-14 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500 relative overflow-hidden group h-full flex flex-col justify-center min-h-[400px] md:min-h-[450px] transform-gpu antialiased"
    >
      {/* Moving Interior Glass Gradient */}
      <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />

      {/* Soft Ethereal Corner Glow */}
      <div className="transform-gpu absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-rose-200/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
      
      <div className="transform-gpu flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 md:gap-12 relative z-10 w-full">
        
        <div className="transform-gpu flex flex-col sm:flex-row items-center sm:items-start gap-8 md:gap-10 w-full lg:w-auto text-center sm:text-left">
          
          {/* Level Badge Orb */}
          <div className="transform-gpu relative shrink-0 group/badge cursor-default">
            <motion.div 
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 1, type: "spring", bounce: 0.5 }}
              className="transform-gpu w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 border-[8px] md:border-[10px] border-white bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-[2.5rem] md:rounded-[3rem] rotate-3 flex items-center justify-center shadow-[0_10px_30px_rgba(244,63,94,0.3)] group-hover/badge:shadow-[0_15px_40px_rgba(244,63,94,0.4)] group-hover/badge:-rotate-3 transition-all duration-500 relative overflow-hidden"
            >
               {/* Internal Shimmer */}
               <div className="transform-gpu absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/badge:animate-[shimmer_2s_infinite] skew-x-12" />
               
               <span className="transform-gpu text-5xl md:text-6xl lg:text-7xl font-bold text-white italic tracking-tighter drop-shadow-md relative z-10">
                 {stats.currentLevel}
               </span>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.1, rotate: 12 }}
              className="transform-gpu absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-white p-3 md:p-4 rounded-2xl shadow-xl shadow-slate-200/50 z-20 text-rose-500 border border-slate-100"
            >
              <Trophy size={20} className="transform-gpu md:w-6 md:h-6" fill="currentColor" />
            </motion.div>
          </div>

          <div className="transform-gpu space-y-4 pt-2 md:pt-4">
            <div className="transform-gpu flex items-center justify-center sm:justify-start gap-3">
              <div className="transform-gpu p-2 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Zap size={14} className="transform-gpu fill-rose-500" />
              </div>
              <h3 className="transform-gpu text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Learning Rank</h3>
            </div>
            <div>
              <p className="transform-gpu text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase text-slate-900 leading-[0.95] group-hover:text-rose-950 transition-colors">
                Advanced<br/>Tier
              </p>
              <p className="transform-gpu text-[10px] md:text-xs font-bold text-rose-500 uppercase tracking-[0.3em] mt-4 bg-rose-50 px-4 py-2 rounded-lg inline-block border border-rose-100 shadow-sm">
                Level {stats.currentLevel} Student
              </p>
            </div>
          </div>
        </div>
        
        {/* Status / Goal Area */}
        <div className="transform-gpu flex flex-col items-center lg:items-end shrink-0 space-y-4 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-2">
          <div className="transform-gpu flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-4 md:py-5 rounded-2xl border border-emerald-100 shadow-sm group-hover:border-emerald-200 transition-colors">
            <div className="transform-gpu relative flex h-3 w-3">
              <span className="transform-gpu animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="transform-gpu relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </div>
            <span className="transform-gpu text-sm md:text-base font-bold font-mono text-emerald-600 tracking-tighter uppercase mt-0.5">Goal Reached</span>
          </div>
          <div className="transform-gpu flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Target size={12} />
            <p className="transform-gpu text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5">Course Progress: 99.4%</p>
          </div>
        </div>

      </div>

      {/* XP Bar Section */}
      <div className="transform-gpu relative z-10 space-y-5 mt-12 md:mt-16 w-full">
        <div className="transform-gpu flex justify-between items-end px-2">
          <div className="transform-gpu flex flex-col gap-1.5">
            <span className="transform-gpu text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Current Points</span>
            <span className="transform-gpu text-slate-800 text-xl md:text-2xl font-bold tracking-tighter">{stats.totalXP.toLocaleString()} XP</span>
          </div>
          <div className="transform-gpu flex flex-col gap-1.5 items-end">
            <span className="transform-gpu text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500">Next Level</span>
            <span className="transform-gpu text-slate-800 text-xl md:text-2xl font-bold tracking-tighter">{Math.round(stats.nextLevelXP - stats.totalXP).toLocaleString()} XP</span>
          </div>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="transform-gpu h-4 md:h-5 w-full bg-slate-100/80 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, xpProgress)}%` }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
            className="transform-gpu h-full bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.4)] relative overflow-hidden"
          >
            {/* Shimmer Overlay */}
            <div className="transform-gpu absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] -translate-x-full skew-x-12" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}