"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, Loader2, Sparkles, 
  Smile, Frown, Meh, Zap, Brain, Target, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '@gritorquit/study-core';
import { toast } from 'sonner';
import Modal from './Modal';

export function WeeklyReflectionModal() {
  const { closeModal, saveWeeklyReflection, activeTrack } = useStudy();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    mood: 3,
    stress: 2,
    wins: '',
    challenges: '',
    focusNext: '',
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveWeeklyReflection(formData);
      toast.success('Reflection recorded. System optimized.');
      closeModal();
    } catch (err: any) {
      toast.error('Failed to save reflection');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Current State', subtitle: 'Syncing cognitive baseline' },
    { title: 'Review Wins', subtitle: 'Analyzing successfully processed nodes' },
    { title: 'Strategic Focus', subtitle: 'Updating next-cycle objectives' }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title={steps[step].title}
      panelClassName="!max-w-2xl"
    >
      <div className="transform-gpu flex flex-col h-full">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`} />
            ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div 
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40 ml-1">Overall Mood</label>
                            <div className="flex justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-[2rem] shadow-inner">
                                {[1, 2, 3, 4, 5].map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setFormData({...formData, mood: m})}
                                        className={`flex-1 py-4 rounded-xl flex items-center justify-center transition-all active:scale-90 ${formData.mood === m ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                    >
                                        {m === 1 && <Frown size={24} />}
                                        {m === 2 && < Meh size={24} />}
                                        {m === 3 && <Meh size={24} className="text-amber-500" />}
                                        {m === 4 && <Smile size={24} />}
                                        {m === 5 && <Smile size={24} className="text-emerald-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40 ml-1">Stress Level</label>
                            <div className="flex justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-[2rem] shadow-inner">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setFormData({...formData, stress: s})}
                                        className={`flex-1 py-4 rounded-xl font-black text-lg transition-all active:scale-90 ${formData.stress === s ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40 ml-1">Key Wins</label>
                            <textarea 
                                value={formData.wins}
                                onChange={e => setFormData({...formData, wins: e.target.value})}
                                placeholder="What nodes did we successfully process this week?"
                                className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] px-8 py-6 font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 italic resize-none"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40 ml-1">Primary Challenges</label>
                            <textarea 
                                value={formData.challenges}
                                onChange={e => setFormData({...formData, challenges: e.target.value})}
                                placeholder="Any cognitive blocks or technical debt encountered?"
                                className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] px-8 py-6 font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 italic resize-none"
                            />
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40 ml-1">Next Cycle focus</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-6">
                                    <Target size={20} className="text-[var(--accent-color)]" />
                                </div>
                                <textarea 
                                    value={formData.focusNext}
                                    onChange={e => setFormData({...formData, focusNext: e.target.value})}
                                    placeholder="What is the singular priority for the upcoming cycle?"
                                    className="w-full h-40 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] pl-16 pr-8 py-6 font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 italic resize-none"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex justify-between items-center gap-4">
            {step > 0 ? (
                <button onClick={handlePrev} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all italic active:scale-95">← Back</button>
            ) : (
                <div />
            )}
            
            {step < steps.length - 1 ? (
                <button onClick={handleNext} className="px-10 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all flex items-center gap-3 active:scale-95 italic">Next Node <ArrowRight size={16} /></button>
            ) : (
                <button disabled={loading} onClick={handleSubmit} className="px-10 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all flex items-center gap-3 active:scale-95 italic">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Commit Reflection
                </button>
            )}
        </div>
      </div>
    </Modal>
  );
}
