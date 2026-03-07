"use client";

import React from 'react';
import { Flame, Clock, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsOverviewProps {
  streak: number;
  weeklyTimeMinutes: number;
}

export function StatsOverview({ streak, weeklyTimeMinutes }: StatsOverviewProps) {
  const stats = [
    { 
      label: 'Day Streak', 
      value: streak, 
      icon: Flame, 
      baseColor: 'bg-orange-50 text-orange-500 border-orange-100',
      hoverColor: 'group-hover:bg-gradient-to-br group-hover:from-orange-400 group-hover:to-rose-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(249,115,22,0.4)] group-hover:border-transparent',
      iconAnim: 'group-hover:scale-110'
    },
    { 
      label: 'Study Time', 
      value: `${Math.floor(weeklyTimeMinutes / 60)}h`, 
      icon: Clock, 
      baseColor: 'bg-fuchsia-50 text-fuchsia-500 border-fuchsia-100',
      hoverColor: 'group-hover:bg-gradient-to-br group-hover:from-fuchsia-400 group-hover:to-purple-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(217,70,239,0.4)] group-hover:border-transparent',
      iconAnim: 'group-hover:rotate-45'
    },
    { 
      label: 'Efficiency', 
      value: 'High', 
      icon: TrendingUp, 
      baseColor: 'bg-emerald-50 text-emerald-500 border-emerald-100',
      hoverColor: 'group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] group-hover:border-transparent',
      iconAnim: 'group-hover:-translate-y-1 group-hover:translate-x-1'
    },
    { 
      label: 'Last Sync', 
      value: 'Today', 
      icon: Calendar, 
      baseColor: 'bg-blue-50 text-blue-500 border-blue-100',
      hoverColor: 'group-hover:bg-gradient-to-br group-hover:from-blue-400 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(59,130,246,0.4)] group-hover:border-transparent',
      iconAnim: 'group-hover:scale-110 group-hover:-rotate-12'
    },
  ];

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 w-full h-full transform-gpu antialiased">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: idx * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-rose-100/50 flex flex-col items-center justify-center text-center gap-4 md:gap-5 group transition-all duration-500 relative overflow-hidden"
          >
            {/* Subtle Internal Shimmer Canvas */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none -z-10" />
            
            {/* Icon Container */}
            <div className={`p-3.5 md:p-4 rounded-[1.25rem] border shadow-sm transition-all duration-500 shrink-0 ${stat.baseColor} ${stat.hoverColor}`}>
              {/* Dynamic Icon with individual micro-interactions */}
              <Icon size={24} strokeWidth={2.5} className={`transition-transform duration-500 ${stat.iconAnim}`} />
            </div>
            
            {/* Text Content */}
            <div className="min-w-0">
              <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none mb-1.5 md:mb-2 truncate group-hover:text-slate-800 transition-colors">
                {stat.value}
              </p>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] truncate group-hover:text-slate-500 transition-colors">
                {stat.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}