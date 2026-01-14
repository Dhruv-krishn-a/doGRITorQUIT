// apps/web/app/dashboard/analytics/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
        <div className="h-6 w-32 bg-slate-200 rounded-full hidden sm:block"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-xl border border-slate-300"></div>
        ))}
      </div>

      {/* Main Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart Skeleton */}
        <div className="h-96 bg-slate-200 rounded-xl border border-slate-300"></div>
        
        {/* Line Chart Skeleton */}
        <div className="h-96 bg-slate-200 rounded-xl border border-slate-300"></div>
      </div>

      {/* Bottom Row Skeleton (Pie Chart + Habits) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 bg-slate-200 rounded-xl border border-slate-300"></div>
        <div className="h-80 bg-slate-200 rounded-xl border border-slate-300"></div>
      </div>
    </div>
  );
}