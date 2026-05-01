"use client";

import React, { useState } from 'react';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useStudy } from '@gritorquit/study-core';
import { toast } from 'sonner';
import Modal from './Modal';

export function ConfirmDeleteModal() {
  const { closeModal, activeTrack, deleteTrack } = useStudy();
  const [loading, setLoading] = useState(false);

  if (!activeTrack) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTrack(activeTrack.track.id);
      toast.success('Path deleted successfully');
      closeModal();
    } catch (err: any) {
      toast.error('Failed to delete path');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Delete Path?"
      panelClassName="!max-w-md"
    >
      <div className="transform-gpu flex flex-col items-center text-center">
        <div className="transform-gpu w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <AlertCircle size={40} strokeWidth={2.5} />
        </div>

        <p className="transform-gpu text-[var(--text-secondary)] font-bold leading-relaxed text-sm mb-10 uppercase italic">
          You are about to delete <span className="transform-gpu text-[var(--text-primary)] font-black">"{activeTrack.track.title}"</span>. 
          All your progress and lessons for this path will be lost forever.
        </p>

        <div className="transform-gpu flex flex-col w-full gap-4">
          <button 
            disabled={loading}
            onClick={handleDelete}
            className="transform-gpu w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 italic active:scale-95"
          >
            {loading ? <Loader2 className="transform-gpu animate-spin" size={18} /> : <Trash2 size={18} />}
            {loading ? 'Deleting...' : 'Yes, Delete Path'}
          </button>
          <button 
            type="button" 
            onClick={closeModal} 
            className="transform-gpu w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all italic active:scale-95 border border-transparent hover:border-[var(--border-color)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
