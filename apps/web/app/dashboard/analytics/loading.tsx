// apps/web/app/dashboard/analytics/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="transform-gpu max-w-6xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="transform-gpu flex justify-between items-end">
        <div className="transform-gpu space-y-2">
          <div className="transform-gpu h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="transform-gpu h-4 w-48 bg-slate-200 rounded"></div>
        </div>
        <div className="transform-gpu h-6 w-32 bg-slate-200 rounded-full hidden sm:block"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="transform-gpu h-32 bg-slate-200 rounded-xl border border-slate-300"></div>
        ))}
      </div>

      {/* Main Charts Grid Skeleton */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart Skeleton */}
        <div className="transform-gpu h-96 bg-slate-200 rounded-xl border border-slate-300"></div>
        
        {/* Line Chart Skeleton */}
        <div className="transform-gpu h-96 bg-slate-200 rounded-xl border border-slate-300"></div>
      </div>

      {/* Bottom Row Skeleton (Pie Chart + Habits) */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="transform-gpu h-80 bg-slate-200 rounded-xl border border-slate-300"></div>
        <div className="transform-gpu h-80 bg-slate-200 rounded-xl border border-slate-300"></div>
      </div>
    </div>
  );
}