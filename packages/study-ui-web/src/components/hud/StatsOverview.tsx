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
    { label: 'Day Streak', value: streak, icon: <Flame size={20} />, color: 'orange' },
    { label: 'Study Time', value: `${Math.floor(weeklyTimeMinutes / 60)}h`, icon: <Clock size={20} />, color: 'pink' },
    { label: 'Efficiency', value: 'High', icon: <TrendingUp size={20} />, color: 'emerald' },
    { label: 'Last Sync', value: 'Today', icon: <Calendar size={20} />, color: 'indigo' },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 w-full h-full">
      {stats.map((stat) => (
        <motion.div 
          key={stat.label}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col items-center justify-center text-center gap-4 group transition-all"
        >
          <div className={`p-4 rounded-2xl shadow-sm shrink-0 transition-all 
            ${stat.color === 'orange' ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-900 group-hover:text-white' : ''}
            ${stat.color === 'pink' ? 'bg-pink-50 text-pink-500 group-hover:bg-slate-900 group-hover:text-white' : ''}
            ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-900 group-hover:text-white' : ''}
            ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-900 group-hover:text-white' : ''}
          `}>
            {React.cloneElement(stat.icon as React.ReactElement, { size: 22 } as any)}
          </div>
          <div className="min-w-0">
            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] truncate">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
