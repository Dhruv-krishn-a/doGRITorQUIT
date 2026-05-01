"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useStudy, studyApi } from '@gritorquit/study-core';
import { toast } from 'sonner';
import Modal from './Modal';

export function CreateTrackModal() {
  const { closeModal, fetchDashboard } = useStudy();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await studyApi.createTrack({
        title,
        description,
        type: 'COURSE' 
      } as any);
      toast.success('Path initialized');
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
      title="Start New Path"
      panelClassName="!max-w-2xl"
    >
      <form onSubmit={handleCreate} className="transform-gpu space-y-8">
        <div className="transform-gpu space-y-6">
          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Path Title *</label>
            <input 
                autoFocus 
                required 
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm uppercase italic" 
                placeholder="E.g., System Design Deep Dive" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Brief Description</label>
            <textarea 
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic resize-none" 
                placeholder="What is the objective of this path?" 
                rows={3}
                value={description} 
                onChange={e => setDescription(e.target.value)} 
            />
          </div>
        </div>

        <div className="transform-gpu pt-6 border-t border-[var(--border-color)]">
          <button disabled={loading} type="submit" className="transform-gpu w-full bg-[var(--accent-color)] text-[var(--bg-primary)] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all flex items-center justify-center gap-3 group active:scale-95 italic">
            {loading ? <Loader2 className="transform-gpu animate-spin" size={18} /> : <Sparkles size={18} className="transform-gpu group-hover:rotate-12 transition-transform" />}
            {loading ? 'Initializing Path...' : 'Start Learning Path'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
