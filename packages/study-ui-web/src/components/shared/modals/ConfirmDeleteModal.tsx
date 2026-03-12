"use client";

import React, { useState } from 'react';
import { X, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudy } from '@planner/study-core';
import { toast } from 'sonner';

export function ConfirmDeleteModal() {
  const { closeModal, activeTrack, deleteTrack } = useStudy();
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  if (!activeTrack) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await deleteTrack(activeTrack.track.id);
      toast.success('Track deleted successfully');
      closeModal();
    } catch (err: any) {
      toast.error('Failed to delete track');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transform-gpu fixed inset-0 z-[1200] flex items-center justify-center p-4">
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
        className="transform-gpu relative w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden border border-white transform-gpu antialiased"
      >
        <div className="transform-gpu p-8 md:p-10 flex flex-col items-center text-center">
          <div className="transform-gpu w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertCircle size={40} strokeWidth={2.5} />
          </div>

          <h2 className="transform-gpu text-2xl font-bold text-slate-900 tracking-tight mb-3">Delete this track?</h2>
          <p className="transform-gpu text-slate-500 font-medium leading-relaxed text-sm mb-8">
            You are about to delete <span className="transform-gpu text-slate-900 font-bold">"{activeTrack.track.title}"</span>. 
            All your progress and lessons for this course will be lost forever.
          </p>

          <div className="transform-gpu flex flex-col w-full gap-3">
            <button 
              disabled={loading}
              onClick={handleDelete}
              className="transform-gpu w-full bg-rose-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="transform-gpu animate-spin" size={18} /> : <Trash2 size={18} />}
              {loading ? 'Deleting...' : 'Yes, Delete Track'}
            </button>
            <button 
              type="button" 
              onClick={closeModal} 
              className="transform-gpu w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
