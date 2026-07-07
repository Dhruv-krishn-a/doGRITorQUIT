"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedToday, dashboardApi } from '@gritorquit/dashboard-core';
import { SmartPlannerEngine } from '@gritorquit/domain/dashboard/SmartPlannerEngine';
import { FocusOverlay } from './FocusOverlay';
import { UnitCard } from '@gritorquit/study-ui-web';
import { AddBlockModal, AddTaskModal, ICON_LIST } from './architect';
import SmartTimeline from './SmartTimeline';
import { 
  Clock, Zap, ListTodo, Plus, CheckCircle2, 
  AlertTriangle, Trash2, Calendar, Play, Youtube
} from 'lucide-react';

// --- Constants ---
const DAY_START_HOUR = 23; // 11 PM as requested by user
import { toast } from 'sonner';

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

const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

// --- Main Page ---
export default function TodayUI({ onNavigate }: { onNavigate?: (path: string) => void } = {}) {
  const { data, loading, error, refresh } = useUnifiedToday();
  const [mounted, setMounted] = useState(false);
  const [focusItem, setFocusItem] = useState<any>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState<number | undefined>();
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleStartMission = (item: any) => {
    if (item.type === 'YOUTUBE' || item.type === 'VIDEO') {
      const trackId = item.metadata?.trackId;
      if (trackId) {
        // Assume Next.js routes format, caller can remap in onNavigate if needed, 
        // but desktop/web share very similar paths
        handleNavigation(`/dashboard/study/youtube/${trackId}/${item.id}`);
        return;
      }
    }
    if (item.type === 'COURSE') {
      const trackId = item.metadata?.trackId;
      if (trackId) {
        handleNavigation(`/dashboard/study/course/${trackId}/${item.id}`);
        return;
      }
    }
    if (item.type === 'PROJECT') {
      const projectId = item.metadata?.projectId || item.metadata?.planId;
      if (projectId) {
        handleNavigation(`/project-tracker/${projectId}`);
        return;
      }
      handleNavigation(`/project-tracker`);
      return;
    }
    // Generic task
    setFocusItem(item);
  };

  const { scheduleData, overflowTasks } = useMemo(() => {
    const rawBlocks = data?.fixedBlocks || [];
    const routineBlocks = rawBlocks.map((b: any) => ({
      ...b,
      startMinutes: SmartPlannerEngine.parseTime(b.start),
      endMinutes: SmartPlannerEngine.parseTime(b.end)
    }));

    const tasks = [...(data?.sections?.tasks || []), ...(data?.sections?.study || [])].filter((t: any) => t.status !== 'completed' && t.status !== 'DONE');
    const filteredTasks = selectedGoalIds.length > 0 ? tasks.filter((t: any) => selectedGoalIds.includes(t.id)) : tasks;
    
    const taskInputs = filteredTasks.map((t: any) => {
      const isMustDo = !!t.metadata?.isMustDo;
      const lockedTimeStr = t.metadata?.lockedTime;
      return {
        ...t,
        durationMinutes: t.duration || t.estimatedMinutes || 30,
        priority: t.priority?.toUpperCase() || 'MEDIUM',
        isMustDo,
        lockedStartMinutes: isMustDo && lockedTimeStr ? SmartPlannerEngine.parseTime(lockedTimeStr) : undefined,
      };
    });

    const result = SmartPlannerEngine.generatePlan(routineBlocks, taskInputs);
    
    return { 
      scheduleData: {
        totalFree: result.totalFreeMinutes, 
        allocated: [...result.mustDo, ...result.upNext], 
        blocks: rawBlocks, 
        collisions: result.collisions 
      },
      overflowTasks: result.overflow
    };
  }, [data, selectedGoalIds]);

  const handleSaveBlocks = async (blocks: any[]) => {
    try {
      const promises = blocks.map(b => dashboardApi.createTask({ title: b.title, date: new Date().toISOString(), metadata: { isFixedBlock: true, startTime: b.start, endTime: b.end, icon: b.icon } }));
      await Promise.all(promises); setShowAddBlock(false); refresh(); toast.success("Deployed");
    } catch (err) { toast.error("Sync Error"); }
  };

  const handleRemoveBlock = async (id: string) => { try { await dashboardApi.deleteTask(id); refresh(); toast.success('Removed'); } catch (err) { toast.error("Error"); } };
  const handleCreateTask = async (t: any) => { 
    try { 
      await dashboardApi.createTask({ 
        title: t.title, 
        date: new Date().toISOString(), 
        estimatedMinutes: Number(t.duration), 
        priority: t.intensity.toUpperCase() as any,
        metadata: {
          isMustDo: t.isMustDo,
          lockedTime: t.lockedTime
        }
      }); 
      setShowAddTask(false); 
      refresh(); 
      toast.success('Added'); 
    } catch (err) { 
      toast.error('Error'); 
    } 
  };
  const handleComplete = async (id: string, type: string) => {
    try {
      if (type === 'YOUTUBE' || type === 'COURSE' || type === 'VIDEO') {
        await dashboardApi.completeStudyUnit(id, 0); // 0 seconds fallback, sets to 100% watched
      } else {
        await dashboardApi.completeTask(id);
      }
      refresh();
      toast.success('Completed');
    } catch (err) {
      toast.error('Error');
    }
  };

  if (!mounted || (loading && !data)) return (<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" /></div>);

  const portalTarget = typeof document !== 'undefined' ? (document.getElementById('root') || document.body) : null;

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16 text-[var(--text-primary)] px-6 sm:px-10 lg:px-12 relative pt-12">
      {mounted && portalTarget && createPortal(
        <AnimatePresence>
          {showAddBlock && (
            <AddBlockModal 
              key="add-block-modal"
              onClose={() => { setShowAddBlock(false); setSelectedStartTime(undefined); }} 
              onSaveAll={handleSaveBlocks}
              initialStartTime={selectedStartTime}
              dayStartHour={DAY_START_HOUR}
              goals={[...(data?.sections?.tasks || []), ...(data?.sections?.study || [])].filter(t => t.status !== 'completed' && t.status !== 'DONE')}
              selectedGoalIds={selectedGoalIds}
              onToggleGoal={(id) => setSelectedGoalIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            />
          )}
          {showAddTask && (
            <AddTaskModal 
              key="add-task-modal"
              onClose={() => setShowAddTask(false)} 
              onSubmit={handleCreateTask} 
            />
          )}
          {focusItem && (
            <FocusOverlay 
              key="focus-overlay"
              item={focusItem} 
              onClose={() => { setFocusItem(null); refresh(); }} 
              onComplete={() => { handleComplete(focusItem.id, focusItem.type); setFocusItem(null); }}
            />
          )}
        </AnimatePresence>, 
        document.body
      )}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tightest mb-2 italic uppercase">Today</h1>
          <p className="text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">Your clear path for a balanced day.</p>
        </div>
        
        {/* Day Balance / Burnout Meter */}
        <div className="flex-1 max-w-md w-full">
           <div className="bg-[var(--bg-card)]/40 border border-[var(--border-color)] rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Your Day Balance</span>
                 <span className={`text-[9px] font-black uppercase tracking-widest ${scheduleData.allocated.length > 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {scheduleData.allocated.length > 5 ? 'Heavy Load' : 'Perfectly Balanced'}
                 </span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (scheduleData.allocated.length / 8) * 100)}%` }}
                    className={`h-full ${scheduleData.allocated.length > 5 ? 'bg-rose-500' : 'bg-[var(--accent-color)]'}`} 
                 />
              </div>
              <p className="mt-3 text-[10px] font-medium italic opacity-60">
                 {scheduleData.allocated.length > 5 
                    ? "Your day is quite full. Remember to take short breaks." 
                    : "You have a great rhythm today. Keep going!"}
              </p>
           </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {scheduleData.collisions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-[9px] font-black uppercase tracking-widest italic">
              <AlertTriangle size={10}/> Heads up: Overlap in {scheduleData.collisions.join(', ')}
            </div>
          )}
          <button onClick={() => setShowAddBlock(true)} className="px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[var(--accent-color)]/20 flex items-center gap-2 italic hover:-translate-y-0.5 active:scale-95">
             <Plus size={16}/> Plan My Day
          </button>
        </div>
      </header>
      <section className="mb-12">
        <SmartTimeline 
          blocks={scheduleData.blocks} 
          onTimeClick={(mins) => {
            setSelectedStartTime(mins);
            setShowAddBlock(true);
          }}
          startHour={DAY_START_HOUR}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
          <AnimatePresence mode="popLayout">
            {data?.fixedBlocks?.map((b: any) => {
              const s = formatMinutesToTime(parse24hToMinutes(b.start)); const e = formatMinutesToTime(parse24hToMinutes(b.end));
              const IconComp = ICON_LIST.find(i=>i.id===b.icon)?.icon || Clock;
              return (
                <motion.div layout initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} key={b.id} className="group p-5 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 rounded-2xl shadow-sm transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4"><div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-[var(--accent-color)] shadow-inner"><IconComp size={20} /></div><button onClick={()=>handleRemoveBlock(b.id)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16}/></button></div>
                  <h3 className="text-lg font-black mb-1 truncate italic uppercase leading-none">{b.title}</h3><p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic">{s.time} {s.ampm} — {e.time} {e.ampm}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <button onClick={()=>setShowAddBlock(true)} className="flex flex-col items-center justify-center gap-3 p-5 bg-[var(--bg-secondary)]/50 border-2 border-[var(--border-color)] border-dashed rounded-2xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/50 transition-all min-h-[140px] italic"><Plus size={32} strokeWidth={3}/><span className="text-[9px] font-black uppercase tracking-widest">Add Pillar</span></button>
        </div>
      </section>
      <section className="mb-12 p-8 bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-[3rem] flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden text-left">
        <div className="transform-gpu absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--accent-color)]/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-6xl font-black text-[var(--accent-color)] tracking-tightest mb-2 italic uppercase">{formatDuration(scheduleData.totalFree)}</h2>
          <p className="text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic">Free time available today</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 relative z-10">
          {[ {t:'7-10 AM',l:'Peak Focus'}, {t:'6-7 PM',l:'Evening Flow'}, {t:'8-12 PM',l:'Wind Down'} ].map((z,i)=>(
            <div key={i} className="flex flex-col items-center p-6 px-10 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 hover:border-[var(--accent-color)]/30 transition-all shadow-sm">
              <span className="text-base font-black text-[var(--text-primary)] italic uppercase">{z.t}</span>
              <span className="text-[8px] uppercase tracking-[0.3em] font-black mt-2 text-[var(--text-secondary)] opacity-40 italic">{z.l}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="flex justify-center gap-6 mb-16">
         <button onClick={()=>setShowAddTask(true)} className="px-8 py-4 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md hover:border-[var(--accent-color)] transition-all flex items-center gap-3 italic">
            <Plus size={18}/> New Action
         </button>
         <button onClick={()=>refresh()} className="px-12 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-[var(--accent-color)]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 italic">
            <Zap size={18} fill="currentColor"/> Generate My Path
         </button>
      </div>
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border-color)] pb-6">
          <h2 className="text-3xl font-black tracking-tightest uppercase italic">Your Path</h2>
          {selectedGoalIds.length > 0 && (
            <button 
              onClick={() => setSelectedGoalIds([])}
              className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] hover:underline"
            >
              Reset Selection
            </button>
          )}
        </div>
        <div className="space-y-6 relative">
          <div className="absolute left-[80px] top-6 bottom-6 w-px bg-gradient-to-b from-[var(--accent-color)]/30 via-[var(--border-color)] to-[var(--accent-color)]/30 hidden sm:block" />
          <AnimatePresence mode="popLayout">{scheduleData.allocated.map(task=>{
            const s = formatMinutesToTime(task.startTime);
            const isStudyUnit = task.type === 'YOUTUBE' || task.type === 'COURSE' || task.type === 'VIDEO';
            
            return (
              <motion.div key={task.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="flex flex-col sm:flex-row gap-6 sm:gap-12 group">
                <div className="sm:w-20 pt-6 sm:text-right shrink-0">
                  <div className="text-xl font-black tracking-tighter italic">{s.time}</div>
                  <div className="text-[9px] uppercase tracking-widest text-[var(--accent-color)] font-black mt-1.5">{s.ampm}</div>
                </div>
                <div className="flex-1 min-w-0">
                  {isStudyUnit ? (
                    <UnitCard 
                      unit={task as any} 
                      index={0} 
                      onAction={(action) => {
                        if (action === 'SESSION') handleStartMission(task);
                        if (action === 'COMPLETE') handleComplete(task.id, task.type);
                      }} 
                      isDraggable={false} 
                    />
                  ) : (
                    <div className="p-8 bg-[var(--bg-card)]/40 backdrop-blur-sm border border-[var(--border-color)] group-hover:border-[var(--accent-color)]/40 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold leading-tight tracking-tight uppercase italic">{task.title}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[var(--bg-secondary)] border border-[var(--border-color)]">{task.metadata?.intensity || 'DEEP'} Flow</span>
                          <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Clock size={12}/> {task.durationMinutes}m</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setFocusItem(task)}
                          className="flex items-center gap-2 px-6 py-3.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
                        >
                          <Play size={14} fill="currentColor"/> Start Focus
                        </button>
                        <button 
                          onClick={() => handleComplete(task.id, task.type)}
                          className="p-5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-2xl transition-all shadow-sm active:scale-90"
                        >
                          <CheckCircle2 size={24}/>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}</AnimatePresence>
          {scheduleData.allocated.length===0 && <div className="p-24 text-center border-4 border-dashed border-[var(--border-color)] rounded-[3rem] text-[var(--text-secondary)] opacity-20"><ListTodo size={64} className="mx-auto mb-6"/><p className="text-base font-black uppercase tracking-widest italic">Awaiting your journey...</p></div>}
        </div>
      </section>

      {overflowTasks.length > 0 && (
        <section className="mt-16 pt-8 border-t border-[var(--border-color)] opacity-70">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black tracking-tightest uppercase italic text-[var(--text-secondary)]">Pushed to Tomorrow</h2>
            <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">Overflow</span>
          </div>
          <div className="space-y-4">
            {overflowTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-6 bg-[var(--bg-card)]/20 border border-[var(--border-color)] rounded-2xl grayscale">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{task.priority}</span>
                  <h3 className="text-base font-bold italic line-through decoration-[var(--border-color)]">{task.title}</h3>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest"><Clock size={12} className="inline mr-1" /> {task.durationMinutes}m</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
