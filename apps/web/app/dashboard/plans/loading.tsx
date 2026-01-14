// apps/web/app/dashboard/plans/loading.tsx
import React from "react";

export default function PlansLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-3">
             <div className="h-10 w-32 bg-gray-200 rounded" />
             <div className="h-10 w-32 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl h-64 border border-gray-200 p-6">
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-8" />
              <div className="mt-auto pt-8 border-t border-gray-100 flex gap-2">
                 <div className="h-8 w-full bg-gray-100 rounded" />
                 <div className="h-8 w-12 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}