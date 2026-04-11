"use client";

import React, { useState } from 'react';
import { X, Youtube, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudy, studyApi } from '@gritorquit/study-core';
import { toast } from 'sonner';

export function ImportYoutubeModal() {
  const { closeModal, fetchDashboard } = useStudy();
  const [loading, setLoading] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');

  const handleImportYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl) return;
    setLoading(true);
    try {
      await studyApi.importPlaylist(playlistUrl, undefined);
      toast.success('YouTube Playlist imported successfully');
      fetchDashboard();
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <div className="transform-gpu fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6">
      {/* Light Frosted Glass Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="transform-gpu absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      
      {/* Premium Glass Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={springConfig}
        className="transform-gpu relative w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white overflow-hidden transform-gpu antialiased flex flex-col"
      >
        {/* Subtle Internal Gradient Canvas */}
        <div className="transform-gpu absolute inset-0 pointer-events-none -z-10 overflow-hidden">
           <div className="transform-gpu absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-rose-200/40 rounded-full blur-[80px]" />
           <div className="transform-gpu absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-red-100/40 rounded-full blur-[80px]" />
        </div>

        <div className="transform-gpu p-8 md:p-10 relative z-10">
          <header className="transform-gpu flex justify-between items-start mb-8">
            <div className="transform-gpu flex gap-4 items-center">
              <div className="transform-gpu p-3.5 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl shadow-lg shadow-red-200">
                <Youtube size={24} />
              </div>
              <div>
                <h2 className="transform-gpu text-2xl font-bold text-slate-900 tracking-tighter uppercase">Import YouTube</h2>
                <p className="transform-gpu text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Playlist or Video Step</p>
              </div>
            </div>
            <button 
              onClick={closeModal} 
              className="transform-gpu p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm hover:shadow-md rounded-xl transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </header>

          <form onSubmit={handleImportYouTube} className="transform-gpu space-y-8">
            <div className="transform-gpu space-y-5">
              <div className="transform-gpu space-y-2">
                <label className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
                  YouTube URL <span className="transform-gpu text-red-500">*</span>
                </label>
                <input 
                  autoFocus 
                  required 
                  type="url" 
                  className="transform-gpu w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50 outline-none transition-all shadow-inner text-sm" 
                  placeholder="https://youtube.com/playlist?list=..." 
                  value={playlistUrl} 
                  onChange={e => setPlaylistUrl(e.target.value)} 
                />
              </div>
            </div>

            <div className="transform-gpu pt-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || !playlistUrl} 
                type="submit" 
                className="transform-gpu w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(15,23,42,0.3)] hover:shadow-[0_12px_25px_rgba(15,23,42,0.4)] hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none relative overflow-hidden group/btn"
              >
                {/* CSS Shimmer/Glass Reflection Effect */}
                {!loading && playlistUrl && (
                  <div className="transform-gpu absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                )}
                
                {loading ? <Loader2 className="transform-gpu animate-spin relative z-10" size={18} /> : <Youtube size={18} className="transform-gpu relative z-10 group-hover/btn:scale-110 transition-transform" />}
                <span className="transform-gpu relative z-10 pt-0.5">{loading ? 'Processing Step...' : 'Initialize Import'}</span>
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}