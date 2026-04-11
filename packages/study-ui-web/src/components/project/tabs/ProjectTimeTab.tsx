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
      className="transform-gpu p-8 space-y-12 text-left"
    >
      <div className="transform-gpu flex items-center justify-between px-2">
         <h2 className="transform-gpu text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Time & Analytics</h2>
         <button className="transform-gpu flex items-center gap-3 px-8 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all italic">
           <Download size={18} /> Export Logs
         </button>
      </div>

      <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl rounded-[2.5rem] p-10 space-y-8 hover:shadow-2xl hover:border-[var(--accent-color)]/30 transition-all group">
            <div className="transform-gpu flex items-center gap-4">
               <div className="transform-gpu p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 shadow-sm"><Clock3 size={20} /></div>
               <span className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40">Total Temporal</span>
            </div>
            <div className="transform-gpu text-5xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">{formatMins(units.reduce((a, b) => a + (b.actualTimeSpentMinutes || 0), 0))}</div>
            <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-20 italic">Across {units.length} resolved vectors</p>
         </div>
         
         <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl rounded-[2.5rem] p-10 space-y-8 hover:shadow-2xl hover:border-[var(--accent-color)]/30 transition-all group">
            <div className="transform-gpu flex items-center gap-4">
               <div className="transform-gpu p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shadow-sm"><CalendarDays size={20} /></div>
               <span className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40">Active Cycles</span>
            </div>
            <div className="transform-gpu text-5xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">12 Days</div>
            <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-20 italic">Longest sequence: 5 days</p>
         </div>

         <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl rounded-[2.5rem] p-10 space-y-8 hover:shadow-2xl hover:border-[var(--accent-color)]/30 transition-all group">
            <div className="transform-gpu flex items-center gap-4">
               <div className="transform-gpu p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shadow-sm"><TrendingUp size={20} /></div>
               <span className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40">Integration</span>
            </div>
            <div className="transform-gpu text-5xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">92%</div>
            <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-20 italic">vs architectural projection</p>
         </div>
      </div>

      <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] p-16 h-96 flex items-center justify-center relative overflow-hidden group/chart">
         <div className="transform-gpu absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/5 via-transparent to-transparent pointer-events-none group-hover/chart:opacity-100 opacity-0 transition-opacity duration-1000" />
         <div className="transform-gpu flex flex-col items-center gap-8 relative z-10">
            <PieChart size={100} strokeWidth={1} className="text-[var(--text-secondary)] opacity-10 group-hover/chart:opacity-20 transition-opacity duration-700" />
            <p className="transform-gpu text-xs font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-30 italic">Temporal Distribution Topography</p>
         </div>
      </div>
    </motion.div>
  );
}
