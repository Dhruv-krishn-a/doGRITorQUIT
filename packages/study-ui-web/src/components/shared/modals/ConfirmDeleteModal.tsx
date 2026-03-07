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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
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
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="p-8 md:p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertCircle size={40} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Delete this track?</h2>
          <p className="text-slate-500 font-medium leading-relaxed text-sm mb-8">
            You are about to delete <span className="text-slate-900 font-bold">"{activeTrack.track.title}"</span>. 
            All your progress and lessons for this course will be lost forever.
          </p>

          <div className="flex flex-col w-full gap-3">
            <button 
              disabled={loading}
              onClick={handleDelete}
              className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              {loading ? 'Deleting...' : 'Yes, Delete Track'}
            </button>
            <button 
              type="button" 
              onClick={closeModal} 
              className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
