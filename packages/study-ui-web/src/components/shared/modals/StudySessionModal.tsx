"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, RotateCcw, 
  CheckCircle2, Clock, Brain, Loader2,
  Trash2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '@gritorquit/study-core';
import { toast } from 'sonner';
import Modal from './Modal';

export function StudySessionModal() {
  const { 
    closeModal, activeUnit, sessionMode, 
    seconds, setSeconds, isTimerRunning, setIsTimerRunning,
    completeUnit, logProgress
  } = useStudy();

  const [loading, setLoading] = useState(false);
  const [takeaway, setTakeaway] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [syncData, setSyncData] = useState({ watchPercentage: 100 });
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Format time (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeUnit) return null;

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (sessionMode === 'COMPLETE') {
        await completeUnit(activeUnit.id, {
          confidence,
          takeaway,
          secondsSpent: seconds
        });
        toast.success('Lesson mastery recorded');
      } else {
        await logProgress(activeUnit.id, {
          secondsSpent: seconds,
          watchPercentage: syncData.watchPercentage
        });
        toast.success('Session progress synced');
      }
      closeModal();
    } catch (err: any) {
      toast.error('Failed to sync progress');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setSeconds(0);
    setIsTimerRunning(false);
    closeModal();
  };

  const totalMinutes = Math.max(1, Math.round(seconds / 60));

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title={sessionMode === 'STUDY' ? 'Study Session' : 'Sync Progress'}
      panelClassName="!max-w-2xl"
    >
      <div className="transform-gpu space-y-8">
        
        {sessionMode === 'STUDY' ? (
          <div className="flex flex-col items-center gap-10 py-6">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase italic tracking-tight leading-none">{activeUnit.title}</h3>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic">Active Focus Block</p>
            </div>

            <div className="transform-gpu relative group">
                <div className="absolute inset-0 bg-[var(--accent-color)]/10 rounded-full blur-3xl animate-pulse group-hover:bg-[var(--accent-color)]/20 transition-all" />
                <div className="w-64 h-64 rounded-full border-[12px] border-[var(--bg-secondary)] bg-[var(--bg-card)] flex flex-col items-center justify-center relative shadow-2xl z-10">
                    <span className={`text-6xl font-black font-mono tracking-tighter tabular-nums transition-colors duration-500 ${isTimerRunning ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {formatTime(seconds)}
                    </span>
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.3em] italic">
                        <div className={`w-2 h-2 rounded-full bg-[var(--accent-color)] ${isTimerRunning ? 'animate-pulse shadow-[0_0_8px_var(--accent-color)]' : 'opacity-40'}`} />
                        {isTimerRunning ? 'Focus Active' : 'On Standby'}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8 relative z-10">
                <button 
                    onClick={() => setSeconds(0)}
                    className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500 rounded-2xl transition-all active:scale-90"
                    title="Reset Timer"
                >
                    <RotateCcw size={24} />
                </button>
                
                <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all active:scale-95 shadow-2xl ${
                        isTimerRunning 
                        ? 'bg-amber-500 text-white shadow-amber-500/20' 
                        : 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-[var(--accent-color)]/30'
                    }`}
                >
                    {isTimerRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                </button>

                <button 
                    onClick={() => setShowDiscardConfirm(true)}
                    className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500 rounded-2xl transition-all active:scale-90"
                    title="Discard Session"
                >
                    <Trash2 size={24} />
                </button>
            </div>

            {showDiscardConfirm && (
                <div className="absolute inset-x-0 bottom-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] p-6 z-50 animate-in slide-in-from-bottom-full duration-300">
                    <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight text-center mb-4 italic">Discard current focus time?</p>
                    <div className="flex gap-4">
                        <button onClick={handleDiscard} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest italic">Yes, Discard</button>
                        <button onClick={() => setShowDiscardConfirm(false)} className="flex-1 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-black text-[10px] uppercase tracking-widest italic">Resume</button>
                    </div>
                </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 py-4">
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-[2.5rem] shadow-inner text-center">
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 mb-2 italic">Total Intensity</p>
                    <p className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter tabular-nums">{totalMinutes}<span className="text-sm ml-1">M</span></p>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-[2.5rem] shadow-inner text-center">
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 mb-2 italic">Watch Scope</p>
                    <p className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter tabular-nums">{syncData.watchPercentage}<span className="text-sm ml-1">%</span></p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] ml-2 mb-4 italic opacity-40">Confidence Level</label>
                    <div className="flex justify-between items-center px-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-[2rem] shadow-inner">
                        {[1,2,3,4,5].map(lvl => (
                            <button 
                                key={lvl} 
                                onClick={() => setConfidence(lvl)}
                                className={`w-12 h-12 rounded-xl font-black text-lg transition-all active:scale-90 ${confidence === lvl ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] ml-2 mb-4 italic opacity-40">Session Insight</label>
                    <div className="relative group">
                        <div className="absolute left-6 top-6">
                            <Brain size={18} className="text-[var(--accent-color)] opacity-40" />
                        </div>
                        <textarea 
                            value={takeaway}
                            onChange={e => setTakeaway(e.target.value)}
                            placeholder="What did we learn in this node?"
                            className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] pl-16 pr-8 py-6 font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 italic resize-none"
                        />
                    </div>
                </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-[var(--border-color)]">
             <button 
               disabled={loading || (sessionMode === 'STUDY' && !isTimerRunning && seconds === 0)}
               onClick={sessionMode === 'STUDY' ? () => setIsTimerRunning(false) : handleFinish}
               className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 italic ${
                 sessionMode === 'STUDY' 
                 ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50' 
                 : 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-[var(--accent-color)]/20 hover:opacity-90'
               }`}
             >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {loading ? 'Processing Sync...' : sessionMode === 'STUDY' ? 'Stop & Sync session' : 'Finalize lesson Mastery'}
             </button>
        </div>
      </div>
    </Modal>
  );
}
