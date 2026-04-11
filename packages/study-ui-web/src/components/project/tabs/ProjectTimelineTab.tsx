import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ProjectContextProps } from '../types';

export function ProjectTimelineTab({ phases, units }: Pick<ProjectContextProps, 'phases' | 'units'>) {
  // Calculate total project duration based on estimates
  const totalProjectMins = useMemo(() => {
    const total = units.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);
    return total > 0 ? total : 1; // Prevent division by zero
  }, [units]);

  // Map phases to their calculated widths and left offsets
  const phaseTimelines = useMemo(() => {
    let accumulatedMins = 0;
    
    return Object.keys(phases).map(phaseName => {
      const phaseUnits = phases[phaseName];
      const phaseMins = phaseUnits.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);
      const isDone = phaseUnits.length > 0 && phaseUnits.every(u => u.status === 'DONE');
      
      const widthPercent = Math.max((phaseMins / totalProjectMins) * 100, 5); // Min 5% width for visibility
      const leftPercent = (accumulatedMins / totalProjectMins) * 100;
      
      accumulatedMins += phaseMins;

      return {
        name: phaseName,
        width: widthPercent,
        left: leftPercent,
        isDone,
        tasks: phaseUnits.length,
        hours: Math.round(phaseMins / 60)
      };
    });
  }, [phases, totalProjectMins]);

  return (
    <motion.div 
      key="timeline"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="transform-gpu p-8 h-full flex flex-col text-left"
    >
      <div className="transform-gpu flex items-center justify-between mb-8">
        <h2 className="transform-gpu text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Waterfall Timeline</h2>
        <div className="transform-gpu flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-inner gap-1">
          <button className="transform-gpu px-5 py-2 rounded-xl text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest transition-all italic">Phase</button>
          <button className="transform-gpu px-5 py-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm italic">Effort</button>
        </div>
      </div>

      <div className="transform-gpu flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] p-12 relative overflow-y-auto no-scrollbar group">
         <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
         
         <div className="transform-gpu flex flex-col gap-10 pb-10 relative z-10">
            {phaseTimelines.map((phase, i) => (
              <div key={phase.name} className="transform-gpu flex items-center gap-10 group/item">
                 <div className="transform-gpu w-40 shrink-0 text-left">
                    <div className="transform-gpu text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight italic truncate">{phase.name}</div>
                    <div className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1.5 italic opacity-40">{phase.tasks} steps • {phase.hours}h</div>
                 </div>
                 <div className="transform-gpu flex-1 h-12 bg-[var(--bg-secondary)] rounded-[1.5rem] relative shadow-inner border border-[var(--border-color)]/30">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${Math.min(phase.width, 100 - phase.left)}%`, opacity: 1 }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      className={`absolute h-full rounded-[1.5rem] shadow-xl flex items-center px-6 overflow-hidden border ${
                        phase.isDone 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10' 
                        : 'bg-[var(--accent-color)] border-[var(--accent-color)]/30 text-[var(--bg-primary)] shadow-[var(--accent-color)]/20'
                      }`}
                      style={{ left: `${phase.left}%` }}
                    >
                       <span className="transform-gpu text-[9px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity italic">
                         {phase.isDone ? 'RECOGNIZED' : 'ACTIVE FREQUENCY'}
                       </span>
                    </motion.div>
                 </div>
              </div>
            ))}
            {phaseTimelines.length === 0 && (
               <div className="transform-gpu text-center py-20 opacity-20 flex flex-col items-center">
                  <div className="text-4xl mb-4">⏳</div>
                  <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] italic">No temporal mapping available.</div>
               </div>
            )}
         </div>
      </div>
    </motion.div>
  );
}
