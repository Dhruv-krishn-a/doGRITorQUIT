import React from 'react';
import { motion } from 'framer-motion';
import { Download, Clock3, CalendarDays, TrendingUp, PieChart } from 'lucide-react';
import { ProjectContextProps } from '../types';

export function ProjectTimeTab({ units, formatMins }: Pick<ProjectContextProps, 'units' | 'formatMins'>) {
  return (
    <motion.div 
      key="time"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 space-y-12"
    >
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Time & Analytics</h2>
         <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
           <Download size={16} /> Export Logs
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-8 space-y-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-rose-50 text-rose-500 rounded-xl"><Clock3 size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Time</span>
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{formatMins(units.reduce((a, b) => a + (b.actualTimeSpentMinutes || 0), 0))}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Across {units.length} completed tasks</p>
         </div>
         
         <div className="bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-8 space-y-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><CalendarDays size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Days</span>
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">12 Days</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Longest streak: 5 days</p>
         </div>

         <div className="bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-8 space-y-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><TrendingUp size={18} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Efficiency</span>
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">92%</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">vs estimated effort</p>
         </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-[3rem] p-10 h-80 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4 text-slate-300">
            <PieChart size={80} strokeWidth={1} />
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Time Distribution Heatmap</p>
         </div>
      </div>
    </motion.div>
  );
}
