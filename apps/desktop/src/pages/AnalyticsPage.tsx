import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="transform-gpu p-8 max-w-6xl mx-auto w-full">
      <div className="transform-gpu mb-8">
        <h1 className="transform-gpu text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <BarChart3 className="transform-gpu text-rose-500" /> Analytics
        </h1>
        <p className="transform-gpu text-lg text-slate-500 mt-2">Track your learning velocity and task completion rates.</p>
      </div>

      <div className="transform-gpu flex flex-col items-center justify-center py-32 bg-white/50 border border-slate-200 rounded-[2.5rem] shadow-sm text-center relative overflow-hidden">
        <div className="transform-gpu absolute inset-0 bg-gradient-to-br from-rose-50/50 to-pink-50/50 -z-10" />
        <div className="transform-gpu bg-white p-5 rounded-3xl mb-6 shadow-md border border-slate-100 relative z-10 animate-bounce">
          <TrendingUp size={36} className="transform-gpu text-rose-500" />
        </div>
        <h3 className="transform-gpu text-2xl font-bold text-slate-900 mb-3 tracking-tight relative z-10">Data Crunching in Progress</h3>
        <p className="transform-gpu text-slate-500 max-w-md font-medium relative z-10">The native Desktop Analytics engine is currently compiling your neural data. Full charts and insights will be available in the next OTA update.</p>
      </div>
    </div>
  );
}
