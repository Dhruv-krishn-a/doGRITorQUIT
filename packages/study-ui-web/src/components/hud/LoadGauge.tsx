"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Brain, Layers } from 'lucide-react';

interface LoadGaugeProps {
  loadPercentage: number;
  breakdown?: {
    plannedLoad: number;
    capacity: number;
    highEffortUnits: number;
    contextSwitches: number;
  };
}

export function LoadGauge({ loadPercentage, breakdown }: LoadGaugeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const loadColor = loadPercentage > 90 ? 'text-rose-600' : loadPercentage > 70 ? 'text-pink-600' : 'text-pink-500';

  return (
    <div 
      onClick={() => setShowDetails(!showDetails)}
      className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-100/30 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-pink-200 transition-all h-full min-h-[450px] cursor-pointer"
    >
       <AnimatePresence mode="wait">
         {showDetails && breakdown ? (
           <motion.div 
             key="details"
             initial={{ opacity: 0, scale: 0.98, y: 10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.98, y: 10 }}
             className="absolute inset-0 bg-white z-20 p-10 flex flex-col items-center justify-center gap-6"
           >
             <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Study Capacity</h4>
             
             <div className="w-full space-y-3">
               <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Brain size={16} className="text-rose-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Workload</span>
                 </div>
                 <span className="font-black text-slate-900 text-sm">{breakdown.plannedLoad} / {breakdown.capacity}</span>
               </div>

               <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Zap size={16} className="text-amber-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Difficult Tasks</span>
                 </div>
                 <span className="font-black text-slate-900 text-sm">{breakdown.highEffortUnits} Items</span>
               </div>

               <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Layers size={16} className="text-indigo-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Courses</span>
                 </div>
                 <span className="font-black text-slate-900 text-sm">{breakdown.contextSwitches} Tracks</span>
               </div>
             </div>

             <button className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-6 flex items-center gap-2 hover:text-rose-500 transition-colors">
               <div className="w-1 h-1 rounded-full bg-slate-300" />
               Tap to reveal health
               <div className="w-1 h-1 rounded-full bg-slate-300" />
             </button>
           </motion.div>
         ) : (
           <motion.div 
             key="gauge"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 10 }}
             className="w-full h-full flex flex-col items-center justify-center p-4"
           >
             <div className="absolute top-10 left-10 flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200">
                  <Activity size={14} className="animate-pulse" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Study Load</span>
             </div>
             
             <div className="relative w-44 h-44 md:w-52 md:h-52 mb-10 transition-transform duration-700 group-hover:scale-105 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" stroke="#f8fafc" strokeWidth="12" fill="transparent" />
                  <motion.circle 
                    cx="50%" cy="50%" r="42%" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={502} 
                    initial={{ strokeDashoffset: 502 }}
                    animate={{ strokeDashoffset: 502 * (1 - loadPercentage / 100) }}
                    transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`${loadColor} transition-all stroke-round drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]`} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="flex items-start gap-0.5">
                     <span className={`text-6xl font-black tracking-tighter ${loadColor}`}>{Math.round(loadPercentage)}</span>
                     <span className={`text-xl font-black mt-2 ${loadColor}`}>%</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 opacity-60">Status</span>
                </div>
             </div>
             
             <div className="space-y-4">
               <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Daily Health</h4>
               <p className="text-[10px] text-slate-400 font-bold max-w-[200px] leading-relaxed uppercase tracking-widest mx-auto">
                 You are studying at an optimal pace for your goals.
               </p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
