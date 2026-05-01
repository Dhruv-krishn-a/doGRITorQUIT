"use client";

import React, { useEffect } from 'react';
import { Plus, RefreshCw, Loader2, History } from 'lucide-react';
import { useStudy } from '@gritorquit/study-core';
import { TrackCard } from '@gritorquit/study-ui-web';
import { useRouter } from 'next/navigation';

export function MediaTrackerView() {
  const router = useRouter();
  const { tracks, loading, fetchDashboard, openModal, deleteTrack } = useStudy();

  useEffect(() => { 
    fetchDashboard(); 
  }, [fetchDashboard]);

  const mediaTracks = tracks.filter(t => t.type === 'PLAYLIST');

  if (loading) return (
    <div className="transform-gpu flex items-center justify-center min-h-[60vh] bg-[var(--bg-primary)] w-full">
      <div className="transform-gpu flex flex-col items-center gap-4">
        <Loader2 className="transform-gpu w-8 h-8 text-[var(--accent-color)] animate-spin" />
        <div className="transform-gpu text-[var(--text-secondary)] font-bold uppercase tracking-widest text-xs">Booting OS...</div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--accent-color)]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12 pt-10 pb-24 px-6 md:px-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 pb-8 border-b border-[var(--border-color)]">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tighter uppercase italic">
              Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-sky-500">Tracker</span>
            </h1>
            <p className="text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
              Track your video playlists and media paths
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => openModal('IMPORT_YOUTUBE')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all duration-300 shadow-xl shadow-[var(--accent-color)]/20 hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={16} /> New Media
            </button>
            <button 
              onClick={() => { router.refresh(); fetchDashboard(); }} 
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-black text-xs uppercase tracking-widest hover:text-[var(--text-primary)] transition-all shadow-sm active:scale-95"
            >
              <History size={16} /> Sync
            </button>
          </div>
        </header>

        {mediaTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed border-[var(--border-color)] rounded-[3.5rem] bg-[var(--bg-card)]/30 backdrop-blur-sm p-10 text-center">
             <div className="p-6 bg-[var(--bg-secondary)] rounded-3xl text-[var(--accent-color)] mb-6 shadow-sm border border-[var(--border-color)]">
               <RefreshCw size={40} />
             </div>
             <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-2">No Media Found</h3>
             <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest max-w-md mx-auto mb-8 leading-relaxed opacity-60">
               Import a YouTube playlist to begin tracking your media-based learning.
             </p>
             <button 
                onClick={() => openModal('IMPORT_YOUTUBE')}
                className="flex items-center gap-3 px-8 py-4 rounded-full border border-[var(--accent-color)]/50 text-[var(--accent-color)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] transition-all"
              >
                Import Playlist <Plus size={14} />
              </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mediaTracks.map((track) => (
               <div className="transform-gpu group transition-all duration-300 hover:-translate-y-1 h-full" key={track.id}>
                 <TrackCard track={track} onDelete={deleteTrack} />
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
