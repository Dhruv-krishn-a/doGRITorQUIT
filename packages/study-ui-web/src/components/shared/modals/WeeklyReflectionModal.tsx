"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, Loader2, Sparkles, Brain, Battery, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { useStudy } from '@gritorquit/study-core';
import { toast } from 'sonner';

export function WeeklyReflectionModal() {
  const { closeModal, saveWeeklyReflection } = useStudy();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back
  const [data, setData] = useState({
    moodScore: 3,
    stressLevel: 3,
    answers: {
      wins: '',
      challenges: '',
      focusNextWeek: ''
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveWeeklyReflection(data);
      toast.success("Progress saved successfully");
      closeModal();
    } catch (e) {
      toast.error("Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  const changeStep = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  // Content Slide Animation Configuration
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      filter: 'blur(4px)'
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 40 : -40,
      opacity: 0,
      filter: 'blur(4px)',
      transition: { duration: 0.2 }
    })
  };

  const steps = [
    {
      title: "Weekly Check-in",
      subtitle: "How are your cognitive reserves?",
      content: (
        <div className="transform-gpu space-y-8">
          <div className="transform-gpu space-y-4">
            <label className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-1">Overall Mood</label>
            <div className="transform-gpu flex gap-3">
              {[1, 2, 3, 4, 5].map(v => {
                const isActive = data.moodScore === v;
                return (
                  <motion.button 
                    key={v}
                    whileHover={{ scale: isActive ? 1.05 : 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setData(d => ({ ...d, moodScore: v }))}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                      isActive 
                        ? 'text-white border-transparent shadow-[0_8px_20px_rgba(244,63,94,0.3)] scale-105' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-500 shadow-sm'
                    }`}
                  >
                    {isActive && <motion.div layoutId="activeMood" className="transform-gpu absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-500 -z-10" />}
                    {v}
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="transform-gpu space-y-4">
            <label className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-1">Stress Level</label>
            <div className="transform-gpu flex gap-3">
              {[1, 2, 3, 4, 5].map(v => {
                const isActive = data.stressLevel === v;
                return (
                  <motion.button 
                    key={v}
                    whileHover={{ scale: isActive ? 1.05 : 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setData(d => ({ ...d, stressLevel: v }))}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                      isActive 
                        ? 'text-white border-transparent shadow-[0_8px_20px_rgba(99,102,241,0.3)] scale-105' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 shadow-sm'
                    }`}
                  >
                    {isActive && <motion.div layoutId="activeStress" className="transform-gpu absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 -z-10" />}
                    {v}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Module Retrospective",
      subtitle: "Extract signals from the noise.",
      content: (
        <div className="transform-gpu space-y-6">
          <div className="transform-gpu space-y-3">
            <label className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2 ml-1">
              <Sparkles size={14} className="transform-gpu text-amber-500 drop-shadow-sm" /> What went well?
            </label>
            <textarea 
              className="transform-gpu w-full h-24 bg-white/80 border border-slate-200 rounded-[1.5rem] p-5 font-bold text-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 outline-none resize-none shadow-inner transition-all text-sm placeholder:text-slate-300"
              placeholder="Record your wins and breakthroughs..."
              value={data.answers.wins}
              onChange={e => setData(d => ({ ...d, answers: { ...d.answers, wins: e.target.value } }))}
            />
          </div>
          <div className="transform-gpu space-y-3">
            <label className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2 ml-1">
              <Brain size={14} className="transform-gpu text-indigo-500 drop-shadow-sm" /> Any friction?
            </label>
            <textarea 
              className="transform-gpu w-full h-24 bg-white/80 border border-slate-200 rounded-[1.5rem] p-5 font-bold text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 outline-none resize-none shadow-inner transition-all text-sm placeholder:text-slate-300"
              placeholder="What blocked your momentum?"
              value={data.answers.challenges}
              onChange={e => setData(d => ({ ...d, answers: { ...d.answers, challenges: e.target.value } }))}
            />
          </div>
        </div>
      )
    },
    {
      title: "Future Alignment",
      subtitle: "Set the parameters for next week.",
      content: (
        <div className="transform-gpu space-y-8">
          <div className="transform-gpu bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 shadow-sm p-6 rounded-[2rem] flex items-center gap-5">
             <div className="transform-gpu p-3 bg-white text-emerald-500 rounded-xl shadow-sm">
               <Battery size={24} />
             </div>
             <div>
               <p className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600 mb-1">Weekly Vector</p>
               <p className="transform-gpu text-sm font-bold text-emerald-900 leading-snug">Setting a singular focus optimizes neural retention for the days ahead.</p>
             </div>
          </div>
          
          <div className="transform-gpu space-y-3">
            <label className="transform-gpu text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2 ml-1">
              <Calendar size={14} className="transform-gpu text-rose-500 drop-shadow-sm" /> Primary Objective
            </label>
            <input 
              className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] p-5 font-bold text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none shadow-inner transition-all"
              placeholder="Define your main outcome..."
              value={data.answers.focusNextWeek}
              onChange={e => setData(d => ({ ...d, answers: { ...d.answers, focusNextWeek: e.target.value } }))}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="transform-gpu fixed inset-0 z-[1200] flex items-center justify-center p-4">
      {/* Light Frosted Glass Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="transform-gpu absolute inset-0 bg-slate-900/30 backdrop-blur-sm" 
        onClick={closeModal} 
      />
      
      {/* Premium Glass Modal Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="transform-gpu relative w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden border border-white transform-gpu antialiased flex flex-col"
      >
        {/* Subtle Internal Gradient Canvas */}
        <div className="transform-gpu absolute inset-0 pointer-events-none -z-10 overflow-hidden">
           <div className="transform-gpu absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-rose-200/40 rounded-full blur-[80px]" />
           <div className="transform-gpu absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-fuchsia-200/40 rounded-full blur-[80px]" />
        </div>

        {/* Modal Header */}
        <div className="transform-gpu flex justify-between items-start p-8 md:p-10 pb-6 shrink-0 relative z-10">
          <div>
            <h2 className="transform-gpu text-3xl font-bold text-slate-900 tracking-tighter uppercase">{steps[step].title}</h2>
            <p className="transform-gpu text-xs font-bold text-slate-400 mt-1">{steps[step].subtitle}</p>
          </div>
          <button 
            onClick={closeModal} 
            className="transform-gpu p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 shadow-sm hover:shadow-md rounded-2xl transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Animated Content Area */}
        <div className="transform-gpu min-h-[340px] px-8 md:px-10 relative z-10 flex-1 overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="transform-gpu w-full"
            >
              {steps[step].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="transform-gpu p-8 md:p-10 pt-6 mt-4 relative z-10 flex items-center justify-between">
          
          {/* Step Indicators */}
          <div className="transform-gpu flex gap-1.5 absolute left-1/2 -translate-x-1/2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-6 bg-rose-500' : 'w-2 bg-slate-200'}`} 
              />
            ))}
          </div>

          {step > 0 ? (
            <button 
              onClick={() => changeStep(step - 1)} 
              className="transform-gpu px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all flex items-center gap-2 group"
            >
              <ArrowLeft size={14} className="transform-gpu group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          ) : <div className="transform-gpu w-24" />} {/* Spacer for alignment */}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => step < steps.length - 1 ? changeStep(step + 1) : handleSave()}
            disabled={loading}
            className="transform-gpu group px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale relative overflow-hidden"
          >
            {/* CSS Shimmer/Glass Reflection Effect */}
            <div className="transform-gpu absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
            
            <span className="transform-gpu relative z-10">{loading ? 'Saving...' : step < steps.length - 1 ? 'Next Step' : 'Submit Review'}</span>
            {!loading && (
              <ArrowRight size={14} className="transform-gpu relative z-10 group-hover:translate-x-1 transition-transform" />
            )}
            {loading && <Loader2 size={14} className="transform-gpu animate-spin relative z-10" />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}