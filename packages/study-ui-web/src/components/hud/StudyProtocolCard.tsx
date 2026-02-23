"use client";

import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardData } from '@planner/study-core';
import { useStudyUI } from '../../context/StudyUIContext';

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#fcf5f5] rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group flex flex-col justify-between min-h-[450px] border border-[#fcebeb]"
    >
      {/* Circuit-style Glowing Lines Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg 
          width="100%" 
          height="100%" 
          preserveAspectRatio="none" 
          viewBox="0 0 1000 500" 
          className="absolute inset-0 w-full h-full"
        >
          {/* Deep Blur/Glow Layers */}
          <path 
            d="M -50 280 H 350 L 480 380 H 750 L 850 480 H 1100" 
            fill="none" stroke="#ff7a7a" strokeWidth="20" opacity="0.25" filter="blur(14px)" 
          />
          <path 
            d="M -50 340 H 250 L 380 440 H 650 L 750 540 H 1100" 
            fill="none" stroke="#ff4d4d" strokeWidth="16" opacity="0.15" filter="blur(12px)" 
          />
          <path 
            d="M 100 200 H 250 L 350 300 H 550 L 650 400 H 1100" 
            fill="none" stroke="#ff7a7a" strokeWidth="12" opacity="0.1" filter="blur(8px)" 
          />
          
          {/* Sharp Inner Lines */}
          <path 
            d="M -50 280 H 350 L 480 380 H 750 L 850 480 H 1100" 
            fill="none" stroke="#ff5c77" strokeWidth="2" opacity="0.7" 
          />
          <path 
            d="M -50 340 H 250 L 380 440 H 650 L 750 540 H 1100" 
            fill="none" stroke="#ff8c8c" strokeWidth="1.5" opacity="0.5" 
          />
           <path 
            d="M 100 200 H 250 L 350 300 H 550 L 650 400 H 1100" 
            fill="none" stroke="#ff9999" strokeWidth="1" opacity="0.4" 
          />
        </svg>
        {/* Bottom fade gradient to blend lines smoothly */}
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#fcf5f5] to-transparent" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1">
          {/* Top Badges */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#f0d8d8] px-3 py-1.5 rounded-full">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#914040]">Next Lesson</span>
            </div>
            <span className="text-[10.5px] font-bold text-[#6b5050] uppercase tracking-[0.15em] truncate block max-w-[200px] md:max-w-[400px]">
              {unit?.track?.title || "YOUR CURRENT COURSE"}
            </span>
          </div>

          {/* Main Content */}
          <div className="max-w-3xl mt-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-[#2d1f1f]">
              {unit?.title || "Get started by adding a course"}
            </h2>
            
            <p className="text-[#5c4d4d] font-medium text-[15px] md:text-lg max-w-[85%] leading-relaxed mb-10">
              {unit?.description || "Select a course from your dashboard or import a new one from YouTube to start learning."}
            </p>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="mt-auto shrink-0 pt-6 flex flex-row items-center justify-start gap-4">
          {unit ? (
            <>
              {renderLink({
                href: `/dashboard/study/${unit.track.id}/unit/${unit.id}`,
                className: "bg-[#a62b42] text-[#ffffff] px-6 py-3.5 rounded-full font-bold text-[10.5px] uppercase tracking-wider hover:bg-[#8a2235] transition-colors shadow-lg shadow-[#a62b42]/20 active:scale-95",
                children: (
                  <span>Continue Studying</span>
                )
              })}
              
              <div className="flex items-center gap-2 bg-[#f4e8e8]/70 backdrop-blur-md px-5 py-3.5 rounded-full text-[#2d1f1f] font-bold text-[10.5px] uppercase tracking-wider">
                <span className="text-[#8c7777] font-semibold text-[9.5px]">TYPE:</span>
                <span>{unit.type || 'Lesson'}</span>
                <ChevronRight size={14} className="text-[#8c7777] ml-1" />
              </div>
            </>
          ) : (
            <button disabled className="bg-[#e6dada] text-[#998b8b] px-6 py-3.5 rounded-full font-bold text-[10.5px] uppercase tracking-wider cursor-not-allowed">
              Awaiting Selection
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}