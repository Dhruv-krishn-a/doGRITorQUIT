"use client";

import { ChevronRight, PlayCircle, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardData } from '@planner/study-core';
import { useStudyUI } from '../../../context/StudyUIContext';

// Safe type extension to fix the TS error without losing existing strict typing
type ExtendedUnit = NonNullable<DashboardData['globalNextUnit']> & {
  type?: string;
};

interface StudyProtocolCardProps {
  nextUnit: DashboardData['globalNextUnit'];
}

export function StudyProtocolCard({ nextUnit }: StudyProtocolCardProps) {
  const { renderLink } = useStudyUI();
  
  // Cast to extended unit to safely access .type
  const unit = nextUnit as ExtendedUnit | undefined;

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={springConfig}
      className="transform-gpu bg-white/60 backdrop-blur-xl rounded-[3.5rem] p-10 md:p-12 relative overflow-hidden group flex flex-col justify-between min-h-[450px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(244,63,94,0.1)] transform-gpu antialiased"
    >
      {/* Moving Hover Gradient Injection (Glass Effect) */}
      <div className="transform-gpu absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />

      {/* Smooth, Flowing Neural Waves Background */}
      <div className="transform-gpu absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity duration-700">
        <svg 
          width="100%" 
          height="100%" 
          preserveAspectRatio="none" 
          viewBox="0 0 1000 500" 
          className="transform-gpu absolute inset-0 w-full h-full text-rose-500"
        >
          <defs>
            <linearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" /> {/* rose-500 */}
              <stop offset="100%" stopColor="#d946ef" /> {/* fuchsia-500 */}
            </linearGradient>
            <linearGradient id="waveGlowLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb7185" /> {/* rose-400 */}
              <stop offset="100%" stopColor="#f472b6" /> {/* pink-400 */}
            </linearGradient>
          </defs>

          {/* Deep Blur/Glow Layers */}
          <path 
            d="M -100 250 C 200 250 300 400 550 400 C 800 400 900 200 1200 200" 
            fill="none" stroke="url(#waveGlowLight)" strokeWidth="24" opacity="0.15" filter="blur(16px)" 
            className="transform-gpu origin-center group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <path 
            d="M -100 350 C 150 350 250 450 500 450 C 700 450 800 300 1200 300" 
            fill="none" stroke="url(#waveGlow)" strokeWidth="18" opacity="0.1" filter="blur(12px)" 
            className="transform-gpu origin-center group-hover:scale-105 transition-transform duration-1000 ease-out delay-75"
          />
          
          {/* Sharp Inner Lines (Bezier Curves for smoothness) */}
          <path 
            d="M -100 250 C 200 250 300 400 550 400 C 800 400 900 200 1200 200" 
            fill="none" stroke="url(#waveGlow)" strokeWidth="2" opacity="0.4" 
            className="transform-gpu origin-center group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-1000 ease-out"
          />
          <path 
            d="M -100 350 C 150 350 250 450 500 450 C 700 450 800 300 1200 300" 
            fill="none" stroke="url(#waveGlowLight)" strokeWidth="1.5" opacity="0.3" 
            className="transform-gpu origin-center group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-1000 ease-out delay-75"
          />
           <path 
            d="M 0 150 C 250 150 350 250 600 250 C 800 250 900 100 1200 100" 
            fill="none" stroke="url(#waveGlow)" strokeWidth="1" opacity="0.2" 
            className="transform-gpu origin-center group-hover:scale-105 group-hover:translate-y-1 transition-all duration-1000 ease-out delay-150"
          />
        </svg>
        
        {/* Bottom fade gradient to blend lines smoothly into the card */}
        <div className="transform-gpu absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white/80 to-transparent" />
      </div>
      
      <div className="transform-gpu relative z-10 flex flex-col h-full">
        <div className="transform-gpu flex-1">
          {/* Top Badges */}
          <div className="transform-gpu flex items-center gap-4 mb-8">
            <div className="transform-gpu bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm group-hover:bg-rose-100 transition-colors duration-300">
              <Zap size={12} className="transform-gpu text-rose-500 fill-rose-500" />
              <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-rose-600 mt-0.5">Active Vector</span>
            </div>
            <div className="transform-gpu h-px w-8 md:w-12 bg-slate-200" />
            <span className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] truncate block max-w-[200px] md:max-w-[400px] mt-0.5 group-hover:text-slate-600 transition-colors">
              {unit?.track?.title || "SYSTEM IDLE"}
            </span>
          </div>

          {/* Main Content */}
          <div className="transform-gpu max-w-3xl mt-2">
            <h2 className="transform-gpu text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-slate-900 group-hover:text-rose-950 transition-colors duration-500 leading-[1.1]">
              {unit?.title || "Initialize a new learning vector to begin."}
            </h2>
            
            <p className="transform-gpu text-slate-500 font-bold text-[15px] md:text-lg max-w-[85%] leading-relaxed mb-10 line-clamp-3">
              {unit?.description || "Select a module from your active tracks or import a new syllabus to commence cognitive upload."}
            </p>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="transform-gpu mt-auto shrink-0 pt-8 flex flex-wrap items-center justify-start gap-4">
          {unit ? (
            <>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {renderLink({
                  href: `/dashboard/study/${unit.track.id}/unit/${unit.id}`,
                  className: "group/btn relative overflow-hidden inline-flex items-center justify-center gap-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 md:py-5 rounded-2xl font-bold text-[11px] md:text-xs uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.5)] transition-all",
                  children: (
                    <>
                      {/* CSS Shimmer/Glass Reflection Effect inside Button */}
                      <div className="transform-gpu absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                      <PlayCircle size={20} className="transform-gpu relative z-10 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform duration-300 fill-current text-rose-100" />
                      <span className="transform-gpu relative z-10 pt-0.5">Resume Protocol</span>
                    </>
                  )
                })}
              </motion.div>
              
              <div className="transform-gpu flex items-center gap-2 bg-white/80 border border-slate-200 px-6 py-4 md:py-5 rounded-2xl text-slate-800 font-bold text-[10px] md:text-[11px] uppercase tracking-widest shadow-sm group-hover:border-rose-200 transition-colors">
                <span className="transform-gpu text-slate-400 font-bold text-[9px] md:text-[10px] tracking-[0.2em]">TYPE:</span>
                <span className="transform-gpu mt-0.5">{unit.type || 'Lesson'}</span>
                <ChevronRight size={16} className="transform-gpu text-rose-400 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </>
          ) : (
            <button disabled className="transform-gpu bg-slate-50 border border-slate-200 text-slate-400 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest cursor-not-allowed shadow-sm">
              Awaiting Selection
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}