"use client";

import React, { useState } from 'react';
import { Youtube, Loader2 } from 'lucide-react';
import { useStudy, studyApi } from '@gritorquit/study-core';
import { toast } from 'sonner';
import Modal from './Modal';

export function ImportYoutubeModal() {
  const { closeModal, fetchDashboard } = useStudy();
  const [loading, setLoading] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl) return;
    setLoading(true);
    try {
      await studyApi.importPlaylist(playlistUrl);
      toast.success('Media path imported');
      fetchDashboard();
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="New Media"
      panelClassName="!max-w-2xl"
    >
      <form onSubmit={handleImport} className="transform-gpu space-y-8 pb-4">
        <div className="transform-gpu space-y-6">
          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Playlist URL *</label>
            <input 
              autoFocus 
              required 
              type="url"
              className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic" 
              placeholder="https://www.youtube.com/playlist?list=..." 
              value={playlistUrl} 
              onChange={e => setPlaylistUrl(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Custom Path Title (Optional)</label>
            <input 
              className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm uppercase italic" 
              placeholder="E.G. SYSTEM DESIGN MASTERCLASS" 
              value={customTitle} 
              onChange={e => setCustomTitle(e.target.value)} 
            />
          </div>
        </div>

        <div className="transform-gpu pt-6 border-t border-[var(--border-color)]">
          <button disabled={loading} type="submit" className="transform-gpu w-full bg-red-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-3 group active:scale-95 italic">
            {loading ? <Loader2 className="transform-gpu animate-spin" size={18} /> : <Youtube size={18} className="transform-gpu group-hover:scale-110 transition-transform" />}
            {loading ? 'Initializing Stream...' : 'Import Media Path'}
          </button>
        </div>

        <div className="transform-gpu p-6 bg-red-500/5 border border-red-500/10 rounded-2xl mb-2">
            <p className="transform-gpu text-[10px] text-red-500/60 font-black uppercase tracking-widest leading-relaxed text-center italic">
                We will automatically fetch all videos, durations, and metadata to build your tracking engine.
            </p>
        </div>
      </form>
    </Modal>
  );
}
