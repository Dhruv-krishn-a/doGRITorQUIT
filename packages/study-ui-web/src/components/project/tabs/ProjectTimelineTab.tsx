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
      className="p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Waterfall Timeline</h2>
        <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm gap-1">
          <button className="px-5 py-2 rounded-xl text-slate-500 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest transition-colors">Phase</button>
          <button className="px-5 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Effort</button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-10 relative overflow-y-auto custom-scrollbar">
         <div className="flex flex-col gap-8 pb-10">
            {phaseTimelines.map((phase, i) => (
              <div key={phase.name} className="flex items-center gap-10 group">
                 <div className="w-32 shrink-0">
                    <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest truncate">{phase.name}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">{phase.tasks} tasks • {phase.hours}h</div>
                 </div>
                 <div className="flex-1 h-10 bg-slate-100 rounded-2xl relative shadow-inner">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${Math.min(phase.width, 100 - phase.left)}%`, opacity: 1 }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      className={`absolute h-full rounded-2xl shadow-md flex items-center px-4 overflow-hidden border ${
                        phase.isDone 
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-emerald-100' 
                        : 'bg-gradient-to-r from-rose-500 to-pink-500 border-rose-400 text-white shadow-rose-200'
                      }`}
                      style={{ left: `${phase.left}%` }}
                    >
                       <span className="text-[8px] font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                         {phase.isDone ? 'Completed' : 'Active Phase'}
                       </span>
                    </motion.div>
                 </div>
              </div>
            ))}
            {phaseTimelines.length === 0 && (
               <div className="text-center text-slate-400 text-sm font-bold pt-10">No phases to display. Add tasks to see the timeline.</div>
            )}
         </div>
      </div>
    </motion.div>
  );
}
