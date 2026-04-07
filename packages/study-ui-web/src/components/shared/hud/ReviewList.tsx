"use client";

import React from 'react';
import { History, ArrowRight, Brain, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { DashboardData } from '@gritorquit/study-core';
import { useStudyUI } from '../../../context/StudyUIContext';

interface ReviewListProps {
  revisions: DashboardData['dueRevisions'];
}

export function ReviewList({ revisions }: ReviewListProps) {
  const { renderLink } = useStudyUI();

  // Animation Configurations
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", stiffness: 300, damping: 25,
        staggerChildren: 0.08, delayChildren: 0.1 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="transform-gpu bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500 flex-1 flex flex-col relative overflow-hidden h-full min-h-[450px] group transform-gpu antialiased"
    >
      {/* Ethereal Background Glow */}
      <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-rose-200/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Header Section */}
      <div className="transform-gpu flex items-center justify-between mb-8 shrink-0 relative z-10">
        <div className="transform-gpu flex items-center gap-4">
          <div className="transform-gpu p-3.5 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl shadow-lg shadow-rose-200 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <History size={20} />
          </div>
          <div>
            <h3 className="transform-gpu text-sm md:text-base font-bold text-slate-900 tracking-tighter uppercase leading-none">Review Pipeline</h3>
            <p className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1.5">Pending Knowledge Sync</p>
          </div>
        </div>
        
        {/* Count Badge */}
        {revisions && revisions.length > 0 && (
          <div className="transform-gpu bg-rose-50 border border-rose-100 text-rose-600 px-3.5 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
            <Sparkles size={12} className="transform-gpu animate-pulse" />
            <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">{revisions.length} Due</span>
          </div>
        )}
      </div>

      {/* Scrollable List Area */}
      <div className="transform-gpu space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        {revisions && revisions.length > 0 ? (
          revisions.map((unit, index) => (
            <motion.div key={`${unit.id}-${index}`} variants={itemVariants}>
              {renderLink({
                href: `/dashboard/study/${unit.trackId}/unit/${unit.id}`,
                className: "group/item block p-5 sm:p-6 rounded-[1.5rem] bg-white/80 border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-300 relative overflow-hidden",
                children: (
                  <>
                    {/* Hover Shimmer Injection */}
                    <div className="transform-gpu absolute inset-0 opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover/item:animate-[shimmer_1.5s_infinite] skew-x-12 pointer-events-none" />
                    
                    <div className="transform-gpu flex justify-between items-center gap-4 sm:gap-6 relative z-10">
                      <div className="transform-gpu min-w-0 flex-1">
                        <div className="transform-gpu flex items-center gap-2.5 mb-2.5">
                          <span className="transform-gpu text-[8px] font-bold text-rose-600 uppercase tracking-widest bg-rose-100/50 px-2 py-1 rounded-md border border-rose-200/50 shadow-sm">
                            {unit.type === 'REVISION' ? 'Review' : 'Unit'}
                          </span>
                          <p className="transform-gpu text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] truncate">
                            {unit.track.title}
                          </p>
                        </div>
                        <h4 className="transform-gpu text-base sm:text-lg font-bold text-slate-800 line-clamp-1 group-hover/item:text-rose-600 transition-colors tracking-tighter uppercase">
                          {unit.title}
                        </h4>
                      </div>
                      
                      {/* Action Button */}
                      <div className="transform-gpu bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-400 group-hover/item:bg-gradient-to-br group-hover/item:from-rose-500 group-hover/item:to-pink-500 group-hover/item:text-white group-hover/item:shadow-[0_4px_15px_rgba(244,63,94,0.4)] group-hover/item:border-transparent transition-all duration-300 shrink-0">
                         <ArrowRight size={18} className="transform-gpu group-hover/item:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </>
                )
              })}
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="transform-gpu h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 opacity-80"
          >
            <div className="transform-gpu bg-slate-50 p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-inner mb-8 relative">
              {/* Subtle pulsing ring behind the brain */}
              <div className="transform-gpu absolute inset-0 bg-emerald-100 rounded-[3rem] animate-ping opacity-20" />
              <Brain size={54} className="transform-gpu text-slate-300" />
            </div>
            <p className="transform-gpu text-sm font-bold text-slate-800 uppercase tracking-[0.3em] mb-3">Neural Buffer Empty</p>
            <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">
              All knowledge modules successfully integrated into long-term memory.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}