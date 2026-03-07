// packages/study-ui-web/src/components/today/PulsePanel.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  BarChart3, 
  Layout, 
  Sparkles,
  Play
} from 'lucide-react';

interface PulsePanelProps {
  data: {
    breakdown: {
      work: number;
      study: number;
      media: number;
    };
    remaining: {
      tasks: number;
      study: number;
    };
    recommended?: any;
  };
  onStart: (id: string, type: string) => void;
}

export function PulsePanel({ data, onStart }: PulsePanelProps) {
  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col gap-6 sticky top-8 h-fit">
      
      {/* Breakdown Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-rose-100/50 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">
          <BarChart3 size={14} className="text-rose-500" />
          Today's Breakdown
        </div>
        <div className="space-y-4">
          {[
            { label: 'Work Execution', value: data.breakdown.work, color: 'bg-indigo-500' },
            { label: 'Deep Study', value: data.breakdown.study, color: 'bg-rose-500' },
            { label: 'Media/Video', value: data.breakdown.media, color: 'bg-pink-500' }
          ].map(item => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{item.label}</span>
                <span className="text-slate-800">{formatTime(item.value)}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (item.value / 480) * 100)}%` }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remaining Plan */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
          <Layout size={14} className="text-indigo-400" />
          Remaining Execution
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tasks</div>
            <div className="text-2xl font-black text-white">{data.remaining.tasks}</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Study</div>
            <div className="text-2xl font-black text-white">{data.remaining.study}</div>
          </div>
        </div>
      </div>

      {/* Recommended Next */}
      {data.recommended && (
        <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-white/10 rounded-full blur-[40px] group-hover:bg-white/20 transition-all duration-700" />
          
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-rose-100 mb-6 relative z-10">
            <Sparkles size={14} className="text-white animate-pulse" />
            Next Recommendation
          </div>
          
          <div className="relative z-10 mb-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-rose-200 mb-1">{data.recommended.vectorName}</div>
            <h3 className="text-xl font-black tracking-tight leading-tight">{data.recommended.title}</h3>
            <div className="mt-2 text-[10px] font-bold text-rose-100">Estimated: {data.recommended.duration}m</div>
          </div>

          <button 
            onClick={() => onStart(data.recommended.id, data.recommended.type)}
            className="w-full py-4 bg-white text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10"
          >
            <Play size={12} fill="currentColor" />
            Start Focus Session
          </button>
        </div>
      )}

    </div>
  );
}
