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
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 md:p-14 shadow-2xl shadow-slate-100/50 flex-1 flex flex-col relative overflow-hidden h-full min-h-[450px]">
      <div className="flex items-center justify-between mb-12 px-2 shrink-0">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
            <History size={22} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Next Reviews</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-1.5">Pending Reviews</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-rose-50 text-rose-600 text-[10px] font-black px-5 py-2.5 rounded-full border border-rose-100 uppercase tracking-widest group-hover:bg-rose-100 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>{revisions?.length || 0} Due Now</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-4 relative z-10">
        {revisions && revisions.length > 0 ? (
          revisions.map((unit, index) => (
            <div key={`${unit.id}-${index}`}>
              {renderLink({
                href: `/dashboard/study/${unit.trackId}/unit/${unit.id}`,
                className: "group block p-7 rounded-3xl bg-slate-50 border border-slate-100 hover:border-rose-200 hover:bg-white hover:shadow-2xl hover:shadow-rose-100/20 transition-all duration-500",
                children: (
                  <div className="flex justify-between items-center gap-8">
                    <div className="min-w-0">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-lg">
                          {unit.type === 'REVISION' ? 'Review' : 'Lesson'}
                        </span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] truncate max-w-[150px]">
                          {unit.track.title}
                        </p>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors tracking-tight">
                        {unit.title}
                      </h4>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 text-slate-300 group-hover:text-rose-500 group-hover:border-rose-100 group-hover:shadow-sm transition-all shrink-0">
                       <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-60">
            <div className="bg-slate-50 p-10 rounded-[3rem] mb-8 border border-slate-100">
              <Brain size={54} className="text-slate-200" />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2.5">All Caught Up</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-[220px] leading-relaxed">No reviews due right now. Great job keeping your knowledge fresh!</p>
          </div>
        )}
      </div>
    </div>
  );
}
