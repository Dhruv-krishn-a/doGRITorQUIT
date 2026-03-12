import React from "react";

export default function Loading() {
  return (
    <div className="transform-gpu space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="transform-gpu flex justify-between items-end">
        <div className="transform-gpu space-y-3">
          <div className="transform-gpu h-10 w-64 bg-slate-200 rounded-2xl"></div>
          <div className="transform-gpu h-5 w-40 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="transform-gpu h-9 w-32 bg-slate-100 rounded-full"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="transform-gpu grid grid-cols-1 md:grid-cols-4 gap-6 h-125">
        <div className="transform-gpu md:col-span-1 bg-slate-200 rounded-4xl"></div>
        <div className="transform-gpu md:col-span-2 bg-slate-100 rounded-4xl border border-slate-200"></div>
        <div className="transform-gpu md:col-span-1 bg-slate-100 rounded-4xl border border-slate-200"></div>
      </div>
    </div>
  );
}