"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, CheckCircle2, 
  Quote, Plus, LayoutGrid, List, Briefcase, BookOpen, Clock, PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task as BaseTask } from "@/types/plan";
import TaskItem from "@/features/tasks/components/TaskItem";
import { 
  UnitCard
} from "@planner/study-ui-web";
import { useStudy, Unit } from "@planner/study-core";

export interface ExtendedTask extends BaseTask {
  timeSpentMinutes?: number;
}

interface TodayClientPageProps {
  initialTasks: ExtendedTask[];
  initialUnits: any[];
}

const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your future is created by what you do today, not tomorrow.",
  "Discipline is choosing between what you want now and what you want most.",
  "Atomic habits lead to massive results.",
  "The only bad workout is the one that didn't happen.",
  "NEURAL_INPUT: OPTIMIZE_YOUR_DAY",
  "Neural Command Center: READY_FOR_EXECUTION"
];

export default function TodayClientPage({ initialTasks, initialUnits }: TodayClientPageProps) {
  const router = useRouter();
  const { openModal } = useStudy();
  const [tasks, setTasks] = useState<ExtendedTask[]>(initialTasks || []);
  const [units, setUnits] = useState<any[]>(initialUnits || []);
  const [quote, setQuote] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  // --- HANDLERS ---
  const handleUpdate = async (taskId: string, updates: Partial<ExtendedTask>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    try {
      await fetch(`/api/tasks/${taskId}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates) 
      });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const handleLogTime = async (taskId: string, minutes: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, timeSpentMinutes: (t.timeSpentMinutes || 0) + minutes } : t));
    try {
      await fetch(`/api/tasks/${taskId}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addMinutes: minutes }) 
      });
    } catch (err) {
      console.error("Failed to log time", err);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    setTasks(prev => prev.map(t => ({
      ...t,
      subtasks: t.subtasks?.map(st => st.id === subtaskId ? { ...st, completed } : st)
    })));
    try {
      await fetch(`/api/subtasks/${subtaskId}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }) 
      });
    } catch (err) {
      console.error("Failed to toggle subtask", err);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    const prev = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete task", err);
      setTasks(prev); 
    }
  };

  const handleUnitAction = (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: any) => {
    const trackType = unit.track?.type || 'course';
    const pathPrefix = trackType === 'PROJECT' ? 'project' : trackType === 'PLAYLIST' ? 'youtube' : 'course';
    if (type === 'SESSION') {
      router.push(`/dashboard/study/${pathPrefix}/${unit.trackId}/${unit.id}`);
    } else if (type === 'TIMER') {
      router.push(`/dashboard/study/${pathPrefix}/${unit.trackId}/${unit.id}?layout=FULL_NOTES&autostart=true`);
    } else if (type === 'COMPLETE') {
      openModal('SESSION', unit as Unit, 'LOGS');
    }
  };

  if (!mounted) return null;

  return (
    <div className="transform-gpu relative w-full min-h-screen bg-[#0a0105] text-rose-100 selection:bg-rose-500/30 selection:text-white font-sans overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="transform-gpu absolute top-0 left-1/2 w-[50rem] h-[37.5rem] bg-rose-600/5 rounded-full blur-[150px] -translate-x-1/2 pointer-events-none" />

        <div className="transform-gpu relative z-10 w-full max-w-7xl mx-auto space-y-12 pt-6 pb-24 px-6 md:px-10 animate-in fade-in duration-1000">
          
          {/* Header Section */}
          <header className="transform-gpu flex flex-col md:flex-row justify-between md:items-center gap-8 border-b border-rose-900/40 pb-8">
            <div className="transform-gpu space-y-1">
              <div className="transform-gpu flex items-center gap-3">
                <h1 className="transform-gpu text-4xl font-bold text-rose-50 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">Today</h1>
                <span className="transform-gpu bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)] uppercase">Active Vector</span>
              </div>
              <p className="transform-gpu text-rose-500/60 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 mt-1">
                <span className="transform-gpu w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </header>

          {/* Quote Card */}
          <section className="transform-gpu relative group">
            <div className="transform-gpu bg-[#14030b] border border-rose-900/40 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-rose-500/30 transition-colors shadow-black/40">
              <div className="transform-gpu absolute top-0 right-0 p-8 opacity-5 text-rose-500 group-hover:scale-110 transition-transform duration-700 group-hover:opacity-10 pointer-events-none">
                <Quote size={120} />
              </div>
              <div className="transform-gpu relative z-10 space-y-4">
                <div className="transform-gpu flex items-center gap-2 text-rose-500/50 font-bold text-[10px] uppercase tracking-[0.4em]">
                  <Sparkles size={12} /> Neural Inspiration
                </div>
                <h2 className="transform-gpu text-2xl md:text-3xl font-bold text-rose-50 leading-tight italic drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                  &quot;{quote}&quot;
                </h2>
              </div>
            </div>
          </section>

          <div className="transform-gpu flex flex-col gap-12">
            
            {/* Unified Today List */}
            <div className="transform-gpu space-y-8">
              <div className="transform-gpu flex items-center justify-between">
                <div className="transform-gpu flex items-center gap-3">
                  <div className="transform-gpu w-1 h-6 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  <h2 className="transform-gpu text-xl font-bold text-rose-50 uppercase tracking-tighter">Unified Focus Vector</h2>
                </div>
                <span className="transform-gpu text-[10px] font-bold text-rose-500/40 uppercase tracking-widest">{tasks.length + units.length} Items</span>
              </div>

              <div className="transform-gpu space-y-4">
                {tasks.length === 0 && units.length === 0 ? (
                  <div className="transform-gpu bg-[#14030b] border border-dashed border-rose-900/40 rounded-[2rem] p-12 text-center">
                    <CheckCircle2 className="transform-gpu mx-auto text-rose-500/20 mb-4" size={48} />
                    <p className="transform-gpu text-rose-500/40 font-bold uppercase tracking-widest text-xs">All clear for today</p>
                  </div>
                ) : (
                  <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Render Plan Tasks */}
                    {tasks.map(task => (
                      <div key={task.id} className="transform-gpu bg-[#14030b] border border-rose-900/40 rounded-2xl p-6 hover:border-rose-500/30 transition-all shadow-black/40 flex flex-col justify-between group">
                         <div>
                            <div className="transform-gpu flex items-center gap-2 text-rose-400/50 mb-4">
                               <CheckCircle2 size={14} className="transform-gpu text-rose-500" />
                               <span className="transform-gpu text-[8px] font-bold uppercase tracking-widest">Plan Task</span>
                            </div>
                            <h3 className="transform-gpu text-sm font-bold text-rose-50 leading-snug mb-2 group-hover:text-white transition-colors">{task.title}</h3>
                            {task.description && <p className="transform-gpu text-[10px] text-rose-200/50 line-clamp-2">{task.description}</p>}
                         </div>
                         <div className="transform-gpu flex items-center justify-between mt-6">
                            <span className="transform-gpu text-[10px] font-bold text-rose-500/60 uppercase tracking-widest px-2 py-1 bg-[#1c0510] rounded border border-rose-900/50">Pending</span>
                            <button 
                              onClick={() => {
                                 // Simple logic to quick complete or log
                                 const min = prompt("Log minutes?", "0");
                                 if (min !== null) {
                                    handleLogTime(task.id, parseInt(min));
                                    handleUpdate(task.id, { status: "Completed" });
                                 }
                              }}
                              className="transform-gpu px-5 py-2.5 bg-rose-600/10 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                            >
                              Action
                            </button>
                         </div>
                      </div>
                    ))}

                    {/* Render Course / Project Units */}
                    {units.map((unit) => {
                      const isCourse = unit.track?.type === 'COURSE' || unit.track?.type === 'PLAYLIST';
                      return (
                        <div key={unit.id} className={`bg-[#14030b] border ${isCourse ? 'border-fuchsia-900/40 hover:border-fuchsia-500/30' : 'border-emerald-900/40 hover:border-emerald-500/30'} rounded-2xl p-6 transition-all shadow-black/40 flex flex-col justify-between group`}>
                           <div>
                              <div className={`flex items-center gap-2 mb-4 ${isCourse ? 'text-fuchsia-400/50' : 'text-emerald-400/50'}`}>
                                 {isCourse ? <BookOpen size={14} className="transform-gpu text-fuchsia-500" /> : <Briefcase size={14} className="transform-gpu text-emerald-500" />}
                                 <span className="transform-gpu text-[8px] font-bold uppercase tracking-widest">{isCourse ? 'Course Module' : 'Project Phase'}</span>
                                 <span className="transform-gpu text-[8px] font-bold uppercase tracking-widest opacity-50 truncate max-w-[100px] ml-auto">{unit.trackTitle}</span>
                              </div>
                              <h3 className="transform-gpu text-sm font-bold text-rose-50 leading-snug mb-2 group-hover:text-white transition-colors">{unit.title}</h3>
                              {unit.description && <p className="transform-gpu text-[10px] text-rose-200/50 line-clamp-2">{unit.description}</p>}
                           </div>
                           <div className="transform-gpu flex items-center justify-between mt-6">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#1c0510] rounded border ${isCourse ? 'text-fuchsia-500/60 border-fuchsia-900/50' : 'text-emerald-500/60 border-emerald-900/50'}`}>
                                 {unit.durationMinutes ? `${unit.durationMinutes}m` : 'Action required'}
                              </span>
                              <button 
                                onClick={() => handleUnitAction('SESSION', unit)}
                                className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border active:scale-95 ${isCourse ? 'bg-fuchsia-600/10 text-fuchsia-400 border-fuchsia-500/30 hover:bg-fuchsia-600 hover:text-white' : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'}`}
                              >
                                {isCourse ? 'Study' : 'Execute'}
                              </button>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
  );
}
