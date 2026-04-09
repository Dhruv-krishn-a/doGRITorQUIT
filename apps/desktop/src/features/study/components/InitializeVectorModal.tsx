"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from"react-dom";
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

 const springConfig = { type:"spring" as const, stiffness: 300, damping: 25 };

 const content = (
  <AnimatePresence>
   {isOpen && (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6">
     {/* Frosted Glass Backdrop */}
     <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
     />
     
     {/* Modal Container */}
     <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={springConfig}
      className="relative w-full max-w-4xl bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-[var(--border-color)] overflow-hidden antialiased"
     >
      <div className="p-8 md:p-12 relative z-10">
       <header className="flex justify-between items-center mb-10">
        <div>
         <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Initialize New Vector</h2>
         <p className="text-[var(--text-secondary)] font-black text-xs uppercase tracking-[0.2em] mt-1">Select your tracking mechanism</p>
        </div>
        <button 
         onClick={onClose} 
         className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 rounded-xl transition-all active:scale-95 shadow-sm"
        >
         <X size={20} />
        </button>
       </header>

       <div className="space-y-8 text-left">
        {/* Study Vectors */}
        <div>
         <div className="text-[10px] font-black text-[var(--text-secondary)] mb-4 uppercase tracking-[0.2em] ml-2">Study Vectors</div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
           onClick={() => { openModal('CREATE_COURSE'); onClose(); }}
           className="flex flex-col items-center justify-center gap-4 p-8 bg-[var(--bg-secondary)]/40 backdrop-blur-md border border-[var(--border-color)] rounded-[2rem] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group active:scale-95"
          >
           <div className="p-5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all group-hover:scale-110 shadow-sm border border-blue-500/20">
            <BookOpen size={32} />
           </div>
           <div className="text-center text-left items-center flex flex-col">
            <span className="font-black text-sm uppercase tracking-widest text-[var(--text-primary)] italic">New Course</span>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">Track structured learning</p>
           </div>
          </button>

          <button 
           onClick={() => { openModal('CREATE_PROJECT'); onClose(); }}
           className="flex flex-col items-center justify-center gap-4 p-8 bg-[var(--bg-secondary)]/40 backdrop-blur-md border border-[var(--border-color)] rounded-[2rem] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group active:scale-95"
          >
           <div className="p-5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:scale-110 shadow-sm border border-emerald-500/20">
            <Briefcase size={32} />
           </div>
           <div className="text-center text-left items-center flex flex-col">
            <span className="font-black text-sm uppercase tracking-widest text-[var(--text-primary)] italic">New Project</span>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">Manage complex builds</p>
           </div>
          </button>

          <button 
           onClick={() => { openModal('IMPORT_YOUTUBE'); onClose(); }}
           className="flex flex-col items-center justify-center gap-4 p-8 bg-[var(--bg-secondary)]/40 backdrop-blur-md border border-[var(--border-color)] rounded-[2rem] hover:border-red-500/30 hover:bg-red-500/5 transition-all group active:scale-95"
          >
           <div className="p-5 bg-red-500/10 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all group-hover:scale-110 shadow-sm border border-red-500/20">
            <Youtube size={32} />
           </div>
           <div className="text-center text-left items-center flex flex-col">
            <span className="font-black text-sm uppercase tracking-widest text-[var(--text-primary)] italic">New Media</span>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">Track a video playlist</p>
           </div>
          </button>
         </div>
        </div>

        <div className="h-px bg-[var(--border-color)]" />

        {/* Roadmaps */}
        <div>
         <div className="flex justify-between items-center mb-4 ml-2 text-left">
          <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Roadmaps</div>
          {isLimitReached && <div className="text-[10px] font-black text-amber-500 flex items-center gap-1"><Lock size={12} /> Limit Reached ({plansCount}/{maxPlans})</div>}
         </div>
         
         {isLimitReached ? (
          <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] text-center">
            <p className="text-sm font-black text-amber-500 uppercase italic">Threshold Reached. Evolve plan to expand capacity.</p>
          </div>
         ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <button 
            onClick={() => { onAiArchitect(); onClose(); }}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-[var(--accent-color)]/10 to-fuchsia-500/10 backdrop-blur-md border border-[var(--border-color)] rounded-[2rem] hover:border-[var(--accent-color)]/30 hover:shadow-xl transition-all group active:scale-95"
           >
            <div className="p-5 bg-gradient-to-br from-[var(--accent-color)] to-fuchsia-500 text-white rounded-2xl group-hover:scale-110 transition-all shadow-md">
             <Sparkles size={32} />
            </div>
            <div className="text-center text-left items-center flex flex-col">
             <span className="font-black text-sm uppercase tracking-widest text-[var(--text-primary)] italic">AI Architect</span>
             <p className="text-[10px] font-bold text-[var(--accent-color)] mt-1 uppercase tracking-tighter">Generate detailed plans</p>
            </div>
           </button>

           <button 
            onClick={() => { onImportExcel(); onClose(); }}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-[var(--bg-secondary)]/40 backdrop-blur-md border border-[var(--border-color)] rounded-[2rem] hover:border-green-500/30 hover:bg-green-500/5 transition-all group active:scale-95"
           >
            <div className="p-5 bg-green-500/10 text-green-500 rounded-2xl group-hover:bg-green-500 group-hover:text-white transition-all group-hover:scale-110 shadow-sm border border-green-500/20">
             <FileSpreadsheet size={32} />
            </div>
            <div className="text-center text-left items-center flex flex-col">
             <span className="font-black text-sm uppercase tracking-widest text-[var(--text-primary)] italic">Import Excel</span>
             <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">Use existing data</p>
            </div>
           </button>

           <button 
            onClick={() => { onManualEntry(); onClose(); }}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-[var(--bg-secondary)]/40 backdrop-blur-md border border-[var(--border-color)] rounded-[2rem] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-secondary)] transition-all group active:scale-95"
           >
            <div className="p-5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)] transition-all group-hover:scale-110 shadow-sm border border-[var(--border-color)]">
             <PenTool size={32} />
            </div>
            <div className="text-center text-left items-center flex flex-col">
             <span className="font-black text-sm uppercase tracking-widest text-[var(--text-primary)] italic">Manual Entry</span>
             <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">Start from scratch</p>
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
