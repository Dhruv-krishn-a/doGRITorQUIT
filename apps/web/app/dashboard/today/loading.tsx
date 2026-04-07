// apps/web/app/dashboard/tasks/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="transform-gpu max-w-5xl mx-auto p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="transform-gpu flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="transform-gpu space-y-2">
          <div className="transform-gpu h-8 w-48 bg-slate-200 rounded"></div>
          <div className="transform-gpu h-4 w-64 bg-slate-200 rounded"></div>
        </div>
        <div className="transform-gpu h-10 w-80 bg-slate-200 rounded"></div>
      </div>

      {/* Task List Skeleton */}
      <div className="transform-gpu space-y-8">
        {[1, 2].map(i => (
          <div key={i}>
             <div className="transform-gpu flex items-center gap-2 mb-3">
               <div className="transform-gpu h-4 w-20 bg-slate-200 rounded"></div>
               <div className="transform-gpu h-px bg-slate-200 flex-1"></div>
             </div>
             <div className="transform-gpu grid gap-3">
               {[1, 2, 3].map(j => (
                 <div key={j} className="transform-gpu h-20 bg-slate-100 rounded-xl border border-slate-200"></div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}