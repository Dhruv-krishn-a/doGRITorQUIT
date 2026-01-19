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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-125">
        <div className="md:col-span-1 bg-slate-200 rounded-4xl"></div>
        <div className="md:col-span-2 bg-slate-100 rounded-4xl border border-slate-200"></div>
        <div className="md:col-span-1 bg-slate-100 rounded-4xl border border-slate-200"></div>
      </div>
    </div>
  );
}