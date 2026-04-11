import React from "react";

export default function Loading() {
  return (
    <div className="transform-gpu space-y-8 animate-pulse bg-[var(--bg-primary)] min-h-screen p-8">
      {/* Header Skeleton */}
      <div className="transform-gpu flex justify-between items-end">
        <div className="transform-gpu space-y-3">
          <div className="transform-gpu h-10 w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl"></div>
          <div className="transform-gpu h-5 w-40 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl"></div>
        </div>
        <div className="transform-gpu h-9 w-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="transform-gpu grid grid-cols-1 md:grid-cols-4 gap-6 h-125">
        <div className="transform-gpu md:col-span-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[3rem]"></div>
        <div className="transform-gpu md:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem]"></div>
        <div className="transform-gpu md:col-span-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[3rem]"></div>
      </div>
    </div>
  );
}