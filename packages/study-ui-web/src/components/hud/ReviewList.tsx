"use client";

import { History, ArrowRight, Brain } from 'lucide-react';
import { DashboardData } from '@planner/study-core';
import { useStudyUI } from '../../context/StudyUIContext';

interface ReviewListProps {
  revisions: DashboardData['dueRevisions'];
}

export function ReviewList({ revisions }: ReviewListProps) {
  const { renderLink } = useStudyUI();

  return (
    <div className="bg-[#13091a] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl shadow-black flex-1 flex flex-col relative overflow-hidden h-full min-h-[450px]">
      <div className="flex items-center justify-between mb-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 text-rose-500 rounded-xl border border-white/10 shadow-lg">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Next Reviews</h3>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Pending Knowledge Re-Sync</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto scrollbar-none pr-2 relative z-10">
        {revisions && revisions.length > 0 ? (
          revisions.map((unit, index) => (
            <div key={`${unit.id}-${index}`}>
              {renderLink({
                href: `/dashboard/study/${unit.trackId}/unit/${unit.id}`,
                className: "group block p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 hover:bg-white/[0.08] transition-all duration-500",
                children: (
                  <div className="flex justify-between items-center gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {unit.type === 'REVISION' ? 'Review' : 'Unit'}
                        </span>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] truncate max-w-[150px]">
                          {unit.track.title}
                        </p>
                      </div>
                      <h4 className="text-lg font-black text-white line-clamp-1 group-hover:text-rose-500 transition-colors tracking-tight uppercase">
                        {unit.title}
                      </h4>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-white/20 group-hover:text-rose-500 group-hover:border-rose-500/30 transition-all shrink-0">
                       <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
            <div className="bg-white/5 p-10 rounded-[3rem] mb-8 border border-white/5">
              <Brain size={54} className="text-white/10" />
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2.5">Neural Buffer Empty</p>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] max-w-[220px] leading-relaxed italic">All knowledge modules successfully integrated into long-term memory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
