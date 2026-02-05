// apps/web/app/dashboard/plans/loading.tsx
import React from "react";

export default function PlansLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="h-10 w-64 bg-slate-200 rounded-lg" />
            <div className="h-6 w-96 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-12 w-48 bg-slate-200 rounded-xl" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl h-72 border border-slate-100 p-6 flex flex-col justify-between">
              <div>
                 <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-slate-100 rounded-full" />
                    <div className="h-6 w-24 bg-slate-100 rounded-full" />
                 </div>
                 <div className="h-8 w-3/4 bg-slate-200 rounded-lg mb-4" />
                 <div className="flex gap-4">
                    <div className="h-4 w-12 bg-slate-100 rounded" />
                    <div className="h-4 w-12 bg-slate-100 rounded" />
                 </div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between">
                    <div className="h-4 w-10 bg-slate-100 rounded" />
                    <div className="h-4 w-10 bg-slate-100 rounded" />
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full" />
                 <div className="h-10 w-full bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}