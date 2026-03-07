"use client";

import React, { useState } from 'react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudy, studyApi } from '@planner/study-core';
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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-[#0a0105]/90 backdrop-blur-2xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-[#14030b] rounded-[2rem] shadow-[0_25px_90px_rgba(32,4,22,0.85)] overflow-hidden border border-fuchsia-900/50"
      >
        <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-rose-50 tracking-tight uppercase">Add Course</h2>
              <p className="text-fuchsia-400/60 font-bold text-xs uppercase tracking-[0.1em] mt-1">Structured Learning Vector</p>
            </div>
            <button onClick={closeModal} className="p-3 bg-[#1c0510] text-rose-400/50 hover:text-rose-400 border border-rose-900/50 hover:border-fuchsia-500/50 rounded-xl transition-all">
              <X size={20} />
            </button>
          </header>

          <form onSubmit={handleCreateCourse} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-fuchsia-400/70 mb-2">Course Title</label>
                <input autoFocus required className="w-full bg-[#1c0510] border border-fuchsia-900/40 rounded-xl px-5 py-3 font-bold text-rose-100 focus:border-fuchsia-500 focus:outline-none transition-all placeholder:text-fuchsia-900/50 text-sm" placeholder="E.g., Neural Networks V2" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-fuchsia-400/70 mb-2">Syllabus Link (Optional)</label>
                <input type="url" className="w-full bg-[#1c0510] border border-fuchsia-900/40 rounded-xl px-5 py-3 font-bold text-rose-100 focus:border-fuchsia-500 focus:outline-none transition-all placeholder:text-fuchsia-900/50 text-sm" placeholder="https://..." value={courseUrl} onChange={e => setCourseUrl(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-fuchsia-400/70 mb-2">Start Date</label>
                  <input type="date" required className="w-full bg-[#1c0510] border border-fuchsia-900/40 rounded-xl px-5 py-3 font-bold text-rose-100 focus:border-fuchsia-500 focus:outline-none transition-all text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-fuchsia-400/70 mb-2">Target Finish</label>
                  <input type="date" className="w-full bg-[#1c0510] border border-fuchsia-900/40 rounded-xl px-5 py-3 font-bold text-rose-100 focus:border-fuchsia-500 focus:outline-none transition-all text-sm" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-fuchsia-400/70 mb-2">Weekly Cognitive Budget (Hours)</label>
                <input type="number" placeholder="E.g., 5" className="w-full bg-[#1c0510] border border-fuchsia-900/40 rounded-xl px-5 py-3 font-bold text-rose-100 focus:border-fuchsia-500 focus:outline-none transition-all placeholder:text-fuchsia-900/50 text-sm" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)} />
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-[#1c0510] border border-fuchsia-900/40 rounded-xl">
                <input type="checkbox" id="autoPlan" checked={autoPlan} onChange={e => setAutoPlan(e.target.checked)} className="w-4 h-4 accent-fuchsia-500 bg-transparent border-fuchsia-900/50 rounded" />
                <label htmlFor="autoPlan" className="text-sm font-bold text-rose-100 cursor-pointer">Auto-create weekly plan based on budget</label>
              </div>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit" className="w-full bg-linear-to-r from-fuchsia-600 to-purple-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_0_15px_rgba(217,70,239,0.4)] border border-fuchsia-400/50 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <BookOpen size={16} />}
                {loading ? 'Initializing Course...' : 'Create Course Vector'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
