import React, { useState, useEffect } from 'react';
import { useToday } from '../hooks/useToday';
import { GritRadar } from '../components/GritRadar';
import { ActionCard } from '../components/ActionCard';
import { MissionView } from '../components/MissionView';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Battery, BatteryMedium, BatteryFull, Loader2, Sparkles, Plus, Rocket, ShieldAlert, Bell, Clock3, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TodayView: React.FC = () => {
  const { 
    actionStream, currentItem, missionActive, isTransitioning,
    startMission, abortMission, completeAndNext,
    stats, loading, focusMode, toggleFocusMode, 
    energy, setEnergy, toggleHabit, refreshAll,
    plannerTasks, createScheduledTask, creatingTask
  } = useToday();

  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [taskTime, setTaskTime] = useState('09:00');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskMinutes, setTaskMinutes] = useState('45');

  useEffect(() => {
    const onBlur = () => setIsWindowBlurred(true);
    const onFocus = () => setIsWindowBlurred(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (loading && actionStream.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[var(--accent-color)] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Assembling Flight Deck...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-10 pb-20 pt-4 px-4 sm:px-6 relative text-[var(--text-primary)] selection:bg-sky-500/30">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 w-[40vw] h-[40vw] bg-[var(--accent-color)]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10" />

      {/* 0. Shadow Guardian Overlay */}
      <AnimatePresence>
        {missionActive && isWindowBlurred && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[4000] bg-[var(--bg-primary)]/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 rounded-full bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] mb-8 border border-[var(--accent-color)]/30 shadow-[0_0_50px_rgba(14,165,233,0.2)]"
            >
              <ShieldAlert size={48} />
            </motion.div>
            <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter mb-4 uppercase italic">Vector Deviation</h2>
            <p className="text-[var(--text-secondary)] text-lg font-medium max-w-md leading-relaxed uppercase tracking-widest text-sm">
              Shadow Guardian detected focus drift. Return to the Command Center to resume execution.
            </p>
            <div className="mt-12 text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.5em] animate-pulse">
              Monitoring Core Systems...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Mission Mode Overlay */}
      <AnimatePresence>
        {missionActive && (
          <MissionView 
            item={currentItem} 
            isTransitioning={isTransitioning}
            onAbort={abortMission}
            onComplete={completeAndNext}
          />
        )}
      </AnimatePresence>

      {/* 2. Strategic Hero */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-color)] border border-[var(--border-color)] shadow-xl">
              <Sparkles size={20} />
            </div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight italic uppercase">Command Center</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={startMission}
              disabled={missionActive || stats.momentum === 100}
              className="group flex items-center gap-3 px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              <Rocket size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Initialize Mission
            </button>

            <div className="flex items-center gap-2 bg-[var(--bg-secondary)]/50 p-1.5 rounded-2xl border border-[var(--border-color)] shadow-sm">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergy(level)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                    energy === level 
                      ? "bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
        <GritRadar stats={stats} focusMode={focusMode} onToggleFocus={toggleFocusMode} />
      </section>

      {/* 3. Action Stream */}
      <section className="space-y-6">
        <div className="flex items-center justify-between ml-1">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[var(--accent-color)] rounded-full shadow-lg shadow-sky-500/50" />
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest italic text-sm">Action Stream</h2>
          </div>
          <button className="flex items-center gap-2 text-[var(--accent-color)] hover:text-[var(--text-primary)] transition-colors">
            <Plus size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest underline">Inject Instruction</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode='popLayout'>
            {actionStream.map((item) => (
              <ActionCard 
                key={`${item.type}-${item.id}`} 
                item={item} 
                onComplete={() => {
                  if (item.type === 'HABIT') {
                    toggleHabit(item.id, new Date(), item.status === 'DONE');
                  }
                  setTimeout(refreshAll, 100);
                }}
              />
            ))}
          </AnimatePresence>

          {actionStream.length === 0 && (
            <div className="flex flex-col items-center justify-center p-20 bg-[var(--bg-secondary)]/10 rounded-[3rem] border-2 border-dashed border-[var(--border-color)]">
              <Coffee className="text-[var(--bg-secondary)] mb-4" size={48} />
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic">All vectors resolved.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Today GritOrQuit Card */}
        <div className="rounded-[3rem] border border-[var(--border-color)] bg-[var(--bg-card)]/20 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)]">Inject Instruction</h3>
            <Zap size={16} className="text-[var(--accent-color)]" />
          </div>
          <div className="space-y-4">
            <input 
              value={taskTitle} 
              onChange={(e) => setTaskTitle(e.target.value)} 
              placeholder="System vector label..." 
              className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)]/50 outline-none uppercase italic" 
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-secondary)] outline-none focus:border-[var(--accent-color)]/50" />
              <input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} className="px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-secondary)] outline-none focus:border-[var(--accent-color)]/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as any)} className="px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest outline-none focus:border-[var(--accent-color)]/50">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Critical</option>
              </select>
              <input type="number" min={5} max={480} value={taskMinutes} onChange={(e) => setTaskMinutes(e.target.value)} className="px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-secondary)] outline-none focus:border-[var(--accent-color)]/50" placeholder="MINS" />
            </div>
            <button
              onClick={async () => {
                if (!taskTitle.trim()) return;
                await createScheduledTask({
                  title: taskTitle.trim(),
                  date: taskDate,
                  time: taskTime,
                  priority: taskPriority,
                  estimatedMinutes: Number.parseInt(taskMinutes, 10) || 45,
                });
                setTaskTitle('');
              }}
              disabled={creatingTask}
              className="w-full px-6 py-5 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-sky-500/20 disabled:opacity-50 hover:bg-white transition-all active:scale-95 mt-4"
            >
              {creatingTask ? 'SYNCHRONIZING...' : 'INITIALIZE VECTOR'}
            </button>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="rounded-[3rem] border border-[var(--border-color)] bg-[var(--bg-card)]/20 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)]">Mapping</h3>
            <Activity size={16} className="text-[var(--text-secondary)]" />
          </div>
          <div className="space-y-3 max-h-[320px] overflow-auto pr-2 custom-scrollbar">
            {plannerTasks.slice(0, 10).map((item) => (
              <div key={item.id} className="rounded-2xl bg-[var(--bg-primary)]/50 p-4 border border-[var(--border-color)] flex items-center justify-between group hover:border-[var(--accent-color)]/30 transition-all">
                <div className="min-w-0">
                  <p className="text-xs font-black text-[var(--text-primary)] uppercase italic truncate">{item.title}</p>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[var(--text-secondary)] flex items-center gap-1 mt-1 font-bold">
                    <Clock3 size={10} className="text-[var(--accent-color)]" />
                    {item.metadata?.dueDate ? new Date(item.metadata.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Standby'}
                  </p>
                </div>
                <div className="w-1 h-1 rounded-full bg-[var(--bg-secondary)] group-hover:bg-[var(--accent-color)] transition-colors" />
              </div>
            ))}
            {plannerTasks.length === 0 && <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase italic text-center py-10">No future vectors mapped.</p>}
          </div>
        </div>
      </section>

      {/* 4. Atmospheric Data (Footer) */}
      <section className="pt-10 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Atmospheric Data</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)]/50 px-4 py-2 rounded-xl border border-[var(--border-color)] shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">System Optimal</span>
            </div>
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)]/50 px-4 py-2 rounded-xl border border-[var(--border-color)] shadow-sm">
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Resonance: Stable</span>
            </div>
          </div>
        </div>
        <div className="max-w-xs text-center md:text-right">
          <p className="text-[9px] font-bold text-[var(--text-secondary)] leading-relaxed italic uppercase tracking-wider">
            "Your execution today is the bridge to your vision tomorrow. Stay on the vector, maintain the pulse."
          </p>
        </div>
      </section>
    </div>
  );
};
