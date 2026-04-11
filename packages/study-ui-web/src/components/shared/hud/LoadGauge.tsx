"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Activity, Zap, Brain, Layers, RefreshCw } from 'lucide-react';

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
  
  // Premium Theme Colors
  const isHighLoad = loadPercentage > 90;
  const isMediumLoad = loadPercentage > 70;
  
  const loadColorClass = isHighLoad 
    ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]' 
    : isMediumLoad 
      ? 'text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]' 
      : 'text-fuchsia-500 drop-shadow-[0_0_12px_rgba(217,70,239,0.5)]';

  const loadGradient = isHighLoad 
    ? 'from-rose-500 to-red-500' 
    : isMediumLoad 
      ? 'from-pink-500 to-rose-500' 
      : 'from-fuchsia-500 to-pink-500';

  // Animation Physics
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  const viewVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, filter: 'blur(8px)', y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: 'blur(0px)', 
      y: 0,
      transition: { ...springConfig, staggerChildren: 0.1, delayChildren: 0.1 } 
    },
    exit: { opacity: 0, scale: 0.95, filter: 'blur(8px)', y: -10, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: springConfig }
  };

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      transition={springConfig}
      onClick={() => setShowDetails(!showDetails)}
      className="transform-gpu bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.1)] flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all h-full min-h-[400px] md:min-h-[450px] cursor-pointer transform-gpu antialiased"
    >
      {/* Ethereal Moving Backgrounds */}
      <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-pink-50/50 via-white to-rose-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />
      <div className="transform-gpu absolute top-0 right-0 w-48 h-48 bg-pink-200/30 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

       <AnimatePresence mode="wait">
         {showDetails && breakdown ? (
           <motion.div 
             key="details"
             variants={viewVariants}
             initial="hidden"
             animate="visible"
             exit="exit"
             className="transform-gpu absolute inset-0 z-20 p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center w-full"
           >
             <motion.h4 variants={itemVariants} className="transform-gpu text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <Activity size={14} className="transform-gpu text-pink-500" />
               Study Capacity
             </motion.h4>
             
             <div className="transform-gpu w-full space-y-3">
               <motion.div variants={itemVariants} className="transform-gpu flex justify-between items-center bg-white/80 p-4 md:p-5 rounded-[1.5rem] border border-slate-100 shadow-sm group/item hover:border-pink-200 transition-colors duration-300">
                 <div className="transform-gpu flex items-center gap-3">
                   <div className="transform-gpu p-2.5 bg-rose-50 rounded-xl shadow-sm text-rose-500 group-hover/item:scale-110 transition-transform">
                    <Brain size={16} />
                   </div>
                   <span className="transform-gpu text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover/item:text-slate-500 transition-colors">Total Workload</span>
                 </div>
                 <span className="transform-gpu font-bold text-slate-800 text-sm md:text-base">{breakdown.plannedLoad} / {breakdown.capacity}</span>
               </motion.div>

               <motion.div variants={itemVariants} className="transform-gpu flex justify-between items-center bg-white/80 p-4 md:p-5 rounded-[1.5rem] border border-slate-100 shadow-sm group/item hover:border-amber-200 transition-colors duration-300">
                 <div className="transform-gpu flex items-center gap-3">
                   <div className="transform-gpu p-2.5 bg-amber-50 rounded-xl shadow-sm text-amber-500 group-hover/item:scale-110 group-hover/item:rotate-12 transition-transform">
                    <Zap size={16} />
                   </div>
                   <span className="transform-gpu text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover/item:text-slate-500 transition-colors">Difficult Tasks</span>
                 </div>
                 <span className="transform-gpu font-bold text-slate-800 text-sm md:text-base">{breakdown.highEffortUnits} Items</span>
               </motion.div>

               <motion.div variants={itemVariants} className="transform-gpu flex justify-between items-center bg-white/80 p-4 md:p-5 rounded-[1.5rem] border border-slate-100 shadow-sm group/item hover:border-indigo-200 transition-colors duration-300">
                 <div className="transform-gpu flex items-center gap-3">
                   <div className="transform-gpu p-2.5 bg-indigo-50 rounded-xl shadow-sm text-indigo-500 group-hover/item:scale-110 transition-transform">
                    <Layers size={16} />
                   </div>
                   <span className="transform-gpu text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover/item:text-slate-500 transition-colors">Active Steps</span>
                 </div>
                 <span className="transform-gpu font-bold text-slate-800 text-sm md:text-base">{breakdown.contextSwitches} Tracks</span>
               </motion.div>
             </div>

             <motion.div variants={itemVariants} className="transform-gpu mt-8 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-pink-500 transition-colors group/hint">
               <RefreshCw size={12} className="transform-gpu group-hover/hint:rotate-180 transition-transform duration-700" />
               Tap to reveal health
             </motion.div>
           </motion.div>
         ) : (
           <motion.div 
             key="gauge"
             variants={viewVariants}
             initial="hidden"
             animate="visible"
             exit="exit"
             className="transform-gpu w-full h-full flex flex-col items-center justify-center p-4 relative z-10"
           >
             <div className="transform-gpu absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2.5">
                <div className={`p-2 rounded-xl text-white shadow-md bg-gradient-to-br ${loadGradient}`}>
                  <Activity size={14} className="transform-gpu animate-pulse" />
                </div>
                <span className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Study Load</span>
             </div>
             
             <div className="transform-gpu relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-8 transition-transform duration-700 group-hover:scale-105 shrink-0 group-hover:-rotate-3 mt-6">
                <svg className="transform-gpu w-full h-full transform -rotate-90 origin-center drop-shadow-sm">
                  {/* Background Track */}
                  <circle cx="50%" cy="50%" r="42%" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                  
                  {/* Foreground Animated Gauge */}
                  <motion.circle 
                    cx="50%" cy="50%" r="42%" 
                    stroke="currentColor" 
                    strokeWidth="14" 
                    strokeLinecap="round"
                    fill="transparent" 
                    strokeDasharray={502} 
                    initial={{ strokeDashoffset: 502 }}
                    animate={{ strokeDashoffset: 502 * (1 - loadPercentage / 100) }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                    className={`${loadColorClass} transition-all stroke-round`} 
                  />
                </svg>
                
                {/* Center Content */}
                <div className="transform-gpu absolute inset-0 flex flex-col items-center justify-center pt-2">
                   <div className="transform-gpu flex items-start gap-0.5 group-hover:scale-110 transition-transform duration-500">
                     <span className={`text-6xl sm:text-7xl font-bold tracking-tighter leading-none ${loadColorClass.split(' ')[0]}`}>{Math.round(loadPercentage)}</span>
                     <span className={`text-xl font-bold mt-1 ${loadColorClass.split(' ')[0]} opacity-80`}>%</span>
                   </div>
                   <span className="transform-gpu text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-60">Status</span>
                </div>
             </div>
             
             <div className="transform-gpu space-y-3 mt-auto">
               <h4 className="transform-gpu text-xs md:text-sm font-bold text-slate-900 uppercase tracking-[0.2em] group-hover:text-pink-600 transition-colors">Daily Health</h4>
               <p className="transform-gpu text-[9px] md:text-[10px] text-slate-500 font-bold max-w-[220px] leading-relaxed uppercase tracking-widest mx-auto">
                 {isHighLoad ? 'You are pushing the limits of neural retention.' : 'You are studying at an optimal pace for your goals.'}
               </p>
             </div>
             
             <div className="transform-gpu absolute bottom-4 right-4 md:bottom-8 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <div className="transform-gpu bg-slate-50 border border-slate-100 text-slate-400 p-2 rounded-full shadow-sm">
                 <RefreshCw size={14} className="transform-gpu animate-spin-slow" />
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </motion.div>
  );
}