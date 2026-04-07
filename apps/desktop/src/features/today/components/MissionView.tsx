import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodayActionItem } from '../types';
import { ActionCard } from './ActionCard';
import { X, Zap, ShieldAlert, Timer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionViewProps {
  item: TodayActionItem | null;
  isTransitioning: boolean;
  onAbort: () => void;
  onComplete: () => void;
}

export const MissionView: React.FC<MissionViewProps> = ({ item, isTransitioning, onAbort, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(5); // 5 second demo transition

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTransitioning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (!isTransitioning) {
      setTimeLeft(5);
    }
    return () => clearInterval(timer);
  }, [isTransitioning, timeLeft]);

  if (!item && !isTransitioning) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6"
    >
      {/* Background Grid Aura */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--accent-color) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="relative w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {isTransitioning ? (
            <motion.div
              key="transition"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="var(--bg-secondary)" strokeWidth="4" fill="transparent" />
                  <motion.circle
                    cx="64" cy="64" r="60" stroke="var(--accent-color)" strokeWidth="4" fill="transparent"
                    strokeDasharray={2 * Math.PI * 60}
                    initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                </svg>
                <span className="absolute text-4xl font-black text-[var(--text-primary)]">{timeLeft}s</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-widest uppercase">Transitioning Vector</h2>
                <p className="text-[var(--text-secondary)] font-medium">Breathe. Calibrating next mission parameters...</p>
              </div>
              <div className="flex gap-2">
                {[1,2,3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    className="w-2 h-2 rounded-full bg-[var(--accent-color)]"
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-[var(--bg-primary)] shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h1 className="text-xs font-black text-[var(--accent-color)] tracking-[0.3em] uppercase">Active Mission</h1>
                    <p className="text-[var(--text-primary)] font-bold tracking-tight uppercase italic">Autopilot Engaged</p>
                  </div>
                </div>
                <button 
                  onClick={onAbort}
                  className="p-3 bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-4">
                {item && <ActionCard item={item} onComplete={onComplete} />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Timer size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Focus Level</p>
                    <p className="text-sm font-bold text-[var(--text-primary)] uppercase">Optimal State</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-color)]/20 flex items-center justify-center text-[var(--accent-color)]">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[var(--accent-color)]/60 uppercase tracking-widest">Guardian</p>
                    <p className="text-sm font-bold text-[var(--text-primary)] uppercase">Shadow Mode Active</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">
                  Execution is the only priority.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
