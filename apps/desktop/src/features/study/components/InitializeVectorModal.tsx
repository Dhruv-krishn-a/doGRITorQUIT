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
 onNewProject?: () => void;
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
 onNewProject,
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
   if (e.key === 'Escape' && isOpen) onClose();
  };
  if (isOpen) {
   window.addEventListener('keydown', handleKeyDown);
   document.body.style.overflow = 'hidden';
  }
  return () => {
   window.removeEventListener('keydown', handleKeyDown);
   document.body.style.overflow = 'auto';
  };
 }, [isOpen, onClose]);

 if (!mounted || typeof document === 'undefined') return null;
 const target = document.body;

 const springConfig = { type:"spring" as const, stiffness: 300, damping: 25 };

 const content = (
  <AnimatePresence mode="wait">
   {isOpen && (
    <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 md:p-6 text-left">
     {/* Unified Backdrop with persistent blur */}
     <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-black/70 modal-backdrop-blur z-0"
     />
     
     {/* Modal Container */}
     <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={springConfig}
      className="transform-gpu relative w-full max-w-4xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] overflow-hidden antialiased z-10"
     >
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[var(--accent-color)]/5 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      <div className="p-8 md:p-12 relative z-10">
       <header className="flex justify-between items-center mb-10">
        <div>
         <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">Start New Path</h2>
         <p className="text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-[0.2em] mt-2 italic opacity-60">Select your tracking mechanism</p>
        </div>
        <button 
         onClick={onClose} 
         className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all active:scale-95 shadow-sm hover:shadow-md"
        >
         <X size={20} />
        </button>
       </header>

       <div className="space-y-10">
        {/* Study Paths */}
        <div>
         <div className="text-[10px] font-black text-[var(--text-secondary)] mb-6 uppercase tracking-[0.3em] ml-2 italic opacity-40">Study Paths</div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
           onClick={() => { openModal('CREATE_COURSE'); onClose(); }}
           className="group flex flex-col items-center justify-center gap-6 p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-card)] transition-all active:scale-95 shadow-sm hover:shadow-xl relative overflow-hidden"
          >
           <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <div className="w-16 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all group-hover:scale-110 shadow-inner">
            <BookOpen size={28} />
           </div>
           <div className="text-center">
            <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-primary)] italic">New Course</span>
            <p className="text-[9px] text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-widest opacity-60">Track structured learning</p>
           </div>
          </button>

          <button 
           onClick={() => { if(onNewProject) onNewProject(); else openModal('CREATE_PROJECT'); onClose(); }}
           className="group flex flex-col items-center justify-center gap-6 p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-card)] transition-all active:scale-95 shadow-sm hover:shadow-xl relative overflow-hidden"
          >
           <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <div className="w-16 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:scale-110 shadow-inner">
            <Briefcase size={28} />
           </div>
           <div className="text-center">
            <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-primary)] italic">New Project</span>
            <p className="text-[9px] text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-widest opacity-60">Manage complex builds</p>
           </div>
          </button>

          <button 
           onClick={() => { openModal('IMPORT_YOUTUBE'); onClose(); }}
           className="group flex flex-col items-center justify-center gap-6 p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-card)] transition-all active:scale-95 shadow-sm hover:shadow-xl relative overflow-hidden"
          >
           <div className="absolute top-0 left-0 w-full h-full bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <div className="w-16 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all group-hover:scale-110 shadow-inner">
            <Youtube size={28} />
           </div>
           <div className="text-center">
            <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-primary)] italic">New Media</span>
            <p className="text-[9px] text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-widest opacity-60">Track a video playlist</p>
           </div>
          </button>
         </div>
        </div>

        <div className="h-px bg-[var(--border-color)] opacity-50" />

        {/* Roadmaps */}
        <div>
         <div className="flex justify-between items-center mb-6 ml-2">
          <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] italic opacity-40">Roadmaps</div>
          {isLimitReached && <div className="text-[9px] font-black text-amber-500 flex items-center gap-2 italic uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20"><Lock size={12} /> Limit Reached ({plansCount}/{maxPlans})</div>}
         </div>
         
         {isLimitReached ? (
          <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] text-center">
            <p className="text-xs font-black text-amber-500/80 uppercase tracking-widest italic">You have reached the maximum number of roadmaps. Upgrade to create more.</p>
          </div>
         ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <button 
            onClick={() => { onAiArchitect(); onClose(); }}
            className="group flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-[var(--border-color)] rounded-[2.5rem] hover:border-[var(--accent-color)]/30 hover:shadow-2xl transition-all active:scale-95 shadow-sm relative overflow-hidden"
           >
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--accent-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-16 h-14 bg-gradient-to-br from-[var(--accent-color)] to-indigo-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all shadow-lg">
             <Sparkles size={28} />
            </div>
            <div className="text-center">
             <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-primary)] italic">AI Architect</span>
             <p className="text-[9px] text-[var(--accent-color)] mt-2 font-black uppercase tracking-widest opacity-80 italic">Generate detailed plans</p>
            </div>
           </button>

           <button 
            onClick={() => { onImportExcel(); onClose(); }}
            className="group flex flex-col items-center justify-center gap-6 p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-card)] transition-all active:scale-95 shadow-sm hover:shadow-xl relative overflow-hidden"
           >
            <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-16 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:scale-110 shadow-inner">
             <FileSpreadsheet size={28} />
            </div>
            <div className="text-center">
             <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-primary)] italic">Import Excel</span>
             <p className="text-[9px] text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-widest opacity-60 italic">Use existing data</p>
            </div>
           </button>

           <button 
            onClick={() => { onManualEntry(); onClose(); }}
            className="group flex flex-col items-center justify-center gap-6 p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-card)] transition-all active:scale-95 shadow-sm hover:shadow-xl relative overflow-hidden"
           >
            <div className="absolute top-0 left-0 w-full h-full bg-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-16 h-14 bg-slate-500/10 text-slate-500 rounded-2xl flex items-center justify-center group-hover:bg-slate-500 group-hover:text-white transition-all group-hover:scale-110 shadow-inner">
             <PenTool size={28} />
            </div>
            <div className="text-center">
             <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-primary)] italic">Manual Entry</span>
             <p className="text-[9px] text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-widest opacity-60 italic">Start from scratch</p>
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
