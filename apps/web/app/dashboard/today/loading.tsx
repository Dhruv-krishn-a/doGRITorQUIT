// apps/web/app/dashboard/tasks/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="transform-gpu max-w-5xl mx-auto p-6 animate-pulse bg-[var(--bg-primary)] min-h-screen">
      {/* Header Skeleton */}
      <div className="transform-gpu flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="transform-gpu space-y-2">
          <div className="transform-gpu h-8 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded"></div>
          <div className="transform-gpu h-4 w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded"></div>
        </div>
        <div className="transform-gpu h-10 w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded"></div>
      </div>

      {/* Task List Skeleton */}
      <div className="transform-gpu space-y-8">
        {[1, 2].map(i => (
          <div key={i}>
             <div className="transform-gpu flex items-center gap-2 mb-3">
               <div className="transform-gpu h-4 w-20 bg-[var(--bg-secondary)] rounded"></div>
               <div className="transform-gpu h-px bg-[var(--border-color)] flex-1"></div>
             </div>
             <div className="transform-gpu grid gap-3">
               {[1, 2, 3].map(j => (
                 <div key={j} className="transform-gpu h-20 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm"></div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}