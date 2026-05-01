"use client";

import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, Target, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudy, Track } from '@gritorquit/study-core';
import { toast } from 'sonner';
import Modal from './Modal';

export function CommitmentModal() {
  const { closeModal, activeTrack, commitTrack, fetchDashboard } = useStudy();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'DATE' | 'TIME'>('DATE');
  const [targetDate, setTargetDate] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState(60);

  if (!activeTrack) return null;

  const handleCommit = async () => {
    setLoading(true);
    try {
      await commitTrack(
        activeTrack.track.id, 
        mode === 'TIME' ? dailyMinutes : 0,
        mode === 'DATE' ? targetDate : undefined
      );
      toast.success('Commitment locked. Strategy updated.');
      fetchDashboard();
      closeModal();
    } catch (err: any) {
      toast.error('Failed to update strategy');
    } finally {
      setLoading(false);
    }
  };

  const analysis = useMemo(() => {
    const totalMins = activeTrack.track.totalDurationMinutes;
    if (mode === 'DATE' && targetDate) {
        const days = Math.max(1, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
        const minsPerDay = Math.ceil(totalMins / days);
        return { 
            formattedWatch: `${Math.floor(minsPerDay / 60)}h ${minsPerDay % 60}m`,
            formattedStudy: `${Math.floor((minsPerDay * 1.5) / 60)}h ${Math.round(minsPerDay * 1.5) % 60}m`,
            estDate: new Date(targetDate).toLocaleDateString()
        };
    }
    const days = Math.ceil(totalMins / dailyMinutes);
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + days);
    return {
        formattedWatch: `${Math.floor(dailyMinutes / 60)}h ${dailyMinutes % 60}m`,
        formattedStudy: `${Math.floor((dailyMinutes * 1.5) / 60)}h ${Math.round(dailyMinutes * 1.5) % 60}m`,
        estDate: estDate.toLocaleDateString()
    };
  }, [activeTrack, mode, targetDate, dailyMinutes]);

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Strategic Commitment"
      panelClassName="!max-w-xl"
    >
      <div className="transform-gpu space-y-8">
        <div className="transform-gpu p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] shadow-inner">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg">
                <Sparkles size={16} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] italic">Active Path Analysis</h4>
           </div>
           <p className="text-sm font-bold text-[var(--text-secondary)] italic leading-relaxed">
             Based on the total duration of <span className="text-[var(--text-primary)] font-black uppercase">"{activeTrack.track.title}"</span>, we've calculated your optimal progression strategy.
           </p>
        </div>

        <div className="transform-gpu flex bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border-color)]">
            <button 
              onClick={() => setMode('DATE')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${mode === 'DATE' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
                Target Finish Date
            </button>
            <button 
              onClick={() => setMode('TIME')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${mode === 'TIME' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
                Fixed Daily Study Time
            </button>
        </div>

        <div className="transform-gpu px-2">
            {mode === 'DATE' ? (
                <div className="space-y-4">
                     <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1 italic opacity-40">When do you want to finish?</label>
                     <div className="relative">
                       <Calendar className="transform-gpu absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent-color)]" size={18} />
                       <input 
                         type="date" 
                         value={targetDate}
                         onChange={e => setTargetDate(e.target.value)}
                         className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl pl-14 pr-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all shadow-inner italic"
                       />
                     </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <label className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40">Study time per day</label>
                        <span className="text-[var(--accent-color)] font-black text-sm italic">{Math.floor(dailyMinutes / 60)}h {dailyMinutes % 60}m</span>
                    </div>
                    <input 
                       type="range" 
                       min="15" max="300" step="15"
                       value={dailyMinutes}
                       onChange={e => setDailyMinutes(parseInt(e.target.value))}
                       className="transform-gpu w-full h-1.5 bg-[var(--bg-secondary)] rounded-full appearance-none cursor-pointer accent-[var(--accent-color)]"
                    />
                </div>
            )}
        </div>

        <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm">
                 <h5 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 opacity-40 italic">Progression Requirement</h5>
                 <p className="transform-gpu text-2xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{analysis.formattedWatch}<span className="text-[10px] text-[var(--text-secondary)] ml-2 opacity-60">/ DAY</span></p>
             </div>
             <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm">
                 <h5 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 opacity-40 italic">Estimated Completion</h5>
                 <p className="transform-gpu text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tight leading-none">{analysis.estDate}</p>
             </div>
        </div>

        <div className="transform-gpu pt-6 border-t border-[var(--border-color)]">
             <button 
               disabled={loading}
               onClick={handleCommit}
               className="transform-gpu w-full bg-[var(--accent-color)] text-[var(--bg-primary)] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all flex items-center justify-center gap-3 active:scale-95 italic"
             >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
                {loading ? 'Processing Strategy...' : 'Commit to Path'}
             </button>
        </div>
      </div>
    </Modal>
  );
}
