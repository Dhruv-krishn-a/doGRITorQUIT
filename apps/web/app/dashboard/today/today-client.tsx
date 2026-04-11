"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, CheckCircle2, 
  Quote, Briefcase, BookOpen, Clock, Zap, Activity, Play
} from "lucide-react";
import { Task as BaseTask } from "@/types/plan";
import { useStudy, Unit } from "@gritorquit/study-core";

export interface ExtendedTask extends BaseTask {
  timeSpentMinutes?: number;
}

type TodayUnit = { id: string; title: string; description?: string; durationMinutes?: number; trackTitle?: string; trackId: string; track?: { type: string } };

interface TodayClientPageProps {
  initialTasks: ExtendedTask[];
  initialUnits: TodayUnit[];
}

const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your future is created by what you do today, not tomorrow.",
  "Discipline is choosing between what you want now and what you want most.",
  "Atomic habits lead to massive results.",
  "Smart Command Center: READY_FOR_EXECUTION",
  "Stay focused. Maintain the momentum."
];

export default function TodayClientPage({ initialTasks, initialUnits }: TodayClientPageProps) {
  const router = useRouter();
  const { openModal } = useStudy();
  const [tasks, setTasks] = useState<ExtendedTask[]>(initialTasks || []);
  const [units] = useState<TodayUnit[]>(initialUnits || []);
  const [quote, setQuote] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

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

  const handleUnitAction = (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: TodayUnit) => {
    const trackType = unit.track?.type || 'course';
    const pathPrefix = trackType === 'PROJECT' ? 'project' : trackType === 'PLAYLIST' ? 'youtube' : 'course';
    if (type === 'SESSION') {
      router.push(`/dashboard/study/${pathPrefix}/${unit.trackId}/${unit.id}`);
    } else if (type === 'TIMER') {
      router.push(`/dashboard/study/${pathPrefix}/${unit.trackId}/${unit.id}?layout=FULL_NOTES&autostart=true`);
    } else if (type === 'COMPLETE') {
      openModal('SESSION', unit as unknown as Unit, 'LOGS');
    }
  };

  if (!mounted) return null;

  return (
    <div className="transform-gpu relative w-full min-h-screen bg-obsidian text-slate-200 selection:bg-sky-500/30 selection:text-white font-sans overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="transform-gpu absolute top-0 left-1/2 w-[50rem] h-[37.5rem] bg-sky-500/5 rounded-full blur-[150px] -translate-x-1/2 pointer-events-none" />

        <div className="transform-gpu relative z-10 w-full max-w-7xl mx-auto space-y-12 pt-6 pb-24 px-6 md:px-10 animate-in fade-in duration-1000">
          
          {/* Header Section */}
          <header className="transform-gpu flex flex-col md:flex-row justify-between md:items-end gap-8 border-b border-slate-800 pb-8">
            <div className="transform-gpu space-y-1 text-left">
              <div className="transform-gpu flex items-center gap-3">
                <h1 className="transform-gpu text-4xl font-black text-white italic uppercase tracking-tighter">Command Center</h1>
                <span className="transform-gpu bg-sky-500/10 text-sky-focus text-[10px] font-black px-3 py-1 rounded-full border border-sky-500/20 shadow-lg shadow-sky-500/10 uppercase tracking-widest">Active Task</span>
              </div>
              <p className="transform-gpu text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 mt-2 ml-1">
                <Activity size={12} className="text-sky-focus animate-pulse" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-3xl border border-slate-700">
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
                  <p className="text-xs font-black text-white uppercase">Operational</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                  <Zap size={18} className="text-sky-focus" />
               </div>
            </div>
          </header>

          {/* Quote Card */}
          <section className="transform-gpu relative group">
            <div className="transform-gpu bg-slate-surface/30 border border-slate-800 p-10 rounded-[3rem] relative overflow-hidden group hover:border-sky-focus/30 transition-all shadow-2xl">
              <div className="transform-gpu absolute top-0 right-0 p-8 opacity-5 text-sky-focus group-hover:scale-110 transition-transform duration-700 group-hover:opacity-10 pointer-events-none">
                <Quote size={120} />
              </div>
              <div className="transform-gpu relative z-10 space-y-4 text-left">
                <div className="transform-gpu flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">
                  <Sparkles size={12} /> Daily Motivation
                </div>
                <h2 className="transform-gpu text-2xl md:text-3xl font-black text-white leading-tight italic uppercase tracking-tight">
                  &quot;{quote}&quot;
                </h2>
              </div>
            </div>
          </section>

          <div className="transform-gpu flex flex-col gap-12">
            
            {/* Unified Today List */}
            <div className="transform-gpu space-y-8">
              <div className="transform-gpu flex items-center justify-between ml-1">
                <div className="transform-gpu flex items-center gap-3">
                  <div className="transform-gpu w-1 h-6 bg-sky-focus rounded-full shadow-lg shadow-sky-500/50" />
                  <h2 className="transform-gpu text-xl font-black text-white uppercase tracking-widest italic">Focus Stream</h2>
                </div>
                <span className="transform-gpu text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">{tasks.length + units.length} Active Tasks</span>
              </div>

              <div className="transform-gpu space-y-4">
                {tasks.length === 0 && units.length === 0 ? (
                  <div className="transform-gpu bg-slate-800/10 border border-dashed border-slate-800 rounded-[3rem] p-20 text-center">
                    <CheckCircle2 className="transform-gpu mx-auto text-slate-800 mb-4" size={48} />
                    <p className="transform-gpu text-slate-600 font-black uppercase tracking-widest text-xs italic">All tasks resolved.</p>
                  </div>
                ) : (
                  <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Render Plan Tasks */}
                    {tasks.map(task => (
                      <div key={task.id} className="transform-gpu bg-slate-surface/20 border border-slate-800 rounded-[2rem] p-8 hover:border-sky-focus/30 transition-all shadow-xl flex flex-col justify-between group">
                         <div className="text-left">
                            <div className="transform-gpu flex items-center gap-2 text-slate-500 mb-6">
                               <CheckCircle2 size={16} className="transform-gpu text-sky-focus" />
                               <span className="transform-gpu text-[9px] font-black uppercase tracking-widest">General Task</span>
                            </div>
                            <h3 className="transform-gpu text-lg font-black text-white uppercase italic tracking-tight mb-3 group-hover:text-sky-focus transition-colors leading-tight">{task.title}</h3>
                            {task.description && <p className="transform-gpu text-[11px] font-bold text-slate-500 line-clamp-2 uppercase tracking-wide leading-relaxed">{task.description}</p>}
                         </div>
                         <div className="transform-gpu flex items-center justify-between mt-8">
                            <span className="transform-gpu text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 py-1.5 bg-obsidian rounded-xl border border-slate-800">Operational</span>
                            <button 
                              onClick={() => {
                                 const min = prompt("Log minutes?", "0");
                                 if (min !== null) {
                                    handleLogTime(task.id, parseInt(min));
                                    handleUpdate(task.id, { status: "Completed" });
                                 }
                              }}
                              className="transform-gpu px-6 py-3 bg-white text-obsidian rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-focus transition-all active:scale-95 shadow-lg"
                            >
                              Complete
                            </button>
                         </div>
                      </div>
                    ))}

                    {/* Render Course / Project Units */}
                    {units.map((unit) => {
                      const isCourse = unit.track?.type === 'COURSE' || unit.track?.type === 'PLAYLIST';
                      return (
                        <div key={unit.id} className={`bg-slate-surface/20 border ${isCourse ? 'border-slate-800 hover:border-sky-focus/30' : 'border-slate-800 hover:border-mint/30'} rounded-[2rem] p-8 transition-all shadow-xl flex flex-col justify-between group`}>
                           <div className="text-left">
                              <div className={`flex items-center gap-2 mb-6 ${isCourse ? 'text-sky-focus/50' : 'text-mint/50'}`}>
                                 {isCourse ? <BookOpen size={16} className="transform-gpu text-sky-focus" /> : <Briefcase size={16} className="transform-gpu text-mint" />}
                                 <span className="transform-gpu text-[9px] font-black uppercase tracking-widest">{isCourse ? 'Lesson' : 'Step'}</span>
                                 <span className="transform-gpu text-[9px] font-black text-slate-600 uppercase tracking-widest opacity-50 truncate max-w-[100px] ml-auto italic">{unit.trackTitle}</span>
                              </div>
                              <h3 className="transform-gpu text-lg font-black text-white uppercase italic tracking-tight mb-3 group-hover:text-sky-focus transition-colors leading-tight">{unit.title}</h3>
                              {unit.description && <p className="transform-gpu text-[11px] font-bold text-slate-500 line-clamp-2 uppercase tracking-wide leading-relaxed">{unit.description}</p>}
                           </div>
                           <div className="transform-gpu flex items-center justify-between mt-8">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-obsidian rounded-xl border border-slate-800">
                                 <Clock size={10} className="text-slate-600" />
                                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                    {unit.durationMinutes ? `${unit.durationMinutes}M` : 'REQ'}
                                 </span>
                              </div>
                              <button 
                                onClick={() => handleUnitAction('SESSION', unit)}
                                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg flex items-center gap-2 ${isCourse ? 'bg-sky-focus text-obsidian hover:bg-white' : 'bg-mint text-obsidian hover:bg-white'}`}
                              >
                                <Play size={12} fill="currentColor" />
                                Start
                              </button>
                           </div>
                        </div>
                      );
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
