"use client";

import React from "react";
import { RefreshCw, Calendar, ArrowRight } from "lucide-react";
import { SyllabusData, SyllabusModule } from "@/types/plan";

interface Props {
  syllabus: SyllabusData;
  onApprove: (data: SyllabusData) => void;
  onRegenerateModule: (index: number, module: SyllabusModule) => void;
  isLoading: boolean;
}

export const SyllabusReview = ({ syllabus, onApprove, onRegenerateModule, isLoading }: Props) => {
  return (
    <div className="transform-gpu space-y-10 max-w-4xl mx-auto pb-20">
      <div className="transform-gpu flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm">
        <div>
            <h2 className="transform-gpu text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">{syllabus.title}</h2>
            <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-black uppercase rounded-full border border-[var(--accent-color)]/20 italic">Syllabus Outline</span>
                <p className="transform-gpu text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] opacity-60">Total Duration: {syllabus.totalDays} Days</p>
            </div>
        </div>
        <button 
            onClick={() => onApprove(syllabus)}
            disabled={isLoading}
            className="transform-gpu px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all active:scale-95 italic"
        >
            Generate Tasks <ArrowRight size={16} />
        </button>
      </div>

      <div className="transform-gpu space-y-6">
        {syllabus.modules.map((module, idx) => (
          <div key={idx} className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 hover:border-[var(--accent-color)]/30 transition-all group shadow-sm hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--accent-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="transform-gpu relative z-10">
                <div className="transform-gpu flex justify-between items-start mb-6">
                    <div className="transform-gpu flex items-center gap-4">
                        <div className="transform-gpu w-12 h-12 bg-[var(--bg-secondary)] text-[var(--accent-color)] rounded-2xl flex items-center justify-center font-black text-lg border border-[var(--border-color)] shadow-inner italic">
                            {idx + 1}
                        </div>
                        <div>
                            <h3 className="transform-gpu font-black text-xl text-[var(--text-primary)] uppercase italic tracking-tight">{module.title}</h3>
                            <div className="transform-gpu flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1 opacity-60 italic">
                                <Calendar size={12} /> {module.duration}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => onRegenerateModule(idx, module)}
                        className="transform-gpu p-3 text-[var(--text-secondary)] hover:text-[var(--accent-color)] rounded-xl hover:bg-[var(--bg-secondary)] transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-[var(--border-color)] shadow-sm"
                        title="Regenerate Module"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                <div className="transform-gpu pl-16">
                    <ul className="transform-gpu space-y-3">
                        {module.topics.map((topic, tIdx) => (
                            <li key={tIdx} className="transform-gpu text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-wide flex items-start gap-3 italic">
                                <div className="transform-gpu mt-1.5 w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full shrink-0 shadow-[0_0_8px_var(--accent-color)]" />
                                <span>{topic}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
