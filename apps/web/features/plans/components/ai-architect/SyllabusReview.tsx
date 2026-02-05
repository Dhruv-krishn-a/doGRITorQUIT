// apps/web/features/plans/components/ai-architect/SyllabusReview.tsx
import React, { useState, useEffect, useMemo } from "react";
import { ChevronRight, BookOpen, Trash2, Plus, GripVertical, RefreshCw, AlertCircle } from "lucide-react";
import { SyllabusData, SyllabusModule } from "@/types/plan";

interface Props {
  syllabus: SyllabusData;
  onApprove: (finalSyllabus: SyllabusData) => void;
  onRegenerateModule: (index: number, module: SyllabusModule) => Promise<SyllabusModule>;
  isLoading: boolean;
}

export const SyllabusReview = ({ syllabus, onApprove, onRegenerateModule, isLoading }: Props) => {
  const [data, setData] = useState<SyllabusData>(syllabus);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (syllabus) setData(syllabus);
  }, [syllabus]);

  const safeModules = useMemo(() => data.modules || [], [data.modules]);

  const getDaysCount = (durationStr: string | number | undefined) => {
    if (!durationStr) return 1;
    const match = String(durationStr).match(/(\d+)/);
    return match ? parseInt(match[0]) : 1;
  };

  const totalDuration = useMemo(() => {
    return safeModules.reduce((acc, mod) => acc + getDaysCount(mod.duration), 0);
  }, [safeModules]);

  const updateModule = (index: number, field: keyof SyllabusModule, value: string | string[]) => {
    const newModules = [...safeModules];
    (newModules[index] as unknown as Record<string, unknown>)[field] = value;
    setData({ ...data, modules: newModules });
  };

  const deleteModule = (index: number) => {
    const newModules = safeModules.filter((_, i) => i !== index);
    setData({ ...data, modules: newModules });
  };

  const addModule = () => {
    setData({
      ...data,
      modules: [
        ...safeModules,
        { title: "New Module", topics: ["Topic 1"], duration: "1 day" }
      ]
    });
  };

  const handleRegenerateClick = async (index: number) => {
    setRegeneratingIndex(index);
    try {
      const newModule = await onRegenerateModule(index, safeModules[index]);
      if (newModule) {
          const newModules = [...safeModules];
          newModules[index] = newModule;
          setData({ ...data, modules: newModules });
      }
    } catch {
      alert("Failed to regenerate module");
    } finally {
      setRegeneratingIndex(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
         <div>
            <h3 className="text-lg font-bold text-slate-900">Course Outline</h3>
            <p className="text-sm text-slate-500">
                Total Duration: <strong className="text-indigo-600">{totalDuration} Days</strong>
            </p>
         </div>
         <button onClick={addModule} className="text-sm flex items-center gap-1 text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
           <Plus size={16} /> Add Module
         </button>
      </div>

      <div className="space-y-4">
        {safeModules.length > 0 ? (
          safeModules.map((mod, i) => {
            const daysCount = getDaysCount(mod.duration);
            const isRegenerating = regeneratingIndex === i;
            
            const durationOptions = Array.from(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, daysCount]))
                .sort((a,b) => a - b);

            return (
              <div key={i} className={`group relative bg-white border rounded-xl p-5 transition-all shadow-sm ${isRegenerating ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                
                <div className="flex gap-4 mb-4">
                  <div className="mt-1 text-slate-300 cursor-move">
                     <GripVertical size={20} />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                     <input
                       value={mod.title}
                       onChange={(e) => updateModule(i, "title", e.target.value)}
                       className="w-full font-bold text-lg text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none bg-transparent transition-colors placeholder:text-slate-300"
                       placeholder="Module Title"
                       disabled={isRegenerating}
                     />
                     <textarea
                       // ✅ Robust check for topics
                       value={Array.isArray(mod.topics) ? mod.topics.join(", ") : (mod.topics || "")}
                       onChange={(e) => updateModule(i, "topics", e.target.value.split(",").map(s => s.trim()))}
                       className="w-full text-sm text-slate-600 bg-slate-50 rounded-lg p-2 border border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none resize-none"
                       rows={2}
                       placeholder="Topics covered (e.g. Hooks, Context, State)..."
                       disabled={isRegenerating}
                     />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                     <div className="flex items-center gap-2">
                        {/* ✅ Fixed Select Styling */}
                        <select
                          value={daysCount}
                          onChange={(e) => updateModule(i, "duration", `${e.target.value} days`)}
                          className="text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2 py-1 focus:outline-none cursor-pointer hover:bg-indigo-100 transition-colors"
                          disabled={isRegenerating}
                        >
                          {durationOptions.map(d => (
                              <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                     </div>
                     
                     <div className="flex gap-1">
                        <button 
                            onClick={() => handleRegenerateClick(i)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Regenerate"
                            disabled={isRegenerating}
                        >
                            <RefreshCw size={16} className={isRegenerating ? "animate-spin text-indigo-600" : ""} />
                        </button>
                        <button 
                            onClick={() => deleteModule(i)} 
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                            title="Remove"
                            disabled={isRegenerating}
                        >
                            <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                </div>

                <div className="pl-9">
                   <div className="flex gap-2 flex-wrap">
                      {Array.from({ length: daysCount }).map((_, dIndex) => (
                         <div key={dIndex} className="bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-500 flex items-center justify-center min-w-17.5">
                            Day {dIndex + 1}
                         </div>
                      ))}
                   </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 border border-amber-200 bg-amber-50 rounded-xl flex items-start gap-4 text-amber-900">
             <AlertCircle size={20} className="text-amber-600 mt-1" />
             <p className="text-sm font-bold">Structure Incomplete</p>
             <button onClick={addModule} className="px-4 py-2 mt-2 bg-white border border-amber-200 text-amber-700 font-bold rounded-lg shadow-sm text-sm">
                 + Add Module
             </button>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
         <BookOpen className="text-indigo-600 mt-0.5" size={18} />
         <div className="text-sm text-indigo-800">
            <span className="font-bold">Next Step:</span> Generate {totalDuration} daily tasks based on these modules.
         </div>
      </div>

      <button
        onClick={() => onApprove(data)}
        disabled={isLoading || safeModules.length === 0}
        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-200"
      >
        {isLoading ? "Generating Daywise Plan..." : "Generate Daywise Plan"}
        {!isLoading && <ChevronRight size={16} />}
      </button>
    </div>
  );
};