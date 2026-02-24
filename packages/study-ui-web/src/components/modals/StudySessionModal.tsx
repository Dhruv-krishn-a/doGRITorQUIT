"use client";

import { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, History, Timer, Plus, ChevronRight, Zap, Smile, Frown, Star, MessageSquare, Clock, Youtube, Activity, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '@planner/study-core';
import { toast } from 'sonner';

export function StudySessionModal() {
  const { closeModal, activeUnit, completeUnit, sessionMode, sessionData, logProgress } = useStudy();
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [showForm, setShowForm] = useState(sessionMode === 'COMPLETE' || sessionMode === 'LOGS');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [extraMinutes, setExtraMinutes] = useState(0);
  
  const [syncData, setSyncData] = useState({
    confidence: 3,
    difficulty: 3,
    takeaways: [''],
    watchPercentage: sessionData?.watchPercentage || Math.round(activeUnit?.watchPercentage || 0),
    minutesSpent: sessionData?.minutesSpent || 0
  });

  const previousStudyMins = activeUnit?.actualTimeSpentMinutes || 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionMode === 'TIMER' && !isPaused && !showForm) {
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(interval!);
  }, [sessionMode, isPaused, showForm]);

  useEffect(() => {
    if ((sessionMode === 'COMPLETE' || sessionMode === 'LOGS') && sessionData) {
      setSyncData(d => ({ 
        ...d, 
        minutesSpent: sessionData.minutesSpent || d.minutesSpent,
        watchPercentage: sessionData.watchPercentage !== undefined ? sessionData.watchPercentage : d.watchPercentage
      }));
      return;
    }

    const calculatedMins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const mins = sessionMode === 'TIMER' 
      ? Math.max(1, Math.round(elapsed / 60))
      : calculatedMins;
    
    setSyncData(d => ({ ...d, minutesSpent: mins }));
  }, [startTime, elapsed, sessionMode, sessionData]);

  if (!activeUnit) return null;

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only enforce 99% if they are marking as DONE, not just logging progress
    if (sessionMode === 'COMPLETE' && syncData.watchPercentage < 99) {
      toast.error("Please complete at least 99% of the video to mark as done.");
      return;
    }

    setLoading(true);
    
    try {
      const timerMins = Math.round(elapsed / 60);
      const finalMins = (sessionMode === 'TIMER' ? timerMins : syncData.minutesSpent) + (extraMinutes || 0);
      
      await completeUnit(activeUnit.id, {
        ...syncData,
        minutesSpent: finalMins,
        watchPercentage: syncData.watchPercentage,
        takeaways: syncData.takeaways.filter(t => t.trim() !== '')
      });
      toast.success('Progress saved');
      closeModal();
    } catch (err: unknown) {
      toast.error('Failed to save progress');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    toast.info("Session discarded");
    closeModal();
  };

  const totalMinutes = previousStudyMins + (sessionMode === 'TIMER' ? Math.round(elapsed / 60) : syncData.minutesSpent) + (extraMinutes || 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-10">
           {!showForm && sessionMode === 'TIMER' ? (
             <div className="flex flex-col items-center text-center space-y-10">
                <header className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Study Timer</h2>
                  <p className="text-slate-500 font-medium text-sm line-clamp-1 px-4">{activeUnit.title}</p>
                </header>

                <div className="relative">
                  <div className="w-56 h-56 rounded-full border-[12px] border-slate-50 flex items-center justify-center relative shadow-inner">
                    <span className="text-5xl font-black text-slate-900 font-mono tracking-tighter">
                      {formatTime(elapsed)}
                    </span>
                    <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90 text-rose-500">
                      <circle 
                        cx="50%" cy="50%" r="48%" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray="301.59"
                        strokeDashoffset={301.59 * (1 - Math.min(elapsed, 3600) / 3600)}
                        className="transition-all duration-1000"
                      />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    title={isPaused ? "Resume the timer" : "Pause the timer"}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      isPaused ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPaused ? <Play size={18} /> : <Pause size={18} />}
                    {isPaused ? 'Resume' : 'Studying'}
                  </button>
                  <button 
                    onClick={() => setShowForm(true)}
                    title="Finish the lesson and save progress"
                    className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Finish
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {showDiscardConfirm ? (
                    <div className="flex items-center gap-4 bg-rose-50 p-2 rounded-2xl animate-in fade-in zoom-in duration-200">
                      <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-2">Discard session?</span>
                      <button onClick={handleDiscard} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white">Yes</button>
                      <button onClick={() => setShowDiscardConfirm(false)} className="bg-white text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-rose-100">No</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowDiscardConfirm(true)} 
                      title="Exit without saving this session"
                      className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-500 transition-colors"
                    >
                      Discard Session
                    </button>
                  )}
                </div>
             </div>
           ) : (
             <form onSubmit={handleSync} className="space-y-8">
               <header className="flex justify-between items-start">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Finish Lesson</h2>
                   <p className="text-slate-500 font-medium text-xs mt-1 line-clamp-1">{activeUnit.title}</p>
                 </div>
                 <button type="button" onClick={closeModal} title="Close window" className="p-2 text-slate-400 hover:text-rose-600 transition-all">
                   <X size={24} />
                 </button>
               </header>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Timer size={12} className="text-rose-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Study Effort</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{totalMinutes}m</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50 relative overflow-hidden group">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Youtube size={12} className="text-rose-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Watch Progress</span>
                    </div>
                    <p className="text-2xl font-black text-rose-600">{syncData.watchPercentage}%</p>
                    <div className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-1000" style={{ width: `${syncData.watchPercentage}%` }} />
                 </div>
               </div>

               <div className="space-y-6">
                  {/* Watch Progress Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Activity size={14} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Manual Progress Override</span>
                      </div>
                      <span className="text-[10px] font-black text-rose-600">{syncData.watchPercentage}% watched</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-rose-600"
                      value={syncData.watchPercentage}
                      onChange={e => setSyncData(d => ({ ...d, watchPercentage: parseInt(e.target.value) }))}
                    />
                    <p className="text-[9px] text-slate-400 font-medium italic">Adjust if the automatic tracking was inaccurate.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Confidence</label>
                      <div className="flex gap-2">
                        {[
                          { val: 1, icon: <Frown size={16} />, label: "Not clear" },
                          { val: 2, icon: <Frown size={16} className="opacity-50" />, label: "A bit confused" },
                          { val: 3, icon: <Smile size={16} className="opacity-50" />, label: "Getting there" },
                          { val: 4, icon: <Smile size={16} />, label: "Understand well" },
                          { val: 5, icon: <Zap size={16} />, label: "Fully Mastered" }
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            title={item.label}
                            onClick={() => setSyncData(d => ({ ...d, confidence: item.val }))}
                            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex flex-col items-center gap-1.5 border-2 ${
                              syncData.confidence === item.val 
                                ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-500'
                            }`}
                          >
                            {item.icon}
                            <span className="text-[10px]">{item.val}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Plus size={14} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Adjust Study Time</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          placeholder="Add mins..."
                          title="Add extra study time manually"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-black text-rose-600 focus:outline-none focus:border-rose-300 transition-all placeholder:text-slate-300"
                          value={extraMinutes || ''}
                          onChange={e => setExtraMinutes(parseInt(e.target.value) || 0)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Min</span>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MessageSquare size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Key Takeaways</span>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                      {syncData.takeaways.map((t, i) => (
                        <div key={i} className="relative flex items-center">
                          <div className="absolute left-4 w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <input 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 font-bold text-slate-800 text-sm focus:bg-white focus:border-rose-300 focus:outline-none transition-all"
                            placeholder="What did you learn?"
                            title="Enter a key point you learned"
                            value={t}
                            onChange={e => {
                              const next = [...syncData.takeaways];
                              next[i] = e.target.value;
                              if (i === next.length - 1 && e.target.value !== '') next.push('');
                              setSyncData(d => ({ ...d, takeaways: next }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               <button 
                 disabled={loading}
                 type="submit" 
                 title="Save all data and mark this lesson as completed"
                 className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
               >
                 {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                 {sessionMode === 'COMPLETE' ? 'Confirm Completion' : 'Save Progress'}
               </button>
             </form>
           )}
        </div>
      </motion.div>
    </div>
  );
}
