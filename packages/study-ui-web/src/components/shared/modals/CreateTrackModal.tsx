"use client";

import React from 'react';
import { X, Youtube, Briefcase, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudy } from '@gritorquit/study-core';

export function CreateTrackModal() {
  const { closeModal, openModal } = useStudy();

  return (
    <div className="transform-gpu fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="transform-gpu absolute inset-0 bg-[#0a0105]/90 backdrop-blur-2xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="transform-gpu relative w-full max-w-3xl bg-[#14030b] rounded-[2.5rem] shadow-[0_25px_90px_rgba(12,3,8,0.85)] overflow-hidden border border-rose-900/50"
      >
        <div className="transform-gpu p-8 md:p-12">
          <header className="transform-gpu flex justify-between items-center mb-12">
            <div>
              <h2 className="transform-gpu text-3xl font-bold text-rose-50 tracking-tight uppercase">Initialize Track</h2>
              <p className="transform-gpu text-rose-400/60 font-bold text-xs uppercase tracking-[0.2em] mt-1">Select your step type</p>
            </div>
            <button onClick={closeModal} className="transform-gpu p-3 bg-[#1c0510] text-rose-400/50 hover:text-rose-400 border border-rose-900/50 hover:border-rose-500/50 rounded-xl transition-all">
              <X size={20} />
            </button>
          </header>

          <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => openModal('IMPORT_YOUTUBE')}
              className="transform-gpu flex flex-col items-center justify-center gap-6 p-10 bg-[#1c0510] border border-red-900/40 rounded-[2.5rem] hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] transition-all group"
            >
              <div className="transform-gpu p-6 bg-red-500/10 text-red-500 rounded-3xl group-hover:bg-red-500 group-hover:text-white transition-all border border-red-500/20 group-hover:border-red-400 group-hover:scale-110">
                <Youtube size={40} />
              </div>
              <div className="transform-gpu text-center space-y-2">
                <span className="transform-gpu font-bold text-base uppercase tracking-widest text-red-50">YouTube</span>
                <p className="transform-gpu text-[10px] text-red-400/50 font-bold uppercase tracking-widest">Playlist Import</p>
              </div>
            </button>

            <button 
              onClick={() => openModal('CREATE_PROJECT')}
              className="transform-gpu flex flex-col items-center justify-center gap-6 p-10 bg-[#1c0510] border border-emerald-900/40 rounded-[2.5rem] hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all group"
            >
              <div className="transform-gpu p-6 bg-emerald-500/10 text-emerald-500 rounded-3xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-500/20 group-hover:border-emerald-400 group-hover:scale-110">
                <Briefcase size={40} />
              </div>
              <div className="transform-gpu text-center space-y-2">
                <span className="transform-gpu font-bold text-base uppercase tracking-widest text-emerald-50">Project</span>
                <p className="transform-gpu text-[10px] text-emerald-400/50 font-bold uppercase tracking-widest">Plan & Execute</p>
              </div>
            </button>

            <button 
              onClick={() => openModal('CREATE_COURSE')}
              className="transform-gpu flex flex-col items-center justify-center gap-6 p-10 bg-[#1c0510] border border-fuchsia-900/40 rounded-[2.5rem] hover:border-fuchsia-500/50 hover:shadow-[0_0_30px_rgba(217,70,239,0.1)] transition-all group"
            >
              <div className="transform-gpu p-6 bg-fuchsia-500/10 text-fuchsia-500 rounded-3xl group-hover:bg-fuchsia-500 group-hover:text-white transition-all border border-fuchsia-500/20 group-hover:border-fuchsia-400 group-hover:scale-110">
                <BookOpen size={40} />
              </div>
              <div className="transform-gpu text-center space-y-2">
                <span className="transform-gpu font-bold text-base uppercase tracking-widest text-fuchsia-50">Course</span>
                <p className="transform-gpu text-[10px] text-fuchsia-400/50 font-bold uppercase tracking-widest">Structured Study</p>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
