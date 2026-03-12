// packages/dashboard-ui-web/src/components/today/PulsePanel.tsx
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
    <div className="transform-gpu flex flex-col gap-6 sticky top-8 h-fit">
      
      {/* Breakdown Card */}
      <div className="transform-gpu bg-white/90 backdrop-blur-xl border border-rose-100/50 rounded-[2.5rem] p-8 shadow-sm transform-gpu">
        <div className="transform-gpu flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-6">
          <BarChart3 size={14} className="transform-gpu text-rose-500" />
          Today's Breakdown
        </div>
        <div className="transform-gpu space-y-4">
          {[
            { label: 'Work Execution', value: data.breakdown.work, color: 'bg-indigo-500' },
            { label: 'Deep Study', value: data.breakdown.study, color: 'bg-rose-500' },
            { label: 'Media/Video', value: data.breakdown.media, color: 'bg-pink-500' }
          ].map(item => (
            <div key={item.label} className="transform-gpu space-y-2">
              <div className="transform-gpu flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest">
                <span className="transform-gpu text-slate-500">{item.label}</span>
                <span className="transform-gpu text-slate-800">{formatTime(item.value)}</span>
              </div>
              <div className="transform-gpu h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (item.value / 480) * 100)}%` }}
                  className={`h-full ${item.color} rounded-full transform-gpu`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remaining Plan */}
      <div className="transform-gpu bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
        <div className="transform-gpu flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 mb-6">
          <Layout size={14} className="transform-gpu text-indigo-400" />
          Remaining Execution
        </div>
        <div className="transform-gpu grid grid-cols-2 gap-4">
          <div className="transform-gpu p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="transform-gpu text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Tasks</div>
            <div className="transform-gpu text-2xl font-bold text-white">{data.remaining.tasks}</div>
          </div>
          <div className="transform-gpu p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="transform-gpu text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Study</div>
            <div className="transform-gpu text-2xl font-bold text-white">{data.remaining.study}</div>
          </div>
        </div>
      </div>

      {/* Recommended Next */}
      {data.recommended && (
        <div className="transform-gpu bg-gradient-to-br from-rose-500 to-pink-500 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group transform-gpu">
          <div className="transform-gpu absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-white/10 rounded-full blur-[40px] group-hover:bg-white/20 transition-all duration-700 transform-gpu" />
          
          <div className="transform-gpu flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-100 mb-6 relative z-10">
            <Sparkles size={14} className="transform-gpu text-white animate-pulse" />
            Next Recommendation
          </div>
          
          <div className="transform-gpu relative z-10 mb-6">
            <div className="transform-gpu text-[10px] font-semibold uppercase tracking-widest text-rose-200 mb-1">{data.recommended.vectorName}</div>
            <h3 className="transform-gpu text-xl font-bold tracking-tight leading-tight">{data.recommended.title}</h3>
            <div className="transform-gpu mt-2 text-[10px] font-semibold text-rose-100">Estimated: {data.recommended.duration}m</div>
          </div>

          <button 
            onClick={() => onStart(data.recommended.id, data.recommended.type)}
            className="transform-gpu w-full py-4 bg-white text-rose-500 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10"
          >
            <Play size={12} fill="currentColor" />
            Start Focus Session
          </button>
        </div>
      )}

    </div>
  );
}
