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
      className="transform-gpu bg-[var(--bg-card)]/40 backdrop-blur-xl rounded-[3rem] border border-[var(--border-color)] p-8 md:p-10 shadow-2xl transition-all duration-500 flex-1 flex flex-col relative overflow-hidden h-full min-h-[450px] group transform-gpu antialiased"
    >
      {/* Ethereal Background Glow */}
      <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Header Section */}
      <div className="transform-gpu flex items-center justify-between mb-8 shrink-0 relative z-10">
        <div className="transform-gpu flex items-center gap-4 text-left">
          <div className="transform-gpu p-3.5 bg-gradient-to-br from-[var(--accent-color)] to-indigo-600 text-[var(--bg-primary)] rounded-2xl shadow-lg shadow-[var(--accent-color)]/20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <History size={20} />
          </div>
          <div>
            <h3 className="transform-gpu text-sm md:text-base font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none italic">Review Pipeline</h3>
            <p className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1.5 opacity-60">Pending Knowledge Sync</p>
          </div>
        </div>
        
        {/* Count Badge */}
        {revisions && revisions.length > 0 && (
          <div className="transform-gpu bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] px-3.5 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
            <Sparkles size={12} className="transform-gpu animate-pulse" />
            <span className="transform-gpu text-[10px] font-black uppercase tracking-widest italic">{revisions.length} Due</span>
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
                className: "group/item block p-5 sm:p-6 rounded-[1.5rem] bg-[var(--bg-secondary)]/40 border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-secondary)] transition-all duration-300 relative overflow-hidden",
                children: (
                  <>
                    {/* Hover Shimmer Injection */}
                    <div className="transform-gpu absolute inset-0 opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/item:animate-[shimmer_1.5s_infinite] skew-x-12 pointer-events-none" />
                    
                    <div className="transform-gpu flex justify-between items-center gap-4 sm:gap-6 relative z-10 text-left">
                      <div className="transform-gpu min-w-0 flex-1">
                        <div className="transform-gpu flex items-center gap-2.5 mb-2.5">
                          <span className="transform-gpu text-[8px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-color)]/10 px-2.5 py-1 rounded-md border border-[var(--accent-color)]/20 shadow-sm italic">
                            {unit.type === 'REVISION' ? 'Review' : 'Unit'}
                          </span>
                          <p className="transform-gpu text-[8px] sm:text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] truncate opacity-60">
                            {unit.track.title}
                          </p>
                        </div>
                        <h4 className="transform-gpu text-base sm:text-lg font-black text-[var(--text-primary)] line-clamp-1 group-hover/item:text-[var(--accent-color)] transition-colors tracking-tighter uppercase italic">
                          {unit.title}
                        </h4>
                      </div>
                      
                      {/* Action Button */}
                      <div className="transform-gpu bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] group-hover/item:bg-[var(--accent-color)] group-hover/item:text-[var(--bg-primary)] group-hover/item:shadow-lg group-hover/item:shadow-[var(--accent-color)]/20 group-hover/item:border-[var(--accent-color)] transition-all duration-300 shrink-0">
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
            <div className="transform-gpu bg-[var(--bg-secondary)] p-8 sm:p-10 rounded-[3rem] border border-[var(--border-color)] shadow-inner mb-8 relative">
              <div className="transform-gpu absolute inset-0 bg-[var(--accent-color)]/5 rounded-[3rem] animate-ping opacity-20" />
              <Brain size={54} className="transform-gpu text-[var(--text-secondary)]" />
            </div>
            <p className="transform-gpu text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-3 italic">Neural Buffer Empty</p>
            <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] max-w-[240px] leading-relaxed italic opacity-60">
              All knowledge modules successfully integrated into long-term memory.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}