"use client";

import { Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardData } from '@planner/study-core';

interface StudyLevelHUDProps {
  stats: DashboardData['stats'];
}

export function StudyLevelHUD({ stats }: StudyLevelHUDProps) {
  if (!stats) return null;

  const xpProgress = (stats.totalXP / stats.nextLevelXP) * 100;

  return (
    <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-slate-100/50 border border-slate-100 relative overflow-hidden group h-full flex flex-col justify-center min-h-[450px]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
        <div className="flex items-center gap-10">
          <div className="relative shrink-0">
            <motion.div 
              initial={{ rotate: -5, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-32 h-32 md:w-40 md:h-40 border-[10px] border-white bg-slate-900 rounded-full flex items-center justify-center shadow-2xl shadow-slate-200 relative z-10 overflow-hidden"
            >
               <span className="text-5xl md:text-7xl font-black text-white italic tracking-tighter">
                 {stats.currentLevel}
               </span>
               <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
            </motion.div>
            <div className="absolute -bottom-2 -right-2 bg-pink-600 p-3.5 rounded-2xl shadow-xl shadow-pink-200 z-20 text-white border-4 border-white group-hover:scale-110 transition-transform">
              <Trophy size={20} fill="currentColor" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-900 rounded-lg shadow-sm">
                <Zap size={14} fill="currentColor" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Learning Rank</h3>
            </div>
            <div>
              <p className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-slate-900 leading-[0.9]">Advanced<br/>Tier</p>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.3em] mt-3">Level {stats.currentLevel} Student</p>
            </div>
          </div>
        </div>
        
        <div className="text-center md:text-right shrink-0 space-y-4">
          <div className="flex items-center gap-3 justify-center md:justify-end bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm md:text-base font-black font-mono text-emerald-600 tracking-tighter uppercase">Goal Reached</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Course Progress: 99.4%</p>
        </div>
      </div>

      <div className="relative z-10 space-y-6 mt-16 w-full">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.25em] px-2">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400">Current Points</span>
            <span className="text-slate-900 text-lg tracking-tighter">{stats.totalXP} XP</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-rose-600">Points to Next Level</span>
            <span className="text-slate-900 text-lg tracking-tighter">{Math.round(stats.nextLevelXP - stats.totalXP)} XP</span>
          </div>
        </div>
        <div className="h-5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1 shadow-inner relative group/bar">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, xpProgress)}%` }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-slate-900 rounded-full shadow-lg relative overflow-hidden"
          >
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent" 
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
