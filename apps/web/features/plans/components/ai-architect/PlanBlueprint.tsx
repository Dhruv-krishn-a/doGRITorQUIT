"use client";

import React, { useState } from "react";
import { 
  ArrowRight, Calendar, Clock,  
  CheckCircle2, ExternalLink, Target, BookOpen,
  RefreshCw, Loader2, Sparkles, Download
} from "lucide-react";
import { PlanBlueprintData, TaskBlueprint } from "@/types/plan";

// --- Types ---
interface TaskMetadata {
  outcome?: string;
  resources?: Array<string | { title: string; url: string; }>;
}

interface ExtendedTask extends Omit<TaskBlueprint, 'subtasks' | 'resources'> {
  metadata?: TaskMetadata;
  subtasks?: Array<string | { title: string }>;
  resources?: Array<string | { title: string; url: string; }>;
}

interface Props {
  planData: PlanBlueprintData;
  isSaving: boolean;
  isLoading?: boolean;
  onSave: (startDate: string) => void;
  onUpdateTask: (dayIndex: number, taskId: string, field: string, value: string | number) => void;
  onRegenerateDay?: (index: number, task: TaskBlueprint) => void;
  onDownloadICS?: (startDate: string, skipWeekends: boolean) => void;
}

const getSubtaskTitle = (st: string | { title: string }): string => {
  if (!st) return "";
  return typeof st === "string" ? st : st.title;
};

const getResourceData = (res: string | { title: string; url: string }) => {
  if (typeof res === "string") return { title: "Resource", url: res }; 
  return { 
      title: res.title || "Link", 
      url: (res.url && res.url.length > 0) ? res.url : "#" 
  };
};

export const PlanBlueprint = ({ 
  planData, 
  isSaving, 
  isLoading, 
  onSave, 
  onUpdateTask, 
  onRegenerateDay,
  onDownloadICS 
}: Props) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [skipWeekends, setSkipWeekends] = useState(true);

  const isInitializing = isLoading && (!planData.tasks || planData.tasks.length === 0);

  return (
    <div className="transform-gpu space-y-10 max-w-5xl mx-auto pb-24">
      
      {/* Header */}
      <div className="transform-gpu p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm sticky top-0 z-10 backdrop-blur-xl bg-[var(--bg-primary)]/90 flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
            <h1 className="transform-gpu text-3xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">{planData.title}</h1>
            <p className="transform-gpu text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest opacity-60 italic">{planData.description}</p>
            <div className="transform-gpu flex items-center gap-3 mt-4">
                <div className="transform-gpu px-3 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-black uppercase rounded-full border border-[var(--accent-color)]/20 italic flex items-center gap-2">
                    <Sparkles size={12} /> AI Blueprint
                </div>
                <div className="transform-gpu flex items-center gap-2 text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-widest italic opacity-40">
                    <Calendar size={14} />
                    <span>{planData.tasks?.length || 0} Tasks Generated</span>
                </div>
            </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="transform-gpu relative min-h-100 px-2 sm:px-6">
        <div className="transform-gpu absolute left-6.75 sm:left-10.75 top-4 bottom-4 w-0.5 bg-[var(--border-color)] opacity-50" />

        {isInitializing ? (
             <div className="transform-gpu ml-14 p-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[3rem] shadow-inner flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 size={40} className="transform-gpu text-[var(--accent-color)] animate-spin" />
                <p className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] italic">Architecting roadmap...</p>
             </div>
        ) : (
          planData.tasks?.map((rawTask: TaskBlueprint, index: number) => {
            const task = rawTask as unknown as ExtendedTask;
            const outcome = task.outcome || task.metadata?.outcome;
            const resources = task.resources || task.metadata?.resources;

            return (
            <div key={index} className="transform-gpu relative pl-14 sm:pl-20 pb-12 group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="transform-gpu absolute left-4.75 sm:left-8.75 top-2 w-4 h-4 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)] z-10" />

                <div className="transform-gpu bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-sm hover:border-[var(--accent-color)]/30 transition-all overflow-hidden hover:shadow-xl">
                    <div className="transform-gpu p-8 border-b border-[var(--border-color)]/30">
                        <div className="transform-gpu flex justify-between items-start mb-4">
                            <div className="transform-gpu flex gap-3">
                                <span className="transform-gpu text-[10px] font-black text-[var(--accent-color)] uppercase bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 px-3 py-1 rounded-full italic">
                                Day {task.day}
                                </span>
                                <span className="transform-gpu text-[10px] flex items-center gap-2 text-[var(--text-secondary)] font-bold uppercase tracking-widest bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)] italic">
                                <Clock size={12} /> {task.estimatedMinutes} min
                                </span>
                            </div>
                            {onRegenerateDay && (
                                <button onClick={() => onRegenerateDay(index, rawTask)} className="transform-gpu text-[var(--text-secondary)] hover:text-[var(--accent-color)] p-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-all active:scale-90">
                                    <RefreshCw size={18} />
                                </button>
                            )}
                        </div>

                        <input
                            value={task.title}
                            onChange={(e) => onUpdateTask(index, task.id || "", "title", e.target.value)}
                            className="transform-gpu text-2xl font-black text-[var(--text-primary)] w-full bg-transparent border-none focus:ring-0 p-0 hover:text-[var(--accent-color)] transition-colors mb-2 uppercase italic tracking-tighter outline-none"
                        />
                        <textarea
                            value={task.description || ""}
                            onChange={(e) => onUpdateTask(index, task.id || "", "description", e.target.value)}
                            className="transform-gpu w-full text-sm font-bold text-[var(--text-secondary)] bg-transparent border-none focus:ring-0 p-0 resize-none italic opacity-60 outline-none"
                            rows={2}
                        />
                    </div>

                    <div className="transform-gpu flex flex-col lg:flex-row">
                        {/* Subtasks */}
                        <div className="transform-gpu flex-1 p-8 lg:border-r border-[var(--border-color)]/30">
                            <h4 className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-6 flex items-center gap-3 italic opacity-40">
                                <CheckCircle2 size={16} /> Action Plan
                            </h4>
                            <div className="transform-gpu space-y-4">
                                {task.subtasks?.map((st, i) => (
                                    <div key={i} className="transform-gpu flex items-start gap-4 text-[11px] font-bold text-[var(--text-primary)] uppercase italic tracking-wide">
                                        <div className="transform-gpu mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shrink-0 shadow-[0_0_5px_var(--accent-color)]" />
                                        <span>{getSubtaskTitle(st)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="transform-gpu w-full lg:w-80 bg-[var(--bg-secondary)]/30 p-8 space-y-8">
                            {outcome && (
                                <div>
                                    <h4 className="transform-gpu text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-3 italic opacity-60"><Target size={16} /> Outcome</h4>
                                    <div className="transform-gpu text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-emerald-500/20 p-4 rounded-2xl shadow-sm italic leading-relaxed">{outcome}</div>
                                </div>
                            )}
                            {resources && resources.length > 0 && (
                                <div>
                                    <h4 className="transform-gpu text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3 italic opacity-60"><BookOpen size={16} /> Resources</h4>
                                    <div className="transform-gpu space-y-3">
                                        {resources.map((res, i) => {
                                            const { title, url } = getResourceData(res);
                                            return (
                                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="transform-gpu flex items-center gap-3 text-[10px] font-black text-[var(--text-secondary)] hover:text-blue-500 transition-all uppercase italic group">
                                                    <div className="p-2 bg-[var(--bg-primary)] rounded-lg group-hover:bg-blue-500/10 border border-[var(--border-color)]">
                                                        <ExternalLink size={12} className="shrink-0 opacity-40" />
                                                    </div>
                                                    <span className="truncate tracking-widest">{title}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          )})
        )}
      </div>

      {/* Footer Controls */}
      <div className="transform-gpu sticky bottom-8 z-20 bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] p-6 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
        
        <div className="transform-gpu flex items-center gap-8">
            <div className="transform-gpu flex items-center gap-4">
                <label className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic opacity-40">Start Date:</label>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="transform-gpu bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs font-black text-[var(--text-primary)] uppercase outline-none focus:border-[var(--accent-color)] transition-all italic shadow-inner" 
                />
            </div>

            <div 
                onClick={() => setSkipWeekends(!skipWeekends)}
                className="transform-gpu flex items-center gap-3 cursor-pointer group select-none"
            >
                <div className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${skipWeekends ? "bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)]" : "bg-[var(--bg-secondary)] border border-[var(--border-color)]"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${skipWeekends ? "translate-x-4" : "translate-x-0"}`} />
                </div>
                <span className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic opacity-60 group-hover:opacity-100 transition-opacity">Skip Weekends</span>
            </div>
        </div>

        <div className="transform-gpu flex gap-4 w-full sm:w-auto">
            {onDownloadICS && (
                <button 
                    onClick={() => onDownloadICS(startDate, skipWeekends)} 
                    disabled={isSaving} 
                    className="transform-gpu flex-1 sm:flex-none px-6 py-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-2xl text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] hover:border-[var(--accent-color)]/30 transition-all flex items-center justify-center gap-3 active:scale-95 italic"
                >
                    <Download size={18} /> ICS
                </button>
            )}
            <button 
                onClick={() => onSave(startDate)} 
                disabled={isSaving} 
                className="transform-gpu flex-1 sm:flex-none px-10 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-[var(--accent-color)]/20 active:scale-95 italic"
            >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <>Save Plan <ArrowRight size={18} /></>}
            </button>
        </div>
      </div>
    </div>
  );
};
