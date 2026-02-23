"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Sparkles, Brain, Battery, Calendar } from 'lucide-react';
import { useStudy } from '@planner/study-core';
import { toast } from 'sonner';

export function WeeklyReflectionModal() {
  const { closeModal, saveWeeklyReflection } = useStudy();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
      toast.success("Progress saved");
      closeModal();
    } catch (e) {
      toast.error("Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Weekly Check-in",
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">How was your mood?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button 
                  key={v}
                  onClick={() => setData(d => ({ ...d, moodScore: v }))}
                  className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${data.moodScore === v ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Stress Level</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button 
                  key={v}
                  onClick={() => setData(d => ({ ...d, stressLevel: v }))}
                  className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${data.stressLevel === v ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Lessons",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <Sparkles size={12} className="text-amber-400" /> What went well?
            </label>
            <textarea 
              className="w-full h-20 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-sm focus:border-rose-300 outline-none resize-none"
              placeholder="Tell us about your wins..."
              value={data.answers.wins}
              onChange={e => setData(d => ({ ...d, answers: { ...d.answers, wins: e.target.value } }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <Brain size={12} className="text-indigo-400" /> Any challenges?
            </label>
            <textarea 
              className="w-full h-20 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-sm focus:border-rose-300 outline-none resize-none"
              placeholder="What blocked you this week?"
              value={data.answers.challenges}
              onChange={e => setData(d => ({ ...d, answers: { ...d.answers, challenges: e.target.value } }))}
            />
          </div>
        </div>
      )
    },
    {
      title: "Looking Ahead",
      content: (
        <div className="space-y-6">
          <div className="bg-rose-50 p-6 rounded-[2rem] flex items-center gap-4">
             <Battery size={24} className="text-rose-600" />
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Weekly Goal</p>
               <p className="text-sm font-bold text-slate-900 leading-tight">Setting a focus helps you stay on track for the new week.</p>
             </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <Calendar size={12} className="text-emerald-400" /> Next Week's Focus
            </label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-sm focus:border-rose-300 outline-none"
              placeholder="One main goal for next week..."
              value={data.answers.focusNextWeek}
              onChange={e => setData(d => ({ ...d, answers: { ...d.answers, focusNextWeek: e.target.value } }))}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
        onClick={closeModal} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Progress Review</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Step {step + 1} of {steps.length}</p>
          </div>
          <button onClick={closeModal} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><X size={20} /></button>
        </div>

        <div className="min-h-[300px]">
          <h3 className="text-lg font-black text-slate-800 mb-6">{steps[step].title}</h3>
          {steps[step].content}
        </div>

        <div className="flex gap-4 mt-8 pt-8 border-t border-slate-50">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
              Back
            </button>
          )}
          <button 
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : handleSave()}
            disabled={loading}
            className="flex-1 bg-slate-900 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : step < steps.length - 1 ? 'Next' : 'Submit Review'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
