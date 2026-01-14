// apps/web/app/dashboard/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
      </div>

      {/* Tasks Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-4xl"></div>
      </div>
    </div>
  );
}