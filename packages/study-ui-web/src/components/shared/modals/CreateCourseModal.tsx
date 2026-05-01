"use client";

import React, { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useStudy, studyApi } from '@gritorquit/study-core';
import { toast } from 'sonner';
import Modal from './Modal';

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
      toast.success('Course path initialized');
      fetchDashboard();
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Add Course"
      panelClassName="!max-w-2xl"
    >
      <form onSubmit={handleCreateCourse} className="transform-gpu space-y-8">
        <div className="transform-gpu space-y-6">
          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Course Title *</label>
            <input 
                autoFocus 
                required 
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm uppercase italic" 
                placeholder="E.g., Neural Networks V2" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Syllabus Link (Optional)</label>
            <input 
                type="url" 
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic" 
                placeholder="https://..." 
                value={courseUrl} 
                onChange={e => setCourseUrl(e.target.value)} 
            />
          </div>

          <div className="transform-gpu grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Start Date</label>
              <input 
                type="date" 
                required 
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all text-sm italic" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Target Finish</label>
              <input 
                type="date" 
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all text-sm italic" 
                value={targetDate} 
                onChange={e => setTargetDate(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Weekly Cognitive Budget (Hours)</label>
            <input 
                type="number" 
                placeholder="E.g., 5" 
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic" 
                value={weeklyHours} 
                onChange={e => setWeeklyHours(e.target.value)} 
            />
          </div>
          
          <div className="transform-gpu flex items-center gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-sm">
            <input 
                type="checkbox" 
                id="autoPlan" 
                checked={autoPlan} 
                onChange={e => setAutoPlan(e.target.checked)} 
                className="transform-gpu w-5 h-5 accent-[var(--accent-color)] bg-transparent border-[var(--border-color)] rounded cursor-pointer" 
            />
            <label htmlFor="autoPlan" className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] cursor-pointer italic">Auto-create weekly plan based on budget</label>
          </div>
        </div>

        <div className="transform-gpu pt-6 border-t border-[var(--border-color)]">
          <button disabled={loading} type="submit" className="transform-gpu w-full bg-[var(--accent-color)] text-[var(--bg-primary)] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all flex items-center justify-center gap-3 group active:scale-95 italic">
            {loading ? <Loader2 className="transform-gpu animate-spin" size={18} /> : <BookOpen size={18} className="transform-gpu group-hover:scale-110 transition-transform" />}
            {loading ? 'Initializing Path...' : 'Create Course Path'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
