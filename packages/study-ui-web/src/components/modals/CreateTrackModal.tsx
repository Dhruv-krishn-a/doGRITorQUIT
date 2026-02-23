"use client";

import React, { useState } from 'react';
import { X, Youtube, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy, studyApi } from '@planner/study-core';
import { toast } from 'sonner';

export function CreateTrackModal() {
  const { closeModal, fetchDashboard } = useStudy();
  const [mode, setMode] = useState<'CHOICE' | 'IMPORT' | 'MANUAL'>('CHOICE');
  const [loading, setLoading] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'COURSE'
  });

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl) return;
    setLoading(true);
    try {
      await studyApi.importPlaylist(playlistUrl, targetDate || undefined);
      toast.success('Course imported successfully');
      fetchDashboard();
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studyApi.createTrack({ ...formData, targetDate: targetDate || undefined } as any);
      toast.success('New course created');
      fetchDashboard();
      closeModal();
    } catch (err: any) {
      toast.error('Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
      >
        <div className="p-8 md:p-12">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">New Course</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Start a new learning path</p>
            </div>
            <button onClick={closeModal} className="p-4 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-2xl transition-all">
              <X size={20} />
            </button>
          </header>

          <AnimatePresence mode="wait">
            {mode === 'CHOICE' && (
              <motion.div 
                key="choice"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <button 
                  onClick={() => setMode('IMPORT')}
                  className="flex flex-col items-center justify-center gap-6 p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-100 transition-all group"
                >
                  <div className="p-6 bg-rose-50 text-rose-600 rounded-3xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <Youtube size={40} />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-slate-900">Import YouTube</span>
                </button>

                <button 
                  onClick={() => setMode('MANUAL')}
                  className="flex flex-col items-center justify-center gap-6 p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all group"
                >
                  <div className="p-6 bg-indigo-50 text-indigo-600 rounded-3xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Plus size={40} />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-slate-900">Create Manual</span>
                </button>
              </motion.div>
            )}

            {mode === 'IMPORT' && (
              <motion.form 
                key="import"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleImport}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">YouTube Playlist URL</label>
                  <input 
                    autoFocus
                    type="url" 
                    required
                    placeholder="https://youtube.com/playlist?list=..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:border-rose-500 focus:outline-none transition-all"
                    value={playlistUrl}
                    onChange={e => setPlaylistUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Target Completion Date (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:border-rose-500 focus:outline-none transition-all"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setMode('CHOICE')} className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Back</button>
                  <button 
                    disabled={loading}
                    type="submit" 
                    className="flex-[2] bg-rose-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Youtube size={18} />}
                    {loading ? 'Processing...' : 'Import Course'}
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'MANUAL' && (
              <motion.form 
                key="manual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleManualCreate}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Course Title</label>
                  <input 
                    autoFocus
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-slate-800 focus:border-indigo-500 focus:outline-none transition-all"
                    value={formData.title}
                    onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Target Completion Date (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-slate-800 focus:border-indigo-500 focus:outline-none transition-all"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Description</label>
                  <textarea 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-slate-800 focus:border-indigo-500 focus:outline-none transition-all h-20 resize-none"
                    value={formData.description}
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setMode('CHOICE')} className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Back</button>
                  <button 
                    disabled={loading}
                    type="submit" 
                    className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Create Course
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
