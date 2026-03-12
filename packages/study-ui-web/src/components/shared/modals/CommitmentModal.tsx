"use client";

import React, { useState, useMemo } from 'react';
import { X, Target, Calendar, Loader2, Zap, Clock, Info, AlertCircle, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '@planner/study-core';
import { toast } from 'sonner';

export function CommitmentModal() {
  const { closeModal, activeTrack, commitTrack } = useStudy();
  const [loading, setLoading] = useState(false);
  
  // Modes: 'DATE' or 'TIME'
  const [mode, setMode] = useState<'DATE' | 'TIME'>(
    activeTrack?.track?.targetDate ? 'DATE' : 'TIME'
  );

  const [targetDate, setTargetDate] = useState(
    activeTrack?.track?.targetDate 
      ? new Date(activeTrack.track.targetDate).toISOString().split('T')[0] 
      : ''
  );
  
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(
    activeTrack?.track?.dailyAllocationMinutes || 60
  );

  if (!activeTrack) return null;

  // Step 1: Calculate Total Playlist Duration
  const totalMinutes = useMemo(() => {
    return activeTrack.track.units?.reduce((acc, unit) => acc + (unit.durationMinutes || 0), 0) || 0;
  }, [activeTrack]);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  // Step 2: Reactive Calculations
  const analysis = useMemo(() => {
    if (totalMinutes === 0) return null;

    if (mode === 'DATE') {
      if (!targetDate) return null;
      
      const target = new Date(targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return { error: "Target date must be in the future" };

      const watchTimePerDay = totalMinutes / diffDays;
      const studyTimePerDay = watchTimePerDay * 2;

      return {
        watchTimePerDay,
        studyTimePerDay,
        days: diffDays,
        formattedWatch: formatDuration(watchTimePerDay),
        formattedStudy: formatDuration(studyTimePerDay)
      };
    } else {
      // Mode: TIME
      if (dailyStudyMinutes <= 0) return { error: "Please enter study time" };

      const watchTimePerDay = dailyStudyMinutes / 2;
      const requiredDays = Math.ceil(totalMinutes / Math.max(1, watchTimePerDay));
      
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + requiredDays);

      return {
        watchTimePerDay,
        studyTimePerDay: dailyStudyMinutes,
        days: requiredDays,
        estDate: estDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        formattedWatch: formatDuration(watchTimePerDay),
        formattedStudy: formatDuration(dailyStudyMinutes)
      };
    }
  }, [mode, targetDate, dailyStudyMinutes, totalMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (analysis?.error) {
      toast.error(analysis.error);
      return;
    }

    setLoading(true);
    try {
      const finalMinutes = mode === 'TIME' ? dailyStudyMinutes : (analysis?.studyTimePerDay || 30);
      const finalDate = mode === 'DATE' ? targetDate : undefined;
      
      await commitTrack(activeTrack.track.id, Math.round(finalMinutes), finalDate);
      toast.success('Study plan updated');
      closeModal();
    } catch (err: any) {
      toast.error('Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transform-gpu fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="transform-gpu absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="transform-gpu relative w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden border border-white transform-gpu antialiased flex flex-col h-full max-h-[90vh]"
      >
        <div className="transform-gpu p-8 md:p-10 flex flex-col h-full max-h-[90vh]">
          <header className="transform-gpu flex justify-between items-start mb-8">
            <div>
              <h2 className="transform-gpu text-2xl font-bold text-slate-900 tracking-tight uppercase">Daily Goal</h2>
              <p className="transform-gpu text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Plan your course completion</p>
            </div>
            <button onClick={closeModal} className="transform-gpu p-2 text-slate-400 hover:text-rose-600 transition-all">
              <X size={24} />
            </button>
          </header>

          <div className="transform-gpu bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 flex justify-between items-center">
            <div className="transform-gpu flex items-center gap-3">
              <div className="transform-gpu p-2 bg-white rounded-xl shadow-sm text-rose-500">
                <Clock size={18} />
              </div>
              <div>
                <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Course Duration</p>
                <p className="transform-gpu text-lg font-bold text-slate-900">{formatDuration(totalMinutes)}</p>
              </div>
            </div>
            <div className="transform-gpu text-right">
              <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lessons</p>
              <p className="transform-gpu text-lg font-bold text-slate-900">{activeTrack.track.units?.length || 0}</p>
            </div>
          </div>

          <div className="transform-gpu flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setMode('DATE')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'DATE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Finish by Date
            </button>
            <button 
              onClick={() => setMode('TIME')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'TIME' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Study Time / Day
            </button>
          </div>

          <form onSubmit={handleSubmit} className="transform-gpu flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
             <AnimatePresence mode="wait">
               {mode === 'DATE' ? (
                 <motion.div 
                   key="date-mode"
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 10 }}
                   className="transform-gpu space-y-6"
                 >
                   <div className="transform-gpu space-y-4">
                     <label className="transform-gpu block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">When do you want to finish?</label>
                     <div className="transform-gpu relative">
                       <Calendar className="transform-gpu absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                       <input 
                         type="date" 
                         required
                         className="transform-gpu w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-16 py-5 font-bold text-slate-800 focus:border-rose-500 focus:outline-none transition-all"
                         value={targetDate}
                         onChange={e => setTargetDate(e.target.value)}
                       />
                     </div>
                   </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="time-mode"
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="transform-gpu space-y-6"
                 >
                   <div className="transform-gpu space-y-6">
                     <div className="transform-gpu flex items-center justify-between">
                        <label className="transform-gpu text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Study time per day</label>
                        <span className="transform-gpu text-2xl font-bold text-rose-600">{formatDuration(dailyStudyMinutes)}</span>
                     </div>
                     <input 
                       type="range" 
                       min="10" 
                       max="480" 
                       step="10"
                       className="transform-gpu w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-rose-600"
                       value={dailyStudyMinutes}
                       onChange={e => setDailyStudyMinutes(parseInt(e.target.value))}
                     />
                     <div className="transform-gpu flex justify-between text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                        <span>Quick Session</span>
                        <span>Deep Focus</span>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {analysis && !analysis.error && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="transform-gpu bg-rose-50/50 p-8 rounded-[2rem] border border-rose-100 space-y-6"
               >
                 <div className="transform-gpu grid grid-cols-2 gap-8">
                   <div>
                     <p className="transform-gpu text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                       <Youtube size={12} /> Watch Time
                     </p>
                     <p className="transform-gpu text-2xl font-bold text-slate-900">{analysis.formattedWatch}<span className="transform-gpu text-xs text-slate-400 ml-1">/ day</span></p>
                   </div>
                   <div>
                     {mode === 'DATE' ? (
                       <>
                         <p className="transform-gpu text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                           <Clock size={12} /> Study Effort
                         </p>
                         <p className="transform-gpu text-2xl font-bold text-slate-900">{analysis.formattedStudy}<span className="transform-gpu text-xs text-slate-400 ml-1">/ day</span></p>
                       </>
                     ) : (
                       <>
                         <p className="transform-gpu text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                           <Target size={12} /> Finish Date
                         </p>
                         <p className="transform-gpu text-2xl font-bold text-slate-900">{analysis.estDate}</p>
                       </>
                     )}
                   </div>
                 </div>

                 <div className="transform-gpu pt-6 border-t border-rose-100 flex gap-3 items-start">
                    <Info size={16} className="transform-gpu text-rose-500 shrink-0 mt-0.5" />
                    <p className="transform-gpu text-[11px] font-medium text-rose-700 leading-relaxed">
                      {mode === 'DATE' 
                        ? `To finish in ${analysis.days} days, you should watch ${analysis.formattedWatch} of video daily. We assume 2x total study time (${analysis.formattedStudy}) for notes and practice.`
                        : `At ${analysis.formattedStudy} study time per day, you'll watch ${analysis.formattedWatch} of video and finish the entire course in approximately ${analysis.days} days.`
                      }
                    </p>
                 </div>
               </motion.div>
             )}

             {analysis?.error && (
               <div className="transform-gpu bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-3 items-center text-amber-700">
                 <AlertCircle size={20} />
                 <p className="transform-gpu text-xs font-bold">{analysis.error}</p>
               </div>
             )}

             <button 
               disabled={loading || !!analysis?.error || (mode === 'DATE' && !targetDate)}
               type="submit" 
               className="transform-gpu w-full bg-slate-900 text-white py-6 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:bg-slate-200 disabled:shadow-none"
             >
               {loading ? <Loader2 className="transform-gpu animate-spin" size={20} /> : <Target size={20} />}
               {loading ? 'Saving Plan...' : 'Update Study Plan'}
             </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
