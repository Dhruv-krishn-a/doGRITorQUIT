"use client";

import React, { useMemo, useEffect, useState } from 'react';

interface SmartTimelineProps {
  blocks: any[];
  onTimeClick?: (minutes: number) => void;
  startHour?: number;
}

export default function SmartTimeline({ blocks = [], onTimeClick, startHour = 23 }: SmartTimelineProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const offsetMins = (startHour || 23) * 60;
  const shiftMinutes = (m: number) => (m - offsetMins + 1440) % 1440;

  const timelineTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 48; i++) {
      const totalMins = i * 30;
      const absMins = (totalMins + offsetMins) % 1440;
      const h = Math.floor(absMins / 60) % 24;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      ticks.push({
        relMins: totalMins,
        isMajor: i % 2 === 0,
        label: i % 2 === 0 ? `${displayH} ${ampm}` : null
      });
    }
    return ticks;
  }, [offsetMins]);

  const processedBlocks = useMemo(() => {
    const result: any[] = [];
    if (!blocks || !Array.isArray(blocks)) return result;
    blocks.forEach(b => {
      const rs = shiftMinutes(b.s);
      const re = shiftMinutes(b.e);
      if (re < rs) {
        result.push({ ...b, rs, re: 1440 });
        result.push({ ...b, rs: 0, re });
      } else {
        result.push({ ...b, rs, re });
      }
    });
    return result;
  }, [blocks, offsetMins]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onTimeClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const clickedRelMins = Math.floor(percentage * 1440);
    const clickedAbsMins = (clickedRelMins + offsetMins) % 1440;
    const roundedMins = Math.round(clickedAbsMins / 30) * 30;
    onTimeClick(roundedMins % 1440);
  };

  return (
    <div 
      className="relative w-full mb-8 overflow-hidden flex items-center shadow-inner group cursor-crosshair" 
      style={{ 
        height: '80px', 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '1.5rem',
        minHeight: '80px'
      }}
      onClick={handleTimelineClick}
    >
      {/* Grid Lines */}
      {timelineTicks.map((tick, i) => (
        <div 
          key={i} 
          className="absolute h-full flex flex-col justify-end pb-2 pl-1.5"
          style={{ 
            left: `${(tick.relMins / 1440) * 100}%`,
            borderLeft: tick.isMajor ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
            opacity: tick.isMajor ? 0.3 : 0.05
          }}
        >
          {tick.label && (
            <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 select-none text-[var(--text-primary)]">
              {tick.label}
            </span>
          )}
        </div>
      ))}

      {/* Blocks */}
      {processedBlocks.map((b, i) => {
        const isSleep = b.title?.toLowerCase().includes('sleep') || b.icon === 'Moon';
        return (
          <div 
            key={`${b.id}-${i}`}
            className="absolute top-0 bottom-0 flex items-center justify-center text-[var(--bg-primary)] group/block transition-all hover:brightness-110"
            style={{ 
              left: `${(b.rs / 1440) * 100}%`, 
              width: `${((b.re - b.rs) / 1440) * 100}%`,
              backgroundColor: 'var(--accent-color)',
              opacity: isSleep ? 0.8 : 0.4,
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="opacity-0 group-hover/block:opacity-100 text-[10px] font-black uppercase tracking-tightest truncate px-2 z-10">
              {b.title}
            </span>
          </div>
        )
      })}

      <CurrentTimeIndicator offsetMins={offsetMins} />
    </div>
  );
}

function CurrentTimeIndicator({ offsetMins }: { offsetMins: number }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const absMins = now.getHours() * 60 + now.getMinutes();
  const relMins = (absMins - offsetMins + 1440) % 1440;

  return (
    <div 
      className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 shadow-lg"
      style={{ left: `${(relMins / 1440) * 100}%` }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full" />
    </div>
  );
}
