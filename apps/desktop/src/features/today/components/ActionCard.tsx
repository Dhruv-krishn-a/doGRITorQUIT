import React from 'react';
import { Play, CheckCircle2, Youtube, Briefcase, BookOpen, Clock, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TodayActionItem } from '../types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ActionCardProps {
  item: TodayActionItem;
  onComplete: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ item, onComplete }) => {
  const navigate = useNavigate();
  const isDone = item.status === 'DONE';

  const handleStart = () => {
    if (item.type === 'YOUTUBE') {
      navigate(`/study/youtube/${item.metadata.trackId}/unit/${item.id}`);
    } else if (item.type === 'COURSE') {
      navigate(`/study/course/${item.metadata.trackId}/unit/${item.id}`);
    } else if (item.type === 'PROJECT') {
      navigate(`/plans/${item.metadata.planId}`);
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case 'YOUTUBE': return <Youtube size={20} className="text-sky-focus" />;
      case 'COURSE': return <BookOpen size={20} className="text-sky-focus" />;
      case 'PROJECT': return <Briefcase size={20} className="text-mint" />;
      case 'HABIT': return <Zap size={20} className="text-amber" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-500",
        isDone 
          ? "bg-[var(--bg-secondary)]/30 border-[var(--border-color)] opacity-60 grayscale" 
          : "bg-[var(--bg-card)]/30 border-[var(--border-color)] shadow-sm hover:border-[var(--accent-color)]/30 hover:-translate-y-1"
      )}
    >
      {/* Type Indicator Dot */}
      <div className={cn(
        "absolute top-6 left-0 w-1 h-12 rounded-r-full",
        item.type === 'YOUTUBE' && "bg-[var(--accent-color)] shadow-[0_0_8px_rgba(14,165,233,0.5)]",
        item.type === 'COURSE' && "bg-[var(--accent-color)] shadow-[0_0_8px_rgba(14,165,233,0.5)]",
        item.type === 'PROJECT' && "bg-mint shadow-[0_0_8px_rgba(16,185,129,0.5)]",
        item.type === 'HABIT' && "bg-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]",
      )} />

      {/* Main Content */}
      <div className="flex-1 flex items-center gap-6 min-w-0">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 border border-[var(--border-color)] shadow-inner",
          isDone ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-secondary)]"
        )}>
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              {item.type === 'HABIT' ? 'Daily Vector' : item.metadata.trackTitle || item.metadata.planTitle}
            </span>
            {item.priority === 'HIGH' && !isDone && (
              <span className="flex items-center gap-1 bg-rose-500/10 text-rose-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-rose-500/20">
                CRITICAL
              </span>
            )}
          </div>
          <h3 className={cn(
            "text-lg font-black italic uppercase tracking-tight truncate transition-all duration-500 leading-tight",
            isDone ? "text-[var(--text-secondary)] line-through" : "text-[var(--text-primary)]"
          )}>
            {item.title}
          </h3>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {!isDone && item.type !== 'HABIT' && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--accent-color)] transition-all active:scale-95 shadow-lg"
          >
            <Play size={14} fill="currentColor" />
            Initialize
          </button>
        )}

        <button
          onClick={onComplete}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            isDone 
              ? "bg-mint text-[var(--bg-primary)] shadow-lg" 
              : "bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-mint hover:text-mint"
          )}
        >
          <CheckCircle2 size={24} />
        </button>
      </div>
    </motion.div>
  );
};
