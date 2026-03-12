// packages/dashboard-ui-web/src/components/today/FocusOverlay.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Pause, 
  Play, 
  CheckCircle2, 
  Clock, 
  Maximize2, 
  Minimize2, 
  StickyNote, 
  Volume2, 
  VolumeX, 
  Sparkles 
} from 'lucide-react';

interface FocusOverlayProps {
  item: {
    id: string;
    type: string;
    title: string;
    vectorName: string;
    duration: number;
    progress?: number;
  };
  onClose: () => void;
  onComplete: (id: string, type: string, secondsSpent: number) => void;
}

export function FocusOverlay({ item, onClose, onComplete }: FocusOverlayProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Add overflow hidden to body to prevent background scrolling
    document.body.style.overflow = 'hidden';
    return () => {
      setMounted(false);
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (isMusicPlaying) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      audioRef.current.play().catch(() => setIsMusicPlaying(false));
    } else {
      audioRef.current?.pause();
    }
    return () => audioRef.current?.pause();
  }, [isMusicPlaying]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!mounted) return null;

  const content = (
    <div 
      style={{ zIndex: 99999 }}
      className="transform-gpu fixed inset-0 flex items-center justify-center p-4 md:p-10 pointer-events-none"
    >
      {/* Backdrop - High Z-index directly */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 pointer-events-auto transition-all duration-700 ${isZenMode ? 'bg-slate-950' : 'bg-slate-900/80 backdrop-blur-3xl'}`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div 
        layout
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ 
            scale: 1, 
            y: 0,
            opacity: 1,
            backgroundColor: isZenMode ? '#020617' : '#ffffff'
        }}
        className={`relative z-[100000] pointer-events-auto rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden border transition-all duration-500 ${isZenMode ? 'border-slate-800' : 'border-white'} ${isExpanded || isZenMode ? 'w-full h-full max-w-7xl max-h-[95vh]' : 'w-full max-w-2xl'}`}
      >
        {/* Header */}
        <div className={`p-8 pb-4 flex justify-between items-start ${isZenMode ? 'opacity-20 hover:opacity-100 transition-opacity' : ''}`}>
          <div className="transform-gpu flex gap-4 items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isZenMode ? 'bg-slate-800 text-rose-400' : 'bg-rose-500 text-white shadow-rose-200'}`}>
               <Clock size={20} />
            </div>
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isZenMode ? 'text-rose-400' : 'text-rose-500'}`}>{item.vectorName}</div>
              <h2 className={`text-xl font-bold tracking-tight leading-tight ${isZenMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h2>
            </div>
          </div>
          <div className="transform-gpu flex gap-2">
             <button 
                onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                className={`p-3 rounded-2xl transition-all active:scale-95 ${isMusicPlaying ? 'bg-rose-500 text-white' : isZenMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'}`}
                title="Lo-fi Focus Stream"
             >
                {isMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
             </button>
             <button 
                onClick={() => setIsZenMode(!isZenMode)}
                className={`p-3 rounded-2xl transition-all active:scale-95 ${isZenMode ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-400'}`}
                title="Toggle Zen Mode"
             >
                <Sparkles size={18} />
             </button>
             <button 
                onClick={onClose}
                className={`p-3 rounded-2xl transition-all active:scale-95 ${isZenMode ? 'bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600'}`}
             >
                <X size={18} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-8 pt-4 flex gap-8 ${(isExpanded || isZenMode) ? 'flex-row' : 'flex-col'}`}>
          <div className="transform-gpu flex-1 flex flex-col items-center justify-center gap-10 py-8">
            <div className="transform-gpu relative">
                <svg className="transform-gpu w-72 h-72 -rotate-90">
                    <circle cx="144" cy="144" r="136" className={`${isZenMode ? 'stroke-slate-900' : 'stroke-slate-100'} fill-none`} strokeWidth="8" />
                    <motion.circle 
                        cx="144" cy="144" r="136" 
                        className="transform-gpu stroke-rose-500 fill-none" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 854" }}
                        animate={{ strokeDasharray: `${Math.min(854, (seconds / (item.duration * 60 || 1)) * 854)} 854` }}
                        transition={{ duration: 1 }}
                    />
                </svg>
                <div className="transform-gpu absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-6xl font-bold tabular-nums tracking-tighter ${isZenMode ? 'text-white' : 'text-slate-900'}`}>{formatTime(seconds)}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest mt-3 ${isZenMode ? 'text-rose-400' : 'text-slate-400'}`}>Neural Investment</span>
                </div>
            </div>

            <div className="transform-gpu flex items-center gap-6">
                <button onClick={() => setIsActive(!isActive)} className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isActive ? 'bg-amber-500 text-white shadow-amber-200/50' : 'bg-rose-500 text-white shadow-rose-200/50'}`}>
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>
                {!isZenMode && (
                    <button 
                        onClick={() => onComplete(item.id, item.type, seconds)}
                        className="transform-gpu px-10 py-6 bg-slate-900 text-white rounded-full font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-emerald-500 hover:shadow-emerald-200 transition-all active:scale-95 flex items-center gap-4 whitespace-nowrap min-w-fit"
                    >
                        <CheckCircle2 size={20} className="transform-gpu shrink-0" />
                        <span>Sync Completion</span>
                    </button>
                )}
            </div>
          </div>

          {!isZenMode && (
            <div className={`${isExpanded ? 'w-96' : 'w-full'} flex flex-col gap-4`}>
                <div className="transform-gpu flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    <StickyNote size={14} className="transform-gpu text-rose-500" />
                    Session Context
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Capture insights..." className="transform-gpu w-full flex-1 min-h-[250px] bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 text-sm font-bold text-slate-800 focus:bg-white focus:border-rose-200 focus:ring-8 focus:ring-rose-50/50 outline-none transition-all placeholder:text-slate-300 resize-none shadow-inner" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-8 py-6 border-t flex items-center justify-between ${isZenMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
           <div className="transform-gpu flex gap-6">
              <div className="transform-gpu flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                 <div className="transform-gpu w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                 Active Focus Block
              </div>
              <div className="transform-gpu flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                 <div className="transform-gpu w-2 h-2 bg-emerald-500 rounded-full" />
                 Biometric Sync: Stable
              </div>
           </div>
           {isZenMode && (
               <button onClick={() => onComplete(item.id, item.type, seconds)} className="transform-gpu text-rose-400 font-bold text-[10px] uppercase tracking-widest hover:text-rose-300 transition-colors">
                   Finish & Exit Zen Mode
               </button>
           )}
           <div className={`text-[10px] font-semibold uppercase tracking-widest ${isZenMode ? 'text-slate-700' : 'text-slate-400'}`}>
              System V1.6.0 // Horizon-X
           </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
}
