"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ListTodo, 
  ArrowRight, Youtube, Play, Zap, Activity
} from 'lucide-react';
import { useUnifiedToday } from '@gritorquit/dashboard-core';
import { cn } from '@/lib/utils';

// --- Utilities ---
const parse24hToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

const formatMinutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, '0');
  return { time: `${displayH}:${displayM}`, ampm };
};

export default function MiniAgenda({ className, onHubClick }: { className?: string; onHubClick?: () => void }) {
  const { data, loading, error } = useUnifiedToday();

  const schedule = useMemo(() => {
    if (!data) return [];
    
    const rawBlocks = data.fixedBlocks || [];
    const normalizedBlocks: any[] = [];
    rawBlocks.forEach((b: any) => {
      const s = parse24hToMinutes(b.start);
      const e = parse24hToMinutes(b.end);
      if (e < s) {
        normalizedBlocks.push({ ...b, s, e: 1440 });
        normalizedBlocks.push({ ...b, s: 0, e });
      } else {
        normalizedBlocks.push({ ...b, s, e });
      }
    });

    const mergedBlocks: any[] = [];
    const sorted = [...normalizedBlocks].sort((a, b) => a.s - b.s);
    if (sorted.length > 0) {
      let current = { s: sorted[0].s, e: sorted[0].e };
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].s <= current.e) {
          current.e = Math.max(current.e, sorted[i].e);
        } else {
          mergedBlocks.push(current);
          current = { s: sorted[i].s, e: sorted[i].e };
        }
      }
      mergedBlocks.push(current);
    }

    const freeWindows: any[] = [];
    let lastEnd = 0;
    mergedBlocks.forEach(b => {
      if (b.s > lastEnd) freeWindows.push({ s: lastEnd, e: b.s, d: b.s - lastEnd });
      lastEnd = b.e;
    });
    if (lastEnd < 1440) freeWindows.push({ s: lastEnd, e: 1440, d: 1440 - lastEnd });

    const tasks = [...(data.sections?.tasks || []), ...(data.sections?.study || [])]
      .filter(t => t.status !== 'completed' && t.status !== 'DONE');

    const allocated: any[] = [];
    let currentWindowIdx = 0;
    let currentWindow = freeWindows.length > 0 ? { ...freeWindows[0] } : null;

    tasks.forEach(task => {
      const duration = task.duration || task.estimatedMinutes || 30;
      let placed = false;
      while (currentWindow && !placed) {
        if (currentWindow.d >= duration) {
          allocated.push({ 
            ...task, 
            startTime: currentWindow.s, 
            endTime: currentWindow.s + duration,
            type: task.trackId ? 'STUDY' : 'TASK'
          });
          currentWindow.s += duration;
          currentWindow.d -= duration;
          placed = true;
        } else {
          currentWindowIdx++;
          currentWindow = currentWindowIdx < freeWindows.length ? { ...freeWindows[currentWindowIdx] } : null;
        }
      }
    });

    const timeline = [
      ...rawBlocks.map((b: any) => ({ ...b, startTime: parse24hToMinutes(b.start), isBlock: true })),
      ...allocated.map((t: any) => ({ ...t, isBlock: false }))
    ].sort((a, b) => a.startTime - b.startTime);

    return timeline;
  }, [data]);

  return (
    <div className={cn(
      "transform-gpu bg-[var(--bg-card)] rounded-[2.5rem] md:rounded-[3rem] border border-[var(--border-color)] shadow-2xl flex flex-col h-full overflow-hidden relative group/agenda",
      className
    )}>
       <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-[var(--accent-color)]/5 blur-[80px] md:blur-[100px] pointer-events-none rounded-full" />
       
       <div className="flex items-center justify-between p-6 md:p-8 lg:p-10 pb-4 relative z-10">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-color)] shadow-inner group-hover/agenda:border-[var(--accent-color)]/30 transition-colors">
                <Calendar size={20} className="text-[var(--accent-color)]" />
             </div>
             <div className="text-left">
                <h3 className="text-lg md:text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Agenda</h3>
                <p className="text-[8px] md:text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-50">Today's Schedule</p>
             </div>
          </div>
          <div className="px-3 md:px-4 py-1 md:py-1.5 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
             <span className="text-[8px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">Today</span>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar px-4 md:px-6 relative z-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-40">
                <Zap size={28} className="text-[var(--accent-color)] animate-pulse" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] italic">Building timeline...</p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-30 mx-2 md:mx-4">
                <Activity size={32} className="text-[var(--text-secondary)] mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">No active goals</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4 py-4">
               {schedule.map((item, idx) => {
                 const time = formatMinutesToTime(item.startTime);
                 const isBlock = item.isBlock;
                 const isVideo = item.type === 'VIDEO' || (item.metadata as any)?.youtubeId;

                 return (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={item.id || idx} 
                        className={cn(
                            "transform-gpu group flex gap-3 md:gap-5 items-center p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border transition-all shadow-sm",
                            isBlock 
                                ? "bg-[var(--bg-secondary)]/30 border-transparent opacity-60" 
                                : "bg-[var(--bg-secondary)]/60 border-[var(--border-color)] hover:border-[var(--accent-color)]/50 hover:shadow-lg"
                        )}
                    >
                        <div className="flex flex-col items-center min-w-[40px] md:min-w-[50px] border-r border-[var(--border-color)] pr-3 md:pr-4">
                            <span className="text-[10px] md:text-xs font-black text-[var(--text-primary)] italic leading-none">{time.time}</span>
                            <span className="text-[7px] md:text-[8px] font-black text-[var(--text-secondary)] uppercase mt-1 opacity-50">{time.ampm}</span>
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                           <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                              {isBlock ? <Clock size={10} className="text-[var(--text-secondary)]" /> : isVideo ? <Youtube size={10} className="text-rose-500" /> : <Zap size={10} className="text-[var(--accent-color)]" />}
                              <p className={cn(
                                  "text-[10px] md:text-[11px] font-black uppercase tracking-tight truncate transition-all duration-300",
                                  isBlock ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                              )}>
                                  {item.title}
                               </p>
                           </div>
                           <p className="text-[7px] md:text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40">
                               {isBlock ? "Scheduled Event" : `${item.duration || item.estimatedMinutes || 30}M Goal`}
                           </p>
                        </div>

                        {!isBlock && (
                            <div className="opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-color)]/20">
                                    <Play size={10} fill="currentColor" />
                                </div>
                            </div>
                        )}
                    </motion.div>
                 );
               })}
            </div>
          )}
       </div>

       <div className="p-6 md:p-8 lg:p-10 pt-4 relative z-10">
          <button 
            onClick={onHubClick}
            className="group flex items-center justify-center gap-3 md:gap-4 w-full py-4 md:py-6 rounded-xl md:rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[var(--accent-color)] hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95"
          >
             Planner Hub <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
       </div>
    </div>
  );
}
