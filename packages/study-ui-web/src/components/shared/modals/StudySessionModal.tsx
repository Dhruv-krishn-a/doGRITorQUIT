"use client";

import { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, History, Timer, Plus, ChevronRight, Zap, Smile, Frown, Star, MessageSquare, Clock, Youtube, Activity, Play, Pause, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '@gritorquit/study-core';
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
    // Fixed TS Error: Used ReturnType<typeof setTimeout> instead of NodeJS.Timeout
    let interval: ReturnType<typeof setInterval>;
    if (sessionMode === 'TIMER' && !isPaused && !showForm) {
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(interval);
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

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <div className="transform-gpu fixed inset-0 z-[1200] flex items-center justify-center p-4">
      {/* Premium Glass Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="transform-gpu absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={springConfig}
        className="transform-gpu relative w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white overflow-hidden transform-gpu antialiased"
      >
        {/* Subtle Background Glow inside Modal */}
        <div className="transform-gpu absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-rose-200/40 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="transform-gpu p-8 md:p-10 relative z-10">
           <AnimatePresence mode="wait">
             {!showForm && sessionMode === 'TIMER' ? (
               <motion.div 
                 key="timer"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3 }}
                 className="transform-gpu flex flex-col items-center text-center space-y-10"
               >
                  <header className="transform-gpu space-y-3 w-full relative">
                    <button type="button" onClick={closeModal} className="transform-gpu absolute right-0 top-0 p-2 bg-white rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-sm border border-slate-100 transition-all">
                      <X size={18} />
                    </button>
                    <div className="transform-gpu inline-flex p-3 bg-rose-50 text-rose-500 rounded-[1.5rem] shadow-sm mb-2 border border-rose-100">
                      <Timer size={24} />
                    </div>
                    <h2 className="transform-gpu text-3xl font-bold text-slate-900 tracking-tighter uppercase">Study Session</h2>
                    <p className="transform-gpu text-slate-500 font-bold text-sm line-clamp-1 px-8">{activeUnit.title}</p>
                  </header>

                  {/* Glassmorphic Timer Ring */}
                  <div className="transform-gpu relative group cursor-pointer" onClick={() => setIsPaused(!isPaused)}>
                    <div className="transform-gpu absolute inset-0 bg-rose-200/30 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="transform-gpu w-56 h-56 rounded-full border-[10px] border-white bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center relative shadow-[0_8px_30px_rgba(0,0,0,0.06)] group-hover:shadow-rose-100 transition-all duration-500">
                      <span className={`text-5xl font-bold font-mono tracking-tighter transition-colors duration-300 ${isPaused ? 'text-slate-400' : 'text-slate-800'}`}>
                        {formatTime(elapsed)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 transition-colors duration-300 ${isPaused ? 'text-amber-500 animate-pulse' : 'text-rose-500'}`}>
                        {isPaused ? 'Paused' : 'Focus Mode'}
                      </span>
                      
                      <svg className="transform-gpu absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] -rotate-90 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] pointer-events-none">
                        <circle 
                          cx="50%" cy="50%" r="48%" 
                          stroke="currentColor" 
                          strokeWidth="8" 
                          strokeLinecap="round"
                          fill="transparent" 
                          strokeDasharray="301.59"
                          strokeDashoffset={isPaused ? 0 : 301.59 * (1 - Math.min(elapsed, 3600) / 3600)}
                          className="transform-gpu transition-all duration-1000 ease-linear"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="transform-gpu grid grid-cols-2 gap-4 w-full">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsPaused(!isPaused)}
                      title={isPaused ? "Resume the timer" : "Pause the timer"}
                      className={`py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                        isPaused 
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-200' 
                          : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowForm(true)}
                      title="Finish the lesson and save progress"
                      className="transform-gpu py-5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Log Session
                    </motion.button>
                  </div>
                  
                  <div className="transform-gpu flex flex-col gap-2 h-12 justify-center">
                    <AnimatePresence mode="wait">
                      {showDiscardConfirm ? (
                        <motion.div 
                          key="confirm"
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                          className="transform-gpu flex items-center gap-4 bg-white border border-rose-100 shadow-sm p-2.5 rounded-2xl"
                        >
                          <span className="transform-gpu text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-3 flex items-center gap-1.5"><AlertCircle size={14}/> Discard?</span>
                          <button onClick={handleDiscard} className="transform-gpu bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-colors">Yes</button>
                          <button onClick={() => setShowDiscardConfirm(false)} className="transform-gpu bg-slate-50 hover:bg-slate-100 text-slate-500 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-colors">No</button>
                        </motion.div>
                      ) : (
                        <motion.button 
                          key="discardBtn"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setShowDiscardConfirm(true)} 
                          title="Exit without saving this session"
                          className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors py-2"
                        >
                          Discard Session
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
               </motion.div>
             ) : (
               <motion.form 
                 key="form"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 transition={{ duration: 0.3 }}
                 onSubmit={handleSync} 
                 className="transform-gpu space-y-8"
               >
                 <header className="transform-gpu flex justify-between items-start">
                   <div>
                     <h2 className="transform-gpu text-3xl font-bold text-slate-900 tracking-tighter uppercase">{sessionMode === 'COMPLETE' ? 'Lesson Complete' : 'Log Progress'}</h2>
                     <p className="transform-gpu text-slate-500 font-bold text-xs mt-1.5 line-clamp-1">{activeUnit.title}</p>
                   </div>
                   <button type="button" onClick={closeModal} title="Close window" className="transform-gpu p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-sm rounded-2xl transition-all">
                     <X size={20} />
                   </button>
                 </header>

                 <div className="transform-gpu grid grid-cols-2 gap-5">
                   <div className="transform-gpu bg-white/80 p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-fuchsia-200 transition-colors">
                      <div className="transform-gpu flex items-center gap-2 text-slate-400 mb-2">
                        <Timer size={14} className="transform-gpu text-fuchsia-500 group-hover:animate-spin-slow" />
                        <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">Study Effort</span>
                      </div>
                      <p className="transform-gpu text-3xl font-bold text-slate-900 tracking-tighter">{totalMinutes}<span className="transform-gpu text-sm text-slate-400 uppercase tracking-widest ml-1">m</span></p>
                   </div>
                   <div className="transform-gpu bg-white/80 p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-colors">
                      <div className="transform-gpu flex items-center gap-2 text-slate-400 mb-2 relative z-10">
                        <Youtube size={14} className="transform-gpu text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">Watch Progress</span>
                      </div>
                      <p className="transform-gpu text-3xl font-bold text-slate-900 tracking-tighter relative z-10">{syncData.watchPercentage}<span className="transform-gpu text-sm text-slate-400 uppercase tracking-widest ml-1">%</span></p>
                      
                      <div className="transform-gpu absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
                        <div className="transform-gpu absolute bottom-0 left-0 h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${syncData.watchPercentage}%` }} />
                      </div>
                   </div>
                 </div>

                 <div className="transform-gpu space-y-8">
                    {/* Watch Progress Slider */}
                    <div className="transform-gpu space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      <div className="transform-gpu flex items-center justify-between mb-2">
                        <div className="transform-gpu flex items-center gap-2 text-slate-500">
                          <Activity size={14} className="transform-gpu text-rose-500" />
                          <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">Manual Override</span>
                        </div>
                        <span className="transform-gpu text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">{syncData.watchPercentage}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        className="transform-gpu w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-rose-500 shadow-inner hover:accent-rose-400 transition-all"
                        value={syncData.watchPercentage}
                        onChange={e => setSyncData(d => ({ ...d, watchPercentage: parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 gap-8">
                      <section>
                        <label className="transform-gpu block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-2 mb-4">Confidence Level</label>
                        <div className="transform-gpu flex gap-2">
                          {[
                            { val: 1, icon: <Frown size={18} className="transform-gpu opacity-50" />, color: 'bg-rose-50 border-rose-200 text-rose-600' },
                            { val: 2, icon: <Frown size={18} />, color: 'bg-amber-50 border-amber-200 text-amber-600' },
                            { val: 3, icon: <Smile size={18} className="transform-gpu opacity-50" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
                            { val: 4, icon: <Smile size={18} />, color: 'bg-teal-50 border-teal-200 text-teal-600' },
                            { val: 5, icon: <Zap size={18} />, color: 'bg-indigo-50 border-indigo-200 text-indigo-600' }
                          ].map((item) => {
                            const isActive = syncData.confidence === item.val;
                            return (
                              <motion.button
                                key={item.val}
                                whileHover={{ y: -2, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => setSyncData(d => ({ ...d, confidence: item.val }))}
                                className={`flex-1 py-4 rounded-[1.25rem] font-bold transition-all flex flex-col items-center gap-1.5 border-2 ${
                                  isActive 
                                    ? `${item.color} shadow-sm scale-105` 
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 shadow-sm'
                                }`}
                              >
                                {item.icon}
                                <span className="transform-gpu text-[10px]">{item.val}</span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </section>

                      <section className="transform-gpu space-y-4">
                        <label className="transform-gpu flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-2">
                          Add Extra Time
                        </label>
                        <div className="transform-gpu relative group/input">
                          <Plus size={16} className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 group-hover/input:text-rose-500 transition-colors" />
                          <input 
                            type="number"
                            placeholder="Minutes..."
                            className="transform-gpu w-full bg-white border-2 border-slate-100 rounded-[1.5rem] pl-12 pr-12 py-5 font-bold text-rose-600 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 transition-all shadow-sm text-sm"
                            value={extraMinutes || ''}
                            onChange={e => setExtraMinutes(parseInt(e.target.value) || 0)}
                          />
                          <span className="transform-gpu absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">Min</span>
                        </div>
                      </section>
                    </div>

                    <div className="transform-gpu space-y-4">
                      <div className="transform-gpu flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-2">
                        <MessageSquare size={14} className="transform-gpu text-indigo-400" />
                        <span>Key Takeaways</span>
                      </div>
                      <div className="transform-gpu space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                        {syncData.takeaways.map((t, i) => (
                          <div key={i} className="transform-gpu relative flex items-center group/takeaway">
                            <div className="transform-gpu absolute left-5 w-2 h-2 rounded-full border-2 border-rose-400 bg-white group-hover/takeaway:bg-rose-400 transition-colors" />
                            <input 
                              className="transform-gpu w-full bg-white border border-slate-200 rounded-[1.5rem] pl-12 pr-6 py-4 font-bold text-slate-700 text-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 focus:outline-none transition-all shadow-sm placeholder:text-slate-300"
                              placeholder="Capture an insight..."
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

                 <motion.button 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   disabled={loading}
                   type="submit" 
                   className="transform-gpu w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-5 rounded-[1.5rem] font-bold text-[11px] uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale relative overflow-hidden group/submit"
                 >
                   <div className="transform-gpu absolute inset-0 -translate-x-full group-hover/submit:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                   {loading ? <Loader2 className="transform-gpu animate-spin relative z-10" size={20} /> : <CheckCircle size={20} className="transform-gpu relative z-10 group-hover/submit:scale-110 transition-transform" />}
                   <span className="transform-gpu relative z-10">{sessionMode === 'COMPLETE' ? 'Confirm Completion' : 'Save Progress'}</span>
                 </motion.button>
               </motion.form>
             )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}