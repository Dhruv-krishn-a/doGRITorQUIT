"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Briefcase, BookOpen, Sparkles, FileSpreadsheet, PenTool, Lock } from 'lucide-react';
import { useStudy } from '@gritorquit/study-core';

interface InitializeVectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAiArchitect: () => void;
  onImportExcel: () => void;
  onManualEntry: () => void;
  isLimitReached?: boolean;
  plansCount?: number;
  maxPlans?: number;
}

export function InitializeVectorModal({ 
  isOpen, 
  onClose,
  onAiArchitect,
  onImportExcel,
  onManualEntry,
  isLimitReached,
  plansCount,
  maxPlans
}: InitializeVectorModalProps) {
  const { openModal } = useStudy();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || typeof document === 'undefined') return null;
  const target = document.getElementById('study-modal-root') || document.body;

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="transform-gpu fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6">
          {/* Frosted Glass Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="transform-gpu absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springConfig}
            className="transform-gpu relative w-full max-w-4xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60_rgba(0,0,0,0.15)] border border-white overflow-hidden transform-gpu antialiased"
          >
            {/* Animated Background Gradients */}
            <div className="transform-gpu absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full blur-[80px] mix-blend-multiply pointer-events-none" />
            <div className="transform-gpu absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

            <div className="transform-gpu p-8 md:p-12 relative z-10">
              <header className="transform-gpu flex justify-between items-center mb-10">
                <div>
                  <h2 className="transform-gpu text-3xl font-bold text-slate-900 tracking-tighter uppercase">Initialize New Vector</h2>
                  <p className="transform-gpu text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Select your tracking mechanism</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="transform-gpu p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm hover:shadow-md rounded-xl transition-all active:scale-95"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="transform-gpu space-y-8">
                {/* Study Vectors */}
                <div>
                  <div className="transform-gpu text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-[0.2em] ml-2">Study Vectors</div>
                  <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button 
                      onClick={() => { openModal('CREATE_COURSE'); onClose(); }}
                      className="transform-gpu flex flex-col items-center justify-center gap-4 p-8 bg-white/60 backdrop-blur-md border border-slate-100 rounded-[2rem] hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-[0_8px_30_rgba(59,130,246,0.1)] transition-all group active:scale-95"
                    >
                      <div className="transform-gpu p-5 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
                        <BookOpen size={32} />
                      </div>
                      <div className="transform-gpu text-center">
                        <span className="transform-gpu font-bold text-sm uppercase tracking-widest text-slate-800">New Course</span>
                        <p className="transform-gpu text-[10px] text-slate-400 mt-1">Track structured learning</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => { openModal('CREATE_PROJECT'); onClose(); }}
                      className="transform-gpu flex flex-col items-center justify-center gap-4 p-8 bg-white/60 backdrop-blur-md border border-slate-100 rounded-[2rem] hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-[0_8px_30_rgba(16,185,129,0.1)] transition-all group active:scale-95"
                    >
                      <div className="transform-gpu p-5 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
                        <Briefcase size={32} />
                      </div>
                      <div className="transform-gpu text-center">
                        <span className="transform-gpu font-bold text-sm uppercase tracking-widest text-slate-800">New Project</span>
                        <p className="transform-gpu text-[10px] text-slate-400 mt-1">Manage complex builds</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => { openModal('IMPORT_YOUTUBE'); onClose(); }}
                      className="transform-gpu flex flex-col items-center justify-center gap-4 p-8 bg-white/60 backdrop-blur-md border border-slate-100 rounded-[2rem] hover:border-red-200 hover:bg-red-50/50 hover:shadow-[0_8px_30_rgba(239,68,68,0.1)] transition-all group active:scale-95"
                    >
                      <div className="transform-gpu p-5 bg-red-50 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
                        <Youtube size={32} />
                      </div>
                      <div className="transform-gpu text-center">
                        <span className="transform-gpu font-bold text-sm uppercase tracking-widest text-slate-800">New Media</span>
                        <p className="transform-gpu text-[10px] text-slate-400 mt-1">Track a video playlist</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="transform-gpu h-px bg-slate-100" />

                {/* Roadmaps */}
                <div>
                  <div className="transform-gpu flex justify-between items-center mb-4 ml-2">
                    <div className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Roadmaps</div>
                    {isLimitReached && <div className="transform-gpu text-[10px] font-bold text-amber-500 flex items-center gap-1"><Lock size={12} /> Limit Reached ({plansCount}/{maxPlans})</div>}
                  </div>
                  
                  {isLimitReached ? (
                    <div className="transform-gpu p-6 bg-amber-50/50 border border-amber-100/50 rounded-[2rem] text-center">
                        <p className="transform-gpu text-sm font-bold text-amber-700">You have reached the maximum number of roadmaps. Upgrade to create more.</p>
                    </div>
                  ) : (
                    <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-6">
                      <button 
                        onClick={() => { onAiArchitect(); onClose(); }}
                        className="transform-gpu flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-rose-50/50 to-fuchsia-50/50 backdrop-blur-md border border-rose-100/50 rounded-[2rem] hover:border-rose-300 hover:shadow-[0_8px_30_rgba(244,63,94,0.15)] transition-all group active:scale-95"
                      >
                        <div className="transform-gpu p-5 bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white rounded-2xl group-hover:scale-110 transition-all shadow-md">
                          <Sparkles size={32} />
                        </div>
                        <div className="transform-gpu text-center">
                          <span className="transform-gpu font-bold text-sm uppercase tracking-widest text-slate-900">AI Architect</span>
                          <p className="transform-gpu text-[10px] text-rose-600/80 mt-1">Generate detailed plans</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => { onImportExcel(); onClose(); }}
                        className="transform-gpu flex flex-col items-center justify-center gap-4 p-8 bg-white/60 backdrop-blur-md border border-slate-100 rounded-[2rem] hover:border-green-200 hover:bg-green-50/50 hover:shadow-[0_8px_30_rgba(34,197,94,0.1)] transition-all group active:scale-95"
                      >
                        <div className="transform-gpu p-5 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-500 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
                          <FileSpreadsheet size={32} />
                        </div>
                        <div className="transform-gpu text-center">
                          <span className="transform-gpu font-bold text-sm uppercase tracking-widest text-slate-800">Import Excel</span>
                          <p className="transform-gpu text-[10px] text-slate-400 mt-1">Use existing data</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => { onManualEntry(); onClose(); }}
                        className="transform-gpu flex flex-col items-center justify-center gap-4 p-8 bg-white/60 backdrop-blur-md border border-slate-100 rounded-[2rem] hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-[0_8px_30_rgba(100,116,139,0.1)] transition-all group active:scale-95"
                      >
                        <div className="transform-gpu p-5 bg-slate-100 text-slate-600 rounded-2xl group-hover:bg-slate-600 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
                          <PenTool size={32} />
                        </div>
                        <div className="transform-gpu text-center">
                          <span className="transform-gpu font-bold text-sm uppercase tracking-widest text-slate-800">Manual Entry</span>
                          <p className="transform-gpu text-[10px] text-slate-400 mt-1">Start from scratch</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, target);
}
