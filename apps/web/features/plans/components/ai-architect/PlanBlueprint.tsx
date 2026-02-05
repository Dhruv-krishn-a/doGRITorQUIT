import React, { useState } from "react";
import { 
  ArrowRight, Calendar, Clock, AlertCircle, 
  CheckCircle2, ExternalLink, Target, BookOpen,
  RefreshCw, Loader2, Sparkles, Download
} from "lucide-react";
import { PlanBlueprintData, TaskBlueprint } from "@/types/plan";

interface Props {
  planData: PlanBlueprintData;
  isSaving: boolean;
  isLoading?: boolean;
  onSave: (startDate: string) => void;
  onUpdateTask: (dayIndex: number, taskId: string, field: string, value: string | number) => void;
  onRegenerateDay?: (index: number, task: TaskBlueprint) => void;
  onDownloadICS?: (startDate: string, skipWeekends: boolean) => void;
}

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
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      
      {/* Header Summary */}
      <div className="p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10 backdrop-blur-xl bg-white/90 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{planData.title}</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                {planData.description}
                {isLoading && <span className="text-indigo-600 font-medium text-xs animate-pulse">• Building...</span>}
            </p>
          </div>
          <div className={`px-3 py-1 text-xs font-bold uppercase rounded-full flex items-center gap-1 ${isLoading ? "bg-indigo-50 text-indigo-600" : "bg-indigo-100 text-indigo-700"}`}>
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Architect
          </div>
        </div>
        <div className="flex gap-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
             <Calendar size={18} className="text-indigo-500" />
             <span className="font-medium">{planData.tasks?.length || 0} Days Generated</span>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="relative min-h-75">
        <div className="absolute left-4.75 top-4 bottom-4 w-0.5 bg-slate-200" />

        {isInitializing ? (
             <div className="ml-10 p-12 border border-indigo-100 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                    <Loader2 size={32} className="text-indigo-600 animate-spin" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Laying Foundation...</h3>
                    <p className="text-slate-500 text-sm mt-1">Architecting the first phase of your roadmap.</p>
                </div>
             </div>
        ) : planData.tasks && planData.tasks.length > 0 ? (
          <>
            {planData.tasks.map((task: TaskBlueprint, index: number) => (
                <div key={index} className="relative pl-10 pb-10 group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute left-2.75 top-1 w-4 h-4 rounded-full border-2 border-white bg-indigo-600 shadow-sm z-10 group-hover:scale-125 transition-transform" />

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-indigo-300 overflow-hidden">
                    
                    <div className="p-6 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                            Day {task.day}
                            </span>
                            <span className="text-xs flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                            <Clock size={12} /> {task.estimatedMinutes} min
                            </span>
                        </div>

                        {onRegenerateDay && (
                            <button 
                                onClick={() => onRegenerateDay(index, task)}
                                className="text-slate-300 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-slate-50"
                                title="Regenerate this task"
                            >
                                <RefreshCw size={16} />
                            </button>
                        )}
                    </div>

                    <input
                        value={task.title}
                        onChange={(e) => onUpdateTask(index, task.id || "", "title", e.target.value)}
                        className="text-xl font-bold text-slate-900 w-full bg-transparent border-none focus:ring-0 p-0 hover:text-indigo-700 transition-colors placeholder:text-slate-300 mb-2"
                        placeholder="Task Title"
                    />
                    
                    <textarea
                        value={task.description || ""}
                        onChange={(e) => onUpdateTask(index, task.id || "", "description", e.target.value)}
                        className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 p-0 resize-none leading-relaxed"
                        rows={2}
                        placeholder="Brief description..."
                    />
                    </div>

                    <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-6 md:border-r border-slate-50">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <CheckCircle2 size={14} /> Action Plan
                            </h4>
                            <div className="space-y-3">
                                {task.subtasks?.map((st, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm text-slate-700 hover:bg-slate-50 p-2 rounded-lg -ml-2 transition-colors">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <span>{st}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full md:w-72 bg-slate-50/50 p-6 space-y-6">
                            {task.outcome && (
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-2">
                                        <Target size={14} /> Outcome
                                    </h4>
                                    <div className="text-xs text-slate-600 leading-snug bg-white border border-emerald-100/50 p-3 rounded-lg shadow-xs">
                                        {task.outcome}
                                    </div>
                                </div>
                            )}

                            {task.resources && task.resources.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-2">
                                        <BookOpen size={14} /> Resources
                                    </h4>
                                    <div className="space-y-2">
                                        {task.resources.map((res, i) => (
                                            <a 
                                                key={i} 
                                                href={res} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 hover:underline transition-colors"
                                            >
                                                <ExternalLink size={10} className="shrink-0 text-slate-400" />
                                                <span className="truncate">{res.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            ))}
            
            {isLoading && (
                <div className="ml-10 p-6 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl animate-pulse flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-indigo-500" />
                    <span className="text-indigo-700 font-medium">Architecting next batch...</span>
                </div>
            )}
          </>
        ) : (
             <div className="ml-10 p-6 border-2 border-dashed border-rose-200 bg-rose-50 rounded-xl">
                <div className="flex items-center gap-2 text-rose-700 font-bold mb-1">
                <AlertCircle size={20} /> Generation Error
                </div>
                <p className="text-rose-600 text-sm">No tasks were generated. Please reset and try again.</p>
             </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="sticky bottom-6 z-20 bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Date & Settings Group */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ✅ Weekends Toggle */}
          <div 
            onClick={() => setSkipWeekends(!skipWeekends)}
            className="flex items-center gap-2 cursor-pointer group select-none"
            title="If checked, tasks will not be scheduled on Saturdays or Sundays"
          >
            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${skipWeekends ? "bg-indigo-600" : "bg-slate-300"}`}>
               <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${skipWeekends ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <span className={`text-xs font-bold uppercase transition-colors ${skipWeekends ? "text-indigo-700" : "text-slate-500"}`}>
               Skip Weekends
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
            {onDownloadICS && (
                <button
                    onClick={() => onDownloadICS(startDate, skipWeekends)}
                    disabled={isSaving || !planData.tasks?.length || isLoading}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <Download size={16} /> <span className="hidden sm:inline">Export .ICS</span>
                </button>
            )}

            <button
                onClick={() => onSave(startDate)}
                disabled={isSaving || !planData.tasks?.length || isLoading}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
                {isSaving ? "Creating..." : "Save to Account"} <ArrowRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};