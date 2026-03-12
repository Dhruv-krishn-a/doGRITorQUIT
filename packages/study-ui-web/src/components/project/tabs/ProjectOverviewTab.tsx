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
      className="transform-gpu p-8 space-y-12"
    >
      {/* Hero Row */}
      <section className="transform-gpu bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[3rem] p-10 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group">
        <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-rose-50/50 via-transparent to-pink-50/50 transition-opacity duration-700 pointer-events-none" />
        
        <div className="transform-gpu flex flex-col items-center gap-4 shrink-0 relative z-10">
          <div className="transform-gpu relative w-40 h-40 flex items-center justify-center">
            <svg className="transform-gpu w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="transform-gpu text-slate-100" />
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * track.progressPercentage) / 100} className="transform-gpu text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-1000 ease-out" strokeLinecap="round" />
            </svg>
            <div className="transform-gpu absolute flex flex-col items-center">
              <span className="transform-gpu text-4xl font-bold text-slate-900">{Math.round(track.progressPercentage)}%</span>
              <span className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Complete</span>
            </div>
          </div>
        </div>

        <div className="transform-gpu grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1 w-full relative z-10">
          {[
            { label: 'Total Time', value: formatMins(units.reduce((a, b) => a + (b.actualTimeSpentMinutes || 0), 0)), icon: Clock, color: 'text-rose-500' },
            { label: 'This Week', value: '4h 20m', icon: History, color: 'text-indigo-500' },
            { label: 'Streak', value: '3 Days', icon: Zap, color: 'text-amber-500' },
            { label: 'Health', value: 'Healthy', icon: Target, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="transform-gpu bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="transform-gpu flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-slate-50 ${stat.color} bg-opacity-10`}>
                  <stat.icon size={16} className="transform-gpu currentColor" />
                </div>
                <span className="transform-gpu text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="transform-gpu text-2xl font-bold text-slate-800 tracking-tight pl-1">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Next Actions Band */}
      <section className="transform-gpu flex flex-wrap items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm">
         <span className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 mr-2">Next Actions:</span>
         <button className="transform-gpu px-5 py-2.5 bg-white text-slate-600 border border-slate-200 shadow-sm rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all active:scale-95">Resume Last Task</button>
         <button className="transform-gpu px-5 py-2.5 bg-white text-slate-600 border border-slate-200 shadow-sm rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all active:scale-95">Open Today's Tasks</button>
         <button className="transform-gpu px-5 py-2.5 bg-white text-slate-600 border border-slate-200 shadow-sm rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all active:scale-95">Start Weekly Review</button>
      </section>

      {/* Milestones & Phases Grid */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="transform-gpu lg:col-span-2 space-y-6">
           <div className="transform-gpu flex items-center justify-between pl-2">
              <h2 className="transform-gpu text-lg font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2"><Target size={18} className="transform-gpu text-rose-500"/> Project Phases</h2>
              <button className="transform-gpu text-[10px] font-bold text-rose-500 uppercase hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Manage Phases</button>
           </div>
           <div className="transform-gpu space-y-4">
             {Object.keys(phases).map((phaseName, i) => {
               const phaseUnits = phases[phaseName];
               const completed = phaseUnits.filter(u => u.status === 'DONE').length;
               const progress = phaseUnits.length > 0 ? (completed / phaseUnits.length) * 100 : 0;
               
               return (
                 <div key={phaseName} className="transform-gpu group bg-white border border-slate-200 shadow-sm rounded-3xl p-6 hover:shadow-md hover:border-rose-200 transition-all duration-300 flex items-center justify-between">
                    <div className="transform-gpu flex items-center gap-6 w-full max-w-md">
                      <span className="transform-gpu w-10 h-10 flex items-center justify-center bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-500 shadow-sm">{String(i+1).padStart(2, '0')}</span>
                      <div className="transform-gpu space-y-2 flex-1">
                        <h3 className="transform-gpu text-sm font-bold text-slate-800">{phaseName}</h3>
                        <div className="transform-gpu flex items-center gap-3">
                          <div className="transform-gpu flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="transform-gpu h-full bg-rose-500 transition-all duration-1000 shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="transform-gpu text-[10px] font-bold text-slate-500 w-8">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    </div>
                    <button className="transform-gpu p-3 opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-xl">
                       <ArrowLeft className="transform-gpu rotate-180" size={18} />
                    </button>
                 </div>
               );
             })}
           </div>
         </div>

         <div className="transform-gpu space-y-6">
            <div className="transform-gpu flex items-center pl-2 gap-2">
              <Activity size={18} className="transform-gpu text-rose-500"/>
              <h2 className="transform-gpu text-lg font-bold text-slate-900 uppercase tracking-tight">Activity Feed</h2>
            </div>
            <div className="transform-gpu bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-8 space-y-6">
               {recentSessions && recentSessions.length > 0 ? recentSessions.map((session: any, idx: number) => (
                 <div key={session.id} className="transform-gpu flex gap-4 group cursor-default">
                    <div className="transform-gpu relative shrink-0 pt-1">
                      <div className="transform-gpu w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white shadow-sm group-hover:scale-150 transition-transform" />
                      {idx !== recentSessions.length - 1 && <div className="transform-gpu absolute top-4 left-1 w-px h-12 bg-slate-200" />}
                    </div>
                    <div className="transform-gpu space-y-1">
                      <p className="transform-gpu text-xs font-bold text-slate-700 leading-tight">
                        Logged <span className="transform-gpu text-rose-500">{Math.ceil(session.watchedSeconds / 60)}m</span> on <span className="transform-gpu text-slate-900">{session.unit?.title || 'Unknown Task'}</span>
                      </p>
                      <p className="transform-gpu text-[10px] text-slate-400 font-medium">{new Date(session.endedAt || session.startedAt).toLocaleDateString()} {new Date(session.endedAt || session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                 </div>
               )) : (
                 <p className="transform-gpu text-xs text-slate-400 font-medium text-center py-4">No recent activity.</p>
               )}
               <button className="transform-gpu w-full py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-2">View All Activity</button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
