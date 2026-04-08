"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedToday, dashboardApi } from '@gritorquit/dashboard-core';
import { FocusOverlay } from './FocusOverlay';
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
export default function TodayUI() {
  const { data, loading, error, refresh } = useUnifiedToday();
  const [mounted, setMounted] = useState(false);
  const [focusItem, setFocusItem] = useState<any>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState<number | undefined>();
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const scheduleData = useMemo(() => {
    const rawBlocks = data?.fixedBlocks || [];
    const normalized: any[] = [];
    rawBlocks.forEach((b: any) => {
      const s = parse24hToMinutes(b.start); const e = parse24hToMinutes(b.end);
      if (e < s) { normalized.push({ ...b, s: 0, e }); normalized.push({ ...b, s, e: 1440 }); }
      else { normalized.push({ ...b, s, e }); }
    });
    const sorted = normalized.sort((a, b) => a.s - b.s);
    
    // Collision Detection Logic
    const collisions: string[] = [];
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[i].e > sorted[j].s && sorted[i].s < sorted[j].e) {
          if (!collisions.includes(sorted[i].title)) collisions.push(sorted[i].title);
          if (!collisions.includes(sorted[j].title)) collisions.push(sorted[j].title);
        }
      }
    }

    const merged: any[] = [];
    if (sorted.length > 0) {
      let current = { s: sorted[0].s, e: sorted[0].e };
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].s <= current.e) { current.e = Math.max(current.e, sorted[i].e); }
        else { merged.push(current); current = { s: sorted[i].s, e: sorted[i].e }; }
      }
      merged.push(current);
    }
    const freeWindows: any[] = []; let lastEnd = 0;
    merged.forEach(b => { if (b.s > lastEnd) freeWindows.push({ s: lastEnd, e: b.s, d: b.s - lastEnd }); lastEnd = b.e; });
    if (lastEnd < 1440) freeWindows.push({ s: lastEnd, e: 1440, d: 1440 - lastEnd });
    
    const totalFree = Math.max(0, freeWindows.reduce((acc, w) => acc + w.d, 0));
    const tasks = [...(data?.sections?.tasks || []), ...(data?.sections?.study || [])].filter(t => t.status !== 'completed' && t.status !== 'DONE');
    
    // Filter by selected goal IDs if any are selected, otherwise show all
    const filteredTasks = selectedGoalIds.length > 0 ? tasks.filter(t => selectedGoalIds.includes(t.id)) : tasks;

    const tasksWithDurations = filteredTasks.map(t => ({ 
      ...t, 
      actualDuration: t.duration || t.estimatedMinutes || 30, 
      intensity: t.priority === 'HIGH' || t.priority === 'URGENT' ? 'High' : (t.priority === 'LOW' ? 'Low' : 'Mid') 
    }));
    
    const allocated: any[] = []; let currentWindowIdx = 0; let currentWindow = freeWindows.length > 0 ? { ...freeWindows[0] } : null;
    tasksWithDurations.forEach(task => {
      let placed = false; let buffer = task.intensity === 'High' ? 15 : (task.intensity === 'Mid' ? 5 : 0);
      while (currentWindow && !placed) {
        if (currentWindow.d >= task.actualDuration) {
          allocated.push({ ...task, startTime: currentWindow.s, endTime: currentWindow.s + task.actualDuration });
          currentWindow.s += (task.actualDuration + buffer); currentWindow.d -= (task.actualDuration + buffer); placed = true;
        } else { currentWindowIdx++; currentWindow = currentWindowIdx < freeWindows.length ? { ...freeWindows[currentWindowIdx] } : null; }
      }
    });
    return { totalFree, allocated, blocks: sorted, collisions };
  }, [data]);

  const handleSaveBlocks = async (blocks: any[]) => {
    try {
      const promises = blocks.map(b => dashboardApi.createTask({ title: b.title, date: new Date().toISOString(), metadata: { isFixedBlock: true, startTime: b.start, endTime: b.end, icon: b.icon } }));
      await Promise.all(promises); setShowAddBlock(false); refresh(); toast.success("Deployed");
    } catch (err) { toast.error("Sync Error"); }
  };

  const handleRemoveBlock = async (id: string) => { try { await dashboardApi.deleteTask(id); refresh(); toast.success('Removed'); } catch (err) { toast.error("Error"); } };
  const handleCreateTask = async (t: any) => { try { await dashboardApi.createTask({ title: t.title, date: new Date().toISOString(), estimatedMinutes: Number(t.duration), priority: t.intensity.toUpperCase() as any }); setShowAddTask(false); refresh(); toast.success('Added'); } catch (err) { toast.error('Error'); } };
  const handleComplete = async (id: string, type: string) => { try { if (type === 'TASK') await dashboardApi.completeTask(id); else await dashboardApi.completeStudyUnit(id); refresh(); toast.success("Done"); } catch (err) { toast.error("Error"); } };

  if (!mounted || (loading && !data)) return (<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" /></div>);

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16 text-[var(--text-primary)] px-6 sm:px-10 lg:px-12 relative pt-12">
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showAddBlock && (
            <AddBlockModal 
              onClose={() => { setShowAddBlock(false); setSelectedStartTime(undefined); }} 
              onSaveAll={handleSaveBlocks}
              initialStartTime={selectedStartTime}
              dayStartHour={DAY_START_HOUR}
              goals={[...(data?.sections?.tasks || []), ...(data?.sections?.study || [])].filter(t => t.status !== 'completed' && t.status !== 'DONE')}
              selectedGoalIds={selectedGoalIds}
              onToggleGoal={(id) => setSelectedGoalIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            />
          )}
          {showAddTask && <AddTaskModal onClose={() => setShowAddTask(false)} onSubmit={handleCreateTask} />}
          {focusItem && (
            <FocusOverlay 
              item={focusItem} 
              onClose={() => { setFocusItem(null); refresh(); }} 
              onComplete={() => { handleComplete(focusItem.id, focusItem.type); setFocusItem(null); }}
            />
          )}
        </AnimatePresence>, 
        document.body
      )}
      <header className="mb-8 flex items-end justify-between">
        <div><h1 className="text-4xl font-black tracking-tightest mb-1">Today</h1><p className="text-[var(--text-secondary)] font-bold text-base opacity-60">Define your non-negotiable path.</p></div>
        <div className="flex flex-col items-end gap-3">
          {scheduleData.collisions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/20 text-[9px] font-black uppercase tracking-widest">
              <AlertTriangle size={10}/> Collision: {scheduleData.collisions.join(', ')}
            </div>
          )}
          <button onClick={() => setShowAddBlock(true)} className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-color)] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"><Plus size={16}/> Architect Day</button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {data?.fixedBlocks?.map((b: any) => {
              const s = formatMinutesToTime(parse24hToMinutes(b.start)); const e = formatMinutesToTime(parse24hToMinutes(b.end));
              const IconComp = ICON_LIST.find(i=>i.id===b.icon)?.icon || Clock;
              return (
                <motion.div layout initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} key={b.id} className="group p-5 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 rounded-2xl shadow-sm transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4"><div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-[var(--accent-color)] shadow-inner"><IconComp size={20} /></div><button onClick={()=>handleRemoveBlock(b.id)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16}/></button></div>
                  <h3 className="text-lg font-black mb-1 truncate">{b.title}</h3><p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{s.time} {s.ampm} — {e.time} {e.ampm}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <button onClick={()=>setShowAddBlock(true)} className="flex flex-col items-center justify-center gap-3 p-5 bg-[var(--bg-secondary)]/50 border-2 border-[var(--border-color)] border-dashed rounded-2xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/50 transition-all min-h-[140px]"><Plus size={32} strokeWidth={3}/><span className="text-[9px] font-black uppercase tracking-widest">Add Pillar</span></button>
        </div>
      </section>
      <section className="mb-12 p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
        <div><h2 className="text-6xl font-black text-[var(--accent-color)] tracking-tightest mb-2">{formatDuration(scheduleData.totalFree)}</h2><p className="text-[var(--text-secondary)] font-bold text-base opacity-60">Architected capacity for today.</p></div>
        <div className="flex flex-wrap justify-center gap-4">{[ {t:'7-10 AM',l:'Peak'}, {t:'6-7 PM',l:'Pulse'}, {t:'8-12 PM',l:'Orbit'} ].map((z,i)=>(<div key={i} className="flex flex-col items-center p-4 px-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:scale-105 transition-transform"><span className="text-base font-black">{z.t}</span><span className="text-[8px] uppercase tracking-widest font-black mt-1 opacity-40">{z.l}</span></div>))}</div>
      </section>
      <div className="flex justify-center gap-4 mb-16"><button onClick={()=>setShowAddTask(true)} className="px-8 py-4 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-full font-black text-xs uppercase tracking-widest shadow-md hover:border-[var(--accent-color)] transition-all flex items-center gap-3"><Plus size={20}/> New Objective</button><button onClick={()=>refresh()} className="px-12 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"><Zap size={20} fill="currentColor"/> Generate Plan</button></div>
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border-color)] pb-4">
          <h2 className="text-2xl font-black tracking-tight">The Allocated Path</h2>
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
            const isVideo = task.type === 'VIDEO' || (task.metadata as any)?.youtubeId;
            return (
              <motion.div key={task.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="flex flex-col sm:flex-row gap-6 sm:gap-12 group">
                <div className="sm:w-20 pt-6 sm:text-right shrink-0">
                  <div className="text-xl font-black tracking-tighter">{s.time}</div>
                  <div className="text-[9px] uppercase tracking-widest text-[var(--accent-color)] font-black mt-0.5">{s.ampm}</div>
                </div>
                <div className="flex-1 p-6 bg-[var(--bg-card)] border border-[var(--border-color)] group-hover:border-[var(--accent-color)]/40 rounded-3xl shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {isVideo && <Youtube size={14} className="text-rose-500" />}
                      <h3 className="text-xl font-black leading-tight">{task.title}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[var(--bg-secondary)]">{task.intensity} Intensity</span>
                      <span className="text-xs text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Clock size={12}/> {task.actualDuration}m</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setFocusItem(task)}
                      className="flex items-center gap-2 px-5 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Play size={14} fill="currentColor"/> Start
                    </button>
                    <button 
                      onClick={() => handleComplete(task.id, task.type)}
                      className="p-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm"
                    >
                      <CheckCircle2 size={24}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}</AnimatePresence>
          {scheduleData.allocated.length===0 && <div className="p-24 text-center border-4 border-dashed border-[var(--border-color)] rounded-3xl text-[var(--text-secondary)] opacity-20"><ListTodo size={64} className="mx-auto mb-6"/><p className="text-base font-black uppercase tracking-widest">Awaiting Plan Deployment</p></div>}
        </div>
      </section>
    </div>
  );
}
