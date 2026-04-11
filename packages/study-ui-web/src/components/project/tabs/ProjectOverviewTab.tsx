import React from 'react';
import { motion } from 'framer-motion';
import { Clock, History, Zap, Target, ArrowLeft, Activity } from 'lucide-react';
import { ProjectContextProps } from '../types';

export function ProjectOverviewTab({ track, units, phases, formatMins, recentSessions }: ProjectContextProps) {
  return (
    <motion.div 
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="transform-gpu p-8 space-y-12 text-left"
    >
      {/* Hero Row */}
      <section className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] p-10 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group">
        <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[var(--accent-color)]/5 via-transparent to-[var(--accent-color)]/5 transition-opacity duration-700 pointer-events-none" />
        
        <div className="transform-gpu flex flex-col items-center gap-4 shrink-0 relative z-10">
          <div className="transform-gpu relative w-40 h-40 flex items-center justify-center">
            <svg className="transform-gpu w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="transform-gpu text-[var(--bg-secondary)]" />
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * track.progressPercentage) / 100} className="transform-gpu text-[var(--accent-color)] drop-shadow-[0_0_15px_var(--accent-color)] transition-all duration-1000 ease-out" strokeLinecap="round" />
            </svg>
            <div className="transform-gpu absolute flex flex-col items-center">
              <span className="transform-gpu text-4xl font-black text-[var(--text-primary)] italic tracking-tighter">{Math.round(track.progressPercentage)}%</span>
              <span className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1 italic opacity-40">Complete</span>
            </div>
          </div>
        </div>

        <div className="transform-gpu grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1 w-full relative z-10">
          {[
            { label: 'Total Time', value: formatMins(units.reduce((a, b) => a + (b.actualTimeSpentMinutes || 0), 0)), icon: Clock, color: 'text-[var(--accent-color)]' },
            { label: 'This Week', value: '4h 20m', icon: History, color: 'text-indigo-500' },
            { label: 'Streak', value: '3 Days', icon: Zap, color: 'text-amber-500' },
            { label: 'Health', value: 'Healthy', icon: Target, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="transform-gpu bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-color)] shadow-sm space-y-2 hover:shadow-xl hover:border-[var(--accent-color)]/30 hover:-translate-y-1 transition-all duration-300">
              <div className="transform-gpu flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-[var(--bg-primary)] ${stat.color} border border-[var(--border-color)] shadow-inner`}>
                  <stat.icon size={16} className="transform-gpu currentColor" />
                </div>
                <span className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic opacity-60">{stat.label}</span>
              </div>
              <div className="transform-gpu text-2xl font-black text-[var(--text-primary)] tracking-tighter italic pl-1">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Next Actions Band */}
      <section className="transform-gpu flex flex-wrap items-center gap-4 bg-[var(--bg-card)]/60 backdrop-blur-md p-4 rounded-[1.5rem] border border-[var(--border-color)] shadow-sm">
         <span className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-4 mr-2 italic opacity-40">Next Actions:</span>
         <button className="transform-gpu px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all active:scale-95 italic">Resume Last Task</button>
         <button className="transform-gpu px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all active:scale-95 italic">Open Today's Tasks</button>
         <button className="transform-gpu px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all active:scale-95 italic">Start Weekly Review</button>
      </section>

      {/* Milestones & Phases Grid */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="transform-gpu lg:col-span-2 space-y-8">
           <div className="transform-gpu flex items-center justify-between pl-2">
              <h2 className="transform-gpu text-xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-3 italic leading-none"><Target size={20} className="transform-gpu text-[var(--accent-color)]"/> Project Phases</h2>
              <button className="transform-gpu text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest hover:underline px-3 py-1.5 rounded-lg italic">Manage Phases</button>
           </div>
           <div className="transform-gpu space-y-4">
             {Object.keys(phases).map((phaseName, i) => {
               const phaseUnits = phases[phaseName];
               const completed = phaseUnits.filter(u => u.status === 'DONE').length;
               const progress = phaseUnits.length > 0 ? (completed / phaseUnits.length) * 100 : 0;
               
               return (
                 <div key={phaseName} className="transform-gpu group bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-[2.5rem] p-8 hover:shadow-xl hover:border-[var(--accent-color)]/30 transition-all duration-300 flex items-center justify-between">
                    <div className="transform-gpu flex items-center gap-8 w-full max-w-xl">
                      <span className="transform-gpu w-12 h-12 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-xs font-black text-[var(--accent-color)] shadow-inner italic">{String(i+1).padStart(2, '0')}</span>
                      <div className="transform-gpu space-y-3 flex-1">
                        <h3 className="transform-gpu text-base font-black text-[var(--text-primary)] italic uppercase tracking-tight">{phaseName}</h3>
                        <div className="transform-gpu flex items-center gap-4">
                          <div className="transform-gpu flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50 p-0.5">
                            <div className="transform-gpu h-full bg-gradient-to-r from-[var(--accent-color)] to-sky-500 transition-all duration-1000 shadow-[0_0_10px_var(--accent-color)] rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] w-10 italic opacity-40">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    </div>
                    <button className="transform-gpu p-4 opacity-0 group-hover:opacity-100 transition-all text-[var(--text-secondary)] hover:text-[var(--accent-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-color)] border border-transparent rounded-2xl">
                       <ArrowLeft className="transform-gpu rotate-180" size={20} />
                    </button>
                 </div>
               );
             })}
           </div>
         </div>

         <div className="transform-gpu space-y-8">
            <div className="transform-gpu flex items-center pl-2 gap-3 leading-none italic">
              <Activity size={20} className="transform-gpu text-[var(--accent-color)]"/>
              <h2 className="transform-gpu text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Activity Feed</h2>
            </div>
            <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] p-10 space-y-8">
               {recentSessions && recentSessions.length > 0 ? recentSessions.map((session: any, idx: number) => (
                 <div key={session.id} className="transform-gpu flex gap-5 group cursor-default">
                    <div className="transform-gpu relative shrink-0 pt-1.5">
                      <div className="transform-gpu w-3 h-3 rounded-full bg-[var(--accent-color)] border-2 border-[var(--bg-card)] shadow-[0_0_10px_var(--accent-color)] group-hover:scale-150 transition-transform" />
                      {idx !== recentSessions.length - 1 && <div className="transform-gpu absolute top-5 left-1.5 w-px h-16 bg-[var(--border-color)]" />}
                    </div>
                    <div className="transform-gpu space-y-2 flex-1 text-left">
                      <p className="transform-gpu text-xs font-black text-[var(--text-primary)] leading-relaxed italic uppercase tracking-tight">
                        Logged <span className="transform-gpu text-[var(--accent-color)]">{Math.ceil(session.watchedSeconds / 60)}M</span> on <span className="transform-gpu opacity-60">{session.unit?.title || 'Unknown Task'}</span>
                      </p>
                      <p className="transform-gpu text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-30 italic">{new Date(session.endedAt || session.startedAt).toLocaleDateString("en-US")} // {new Date(session.endedAt || session.startedAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                 </div>
               )) : (
                 <div className="flex flex-col items-center py-10 opacity-30">
                   <Activity size={32} className="mb-4" />
                   <p className="transform-gpu text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest italic">Awaiting Signal</p>
                 </div>
               )}
               <button className="transform-gpu w-full py-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] rounded-2xl shadow-sm transition-all italic">View All Activity</button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
