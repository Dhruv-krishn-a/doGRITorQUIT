import React, { useState } from"react";
import { 
 ArrowRight, Calendar, Clock, 
 CheckCircle2, ExternalLink, Target, BookOpen,
 RefreshCw, Loader2, Sparkles, Download
} from"lucide-react";
import { PlanBlueprintData, TaskBlueprint } from"../../../../types/plan";

// --- Types ---
interface TaskMetadata {
 outcome?: string;
 resources?: Array<string | { title: string; url: string; }>;
}

// Omit conflicting fields to safely redefine them
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

// --- Helper: Safely Render Mixed Data ---
const getSubtaskTitle = (st: string | { title: string }): string => {
 if (!st) return"";
 return typeof st ==="string" ? st : st.title;
};

const getResourceData = (res: string | { title: string; url: string }) => {
 if (typeof res ==="string") {
  // Basic url parsing fallback
  return { title:"Resource", url: res }; 
 }
 // ✅ FIX: Ensure URL is not empty to prevent ERR_INVALID_URL
 return { 
   title: res.title ||"Link", 
   url: (res.url && res.url.length > 0) ? res.url :"#" 
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
  <div className="space-y-8 max-w-5xl mx-auto pb-10">
   
   {/* Header */}
   <div className="p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/90">
    <div className="flex justify-between items-start mb-4">
     <div>
      <h1 className="text-2xl font-bold text-slate-900">{planData.title}</h1>
      <p className="text-slate-500 text-sm mt-1">{planData.description}</p>
     </div>
     <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-full flex items-center gap-1">
      <Sparkles size={12} /> AI Architect
     </div>
    </div>
    <div className="flex items-center gap-2 text-slate-600 font-medium">
       <Calendar size={16} className="text-indigo-500" />
       <span>{planData.tasks?.length || 0} Tasks Generated</span>
    </div>
   </div>

   {/* Timeline */}
   <div className="relative min-h-100">
    <div className="absolute left-4.75 top-4 bottom-4 w-0.5 bg-slate-200" />

    {isInitializing ? (
       <div className="ml-10 p-10 border border-indigo-100 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Architecting roadmap...</p>
       </div>
    ) : (
     planData.tasks?.map((rawTask: TaskBlueprint, index: number) => {
      // Cast to ExtendedTask to handle metadata
      const task = rawTask as unknown as ExtendedTask;
      const outcome = task.outcome || task.metadata?.outcome;
      const resources = task.resources || task.metadata?.resources;

      return (
      <div key={index} className="relative pl-10 pb-10 group animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="absolute left-2.75 top-1 w-4 h-4 rounded-full border-2 border-white bg-indigo-600 shadow-sm z-10" />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">
                Day {task.day}
                </span>
                <span className="text-xs flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                <Clock size={12} /> {task.estimatedMinutes} min
                </span>
              </div>
              {onRegenerateDay && (
                <button onClick={() => onRegenerateDay(index, rawTask)} className="text-slate-300 hover:text-indigo-600 p-1">
                  <RefreshCw size={16} />
                </button>
              )}
            </div>

            <input
              value={task.title}
              onChange={(e) => onUpdateTask(index, task.id ||"","title", e.target.value)}
              className="text-xl font-bold text-slate-900 w-full bg-transparent border-none focus:ring-0 p-0 hover:text-indigo-700 transition-colors mb-2"
            />
            <textarea
              value={task.description ||""}
              onChange={(e) => onUpdateTask(index, task.id ||"","description", e.target.value)}
              className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 p-0 resize-none"
              rows={2}
            />
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Subtasks */}
            <div className="flex-1 p-6 md:border-r border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <CheckCircle2 size={14} /> Action Plan
              </h4>
              <div className="space-y-3">
                {task.subtasks?.map((st, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span>{getSubtaskTitle(st)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="w-full md:w-72 bg-slate-50/50 p-6 space-y-6">
              {outcome && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-2"><Target size={14} /> Outcome</h4>
                  <div className="text-xs text-slate-600 bg-white border border-emerald-100/50 p-3 rounded-lg shadow-xs">{outcome}</div>
                </div>
              )}
              {resources && resources.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-2"><BookOpen size={14} /> Resources</h4>
                  <div className="space-y-2">
                    {resources.map((res, i) => {
                      const { title, url } = getResourceData(res);
                      return (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 hover:underline">
                          <ExternalLink size={10} className="shrink-0 text-slate-400" />
                          <span className="truncate">{title}</span>
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

   {/* Footer */}
   <div className="sticky bottom-6 z-20 bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
    
    {/* Date & Weekends Controls */}
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-slate-500 uppercase">Start:</label>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
          className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" 
        />
      </div>

      {/* ✅ FIXED: Added Weekends Toggle to use setSkipWeekends */}
      <div 
        onClick={() => setSkipWeekends(!skipWeekends)}
        className="flex items-center gap-2 cursor-pointer group select-none"
      >
        <div className={`w-8 h-5 rounded-full p-0.5 transition-colors duration-200 ${skipWeekends ?"bg-indigo-600" :"bg-slate-300"}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${skipWeekends ?"translate-x-3" :"translate-x-0"}`} />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase">Skip Weekends</span>
      </div>
    </div>

    <div className="flex gap-2 w-full sm:w-auto">
      {onDownloadICS && (
        <button 
          onClick={() => onDownloadICS(startDate, skipWeekends)} 
          disabled={isSaving} 
          className="flex-1 sm:flex-none px-4 py-2 border rounded-lg text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          <Download size={16} /> ICS
        </button>
      )}
      <button 
        onClick={() => onSave(startDate)} 
        disabled={isSaving} 
        className="flex-1 sm:flex-none px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-md"
      >
        {isSaving ?"Saving..." :"Save Plan"} <ArrowRight size={16} />
      </button>
    </div>
   </div>
  </div>
 );
};