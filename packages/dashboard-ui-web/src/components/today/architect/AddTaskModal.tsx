"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function AddTaskModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (t: any) => void }) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<'Low' | 'Mid' | 'High'>('Mid');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), duration, intensity });
  };

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 pointer-events-none">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" />
      <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[3rem] shadow-2xl relative pointer-events-auto z-10">
        <button onClick={onClose} className="absolute top-8 right-8 opacity-50 hover:opacity-100"><X size={24} /></button>
        <h2 className="text-3xl font-black mb-8 tracking-tight">New Objective</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Objective Name</label>
            <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., System Design" className="w-full px-6 py-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-black outline-none focus:border-[var(--accent-color)]" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Duration</label>
              <select value={duration} onChange={e=>setDuration(e.target.value)} className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-black appearance-none outline-none focus:border-[var(--accent-color)]">
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Intensity</label>
              <div className="flex p-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl h-[58px]">
                 {['Low', 'Mid', 'High'].map(lvl => (
                   <button type="button" key={lvl} onClick={()=>setIntensity(lvl as any)} className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${intensity === lvl ? 'bg-[var(--bg-card)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-50'}`}>
                     {lvl}
                   </button>
                 ))}
              </div>
            </div>
          </div>
          <button type="submit" className="w-full py-6 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            Add Objective
          </button>
        </form>
      </motion.div>
    </div>
  );
}
