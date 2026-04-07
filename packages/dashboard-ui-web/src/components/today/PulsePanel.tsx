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
      <div className="transform-gpu bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-color)]/50 rounded-[2.5rem] p-8 shadow-sm transform-gpu">
        <div className="transform-gpu flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-6">
          <BarChart3 size={14} className="transform-gpu text-[var(--accent-color)]" />
          Today's Breakdown
        </div>
        <div className="transform-gpu space-y-4">
          {[
            { label: 'Work Execution', value: data.breakdown.work, color: 'bg-[var(--accent-color)]' },
            { label: 'Deep Study', value: data.breakdown.study, color: 'bg-[var(--accent-color)]/80' },
            { label: 'Media/Video', value: data.breakdown.media, color: 'bg-[var(--accent-color)]/60' }
          ].map(item => (
            <div key={item.label} className="transform-gpu space-y-2">
              <div className="transform-gpu flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest">
                <span className="transform-gpu text-[var(--text-secondary)]">{item.label}</span>
                <span className="transform-gpu text-[var(--text-primary)]">{formatTime(item.value)}</span>
              </div>
              <div className="transform-gpu h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
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
      <div className="transform-gpu bg-[var(--text-primary)] border border-[var(--text-primary)] rounded-[2.5rem] p-8 shadow-xl">
        <div className="transform-gpu flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--bg-primary)]/60 mb-6">
          <Layout size={14} className="transform-gpu text-[var(--accent-color)]" />
          Remaining Execution
        </div>
        <div className="transform-gpu grid grid-cols-2 gap-4">
          <div className="transform-gpu p-4 bg-[var(--bg-primary)]/10 rounded-2xl border border-[var(--bg-primary)]/10">
            <div className="transform-gpu text-[10px] font-semibold text-[var(--bg-primary)]/60 uppercase tracking-widest mb-1">Tasks</div>
            <div className="transform-gpu text-2xl font-bold text-[var(--bg-primary)]">{data.remaining.tasks}</div>
          </div>
          <div className="transform-gpu p-4 bg-[var(--bg-primary)]/10 rounded-2xl border border-[var(--bg-primary)]/10">
            <div className="transform-gpu text-[10px] font-semibold text-[var(--bg-primary)]/60 uppercase tracking-widest mb-1">Study</div>
            <div className="transform-gpu text-2xl font-bold text-[var(--bg-primary)]">{data.remaining.study}</div>
          </div>
        </div>
      </div>

      {/* Recommended Next */}
      {data.recommended && (
        <div className="transform-gpu bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-color)]/80 rounded-[2.5rem] p-8 text-[var(--bg-primary)] shadow-xl relative overflow-hidden group transform-gpu">
          <div className="transform-gpu absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-[var(--bg-primary)]/10 rounded-full blur-[40px] group-hover:bg-[var(--bg-primary)]/20 transition-all duration-700 transform-gpu" />
          
          <div className="transform-gpu flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--bg-primary)]/80 mb-6 relative z-10">
            <Sparkles size={14} className="transform-gpu text-[var(--bg-primary)] animate-pulse" />
            Next Recommendation
          </div>
          
          <div className="transform-gpu relative z-10 mb-6">
            <div className="transform-gpu text-[10px] font-semibold uppercase tracking-widest text-[var(--bg-primary)]/60 mb-1">{data.recommended.vectorName}</div>
            <h3 className="transform-gpu text-xl font-bold tracking-tight leading-tight">{data.recommended.title}</h3>
            <div className="transform-gpu mt-2 text-[10px] font-semibold text-[var(--bg-primary)]/80">Estimated: {data.recommended.duration}m</div>
          </div>

          <button 
            onClick={() => onStart(data.recommended.id, data.recommended.type)}
            className="transform-gpu w-full py-4 bg-[var(--bg-card)] text-[var(--accent-color)] rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:bg-[var(--bg-secondary)] transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10"
          >
            <Play size={12} fill="currentColor" />
            Start Focus Session
          </button>
        </div>
      )}

    </div>
  );
}
