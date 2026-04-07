//apps/web/features/plans/components/ai-architect/SyllabusReview.tsx
import React from "react";
import { RefreshCw, Calendar, ArrowRight } from "lucide-react";
// ✅ FIX: Import global types to ensure compatibility with useAIArchitect
import { SyllabusData, SyllabusModule } from "@/types/plan";

interface Props {
  syllabus: SyllabusData;
  onApprove: (data: SyllabusData) => void;
  onRegenerateModule: (index: number, module: SyllabusModule) => void;
  isLoading: boolean;
}

export const SyllabusReview = ({ syllabus, onApprove, onRegenerateModule, isLoading }: Props) => {
  return (
    <div className="transform-gpu space-y-6 max-w-3xl mx-auto pb-10">
      <div className="transform-gpu flex items-center justify-between">
        <div>
            <h2 className="transform-gpu text-xl font-bold text-slate-800">{syllabus.title}</h2>
            <p className="transform-gpu text-sm text-slate-500">Total Duration: {syllabus.totalDays} Days</p>
        </div>
        <button 
            onClick={() => onApprove(syllabus)}
            disabled={isLoading}
            className="transform-gpu px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
        >
            Generate Tasks <ArrowRight size={16} />
        </button>
      </div>

      <div className="transform-gpu space-y-4">
        {syllabus.modules.map((module, idx) => (
          <div key={idx} className="transform-gpu bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 transition-colors group">
            <div className="transform-gpu flex justify-between items-start mb-3">
                <div className="transform-gpu flex items-center gap-3">
                    <div className="transform-gpu w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                    </div>
                    <div>
                        <h3 className="transform-gpu font-bold text-slate-800">{module.title}</h3>
                        <div className="transform-gpu flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <Calendar size={12} /> {module.duration}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => onRegenerateModule(idx, module)}
                    className="transform-gpu p-2 text-slate-300 hover:text-indigo-600 rounded-full hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Regenerate Module"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="transform-gpu pl-11">
                <ul className="transform-gpu space-y-1.5">
                    {module.topics.map((topic, tIdx) => (
                        <li key={tIdx} className="transform-gpu text-sm text-slate-600 flex items-start gap-2">
                            <div className="transform-gpu mt-1.5 w-1 h-1 bg-slate-400 rounded-full shrink-0" />
                            {/* Topics are now guaranteed strings by the normalizer */}
                            <span>{topic}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};