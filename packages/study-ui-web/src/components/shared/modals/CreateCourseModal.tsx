"use client";

import React, { useState } from 'react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudy, studyApi } from '@gritorquit/study-core';
import { toast } from 'sonner';

export function CreateCourseModal() {
  const { closeModal, fetchDashboard } = useStudy();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [courseUrl, setCourseUrl] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [autoPlan, setAutoPlan] = useState(true);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await studyApi.createTrack({
        title,
        description,
        type: 'COURSE',
        targetDate: targetDate || undefined,
        link: courseUrl
      } as any);
      toast.success('Course vector initialized');
      fetchDashboard();
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transform-gpu fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="transform-gpu absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="transform-gpu relative w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden border border-white transform-gpu antialiased"
      >
        <div className="transform-gpu p-8 md:p-10 max-h-[90vh] overflow-y-auto no-scrollbar relative z-10">
          <header className="transform-gpu flex justify-between items-center mb-8">
            <div>
              <h2 className="transform-gpu text-2xl font-bold text-slate-900 tracking-tighter uppercase">Add Course</h2>
              <p className="transform-gpu text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Structured Learning Vector</p>
            </div>
            <button onClick={closeModal} className="transform-gpu p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm hover:shadow-md rounded-xl transition-all">
              <X size={20} />
            </button>
          </header>

          <form onSubmit={handleCreateCourse} className="transform-gpu space-y-6">
            <div className="transform-gpu space-y-4">
              <div>
                <label className="transform-gpu block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-2">Course Title</label>
                <input autoFocus required className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all placeholder:text-slate-300 shadow-inner text-sm" placeholder="E.g., Neural Networks V2" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              
              <div>
                <label className="transform-gpu block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-2">Syllabus Link (Optional)</label>
                <input type="url" className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all placeholder:text-slate-300 shadow-inner text-sm" placeholder="https://..." value={courseUrl} onChange={e => setCourseUrl(e.target.value)} />
              </div>

              <div className="transform-gpu grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="transform-gpu block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-2">Start Date</label>
                  <input type="date" required className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="transform-gpu block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-2">Target Finish</label>
                  <input type="date" className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all text-sm" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="transform-gpu block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-2">Weekly Cognitive Budget (Hours)</label>
                <input type="number" placeholder="E.g., 5" className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all placeholder:text-slate-300 shadow-inner text-sm" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)} />
              </div>
              
              <div className="transform-gpu flex items-center gap-3 p-5 bg-white/60 border border-slate-100 rounded-[1.5rem] shadow-sm">
                <input type="checkbox" id="autoPlan" checked={autoPlan} onChange={e => setAutoPlan(e.target.checked)} className="transform-gpu w-4 h-4 accent-rose-500 bg-transparent border-slate-200 rounded" />
                <label htmlFor="autoPlan" className="transform-gpu text-sm font-bold text-slate-600 cursor-pointer">Auto-create weekly plan based on budget</label>
              </div>
            </div>

            <div className="transform-gpu pt-4">
              <button disabled={loading} type="submit" className="transform-gpu w-full bg-linear-to-r from-rose-500 to-fuchsia-500 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:from-rose-400 hover:to-fuchsia-400 shadow-[0_8px_20px_rgba(244,63,94,0.25)] border border-rose-400/20 transition-all flex items-center justify-center gap-2 group">
                {loading ? <Loader2 className="transform-gpu animate-spin" size={16} /> : <BookOpen size={16} className="transform-gpu group-hover:scale-110 transition-transform" />}
                {loading ? 'Initializing Course...' : 'Create Course Vector'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
