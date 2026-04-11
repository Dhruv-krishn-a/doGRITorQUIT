"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function DesktopBootSplash({ onComplete }: { onClose?: () => void, onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden">
      <div className="flex items-center gap-8">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-white text-7xl font-black italic uppercase tracking-tightest leading-none select-none"
        >
          grit.io
        </motion.h1>

        <div className="flex items-center gap-4 relative h-10 w-40">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.6 + (i * 0.1), 
                duration: 0.6, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className={`w-4 h-4 rounded-full shadow-lg ${i === 3 ? 'bg-[#6366f1] shadow-[#6366f1]/20' : 'bg-white shadow-white/5'}`}
            />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-12 text-white text-[10px] font-black uppercase tracking-[0.5em] italic"
      >
        Initializing Growth Core
      </motion.div>
    </div>
  );
}
