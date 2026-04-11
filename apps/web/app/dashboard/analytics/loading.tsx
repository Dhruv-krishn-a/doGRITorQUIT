// apps/web/app/dashboard/analytics/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="transform-gpu max-w-6xl mx-auto p-6 space-y-8 animate-pulse bg-[var(--bg-primary)] min-h-screen">
      {/* Header Skeleton */}
      <div className="transform-gpu flex justify-between items-end">
        <div className="transform-gpu space-y-2">
          <div className="transform-gpu h-8 w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg"></div>
          <div className="transform-gpu h-4 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded"></div>
        </div>
        <div className="transform-gpu h-6 w-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full hidden sm:block"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="transform-gpu h-32 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl"></div>
        ))}
      </div>

      {/* Main Charts Grid Skeleton */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart Skeleton */}
        <div className="transform-gpu h-96 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl"></div>
        
        {/* Line Chart Skeleton */}
        <div className="transform-gpu h-96 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl"></div>
      </div>

      {/* Bottom Row Skeleton (Pie Chart + Habits) */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="transform-gpu h-80 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl"></div>
        <div className="transform-gpu h-80 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-xl"></div>
      </div>
    </div>
  );
}