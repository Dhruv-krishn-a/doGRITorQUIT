import React from "react";

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-5 w-40 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-9 w-32 bg-slate-100 rounded-full"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="h-64 bg-slate-200 rounded-4xl"></div>
        {/* Card 2 */}
        <div className="h-64 bg-slate-100 rounded-4xl border border-slate-200"></div>
        {/* Card 3 */}
        <div className="h-64 bg-slate-100 rounded-4xl border border-slate-200"></div>
      </div>

      {/* Large Bottom Skeleton */}
      <div className="h-80 bg-slate-100 rounded-[2.5rem] border border-slate-200"></div>
    </div>
  );
}