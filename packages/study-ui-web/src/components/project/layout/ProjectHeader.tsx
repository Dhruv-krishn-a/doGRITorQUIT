import React from 'react';
import { 
  ArrowLeft, Edit3, Pause, Play, Star, Pin, Timer, Plus, MoreHorizontal,
  LayoutGrid, Layers, Calendar, List, Target, Clock, History, FileText, Settings2
} from 'lucide-react';
import { ProjectContextProps, ProjectTab } from '../types';

interface ProjectHeaderProps extends Pick<ProjectContextProps, 'track' | 'metadata' | 'formatTime'> {
  onBack: () => void;
  seconds: number;
  isTimerRunning: boolean;
  setIsTimerRunning: (isRunning: boolean) => void;
  activeTab: ProjectTab;
  setActiveTab: (tab: ProjectTab) => void;
}

export function ProjectHeader({
  track,
  metadata,
  onBack,
  seconds,
  formatTime,
  isTimerRunning,
  setIsTimerRunning,
  activeTab,
  setActiveTab
}: ProjectHeaderProps) {
  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutGrid },
    { id: 'BOARD', label: 'Board', icon: Layers },
    { id: 'TIMELINE', label: 'Timeline', icon: Calendar },
    { id: 'TASKS', label: 'Tasks', icon: List },
    { id: 'PHASES', label: 'Phases', icon: Target },
    { id: 'TIME', label: 'Time', icon: Clock },
    { id: 'REVIEWS', label: 'Reviews', icon: History },
    { id: 'NOTES', label: 'Notes', icon: FileText },
    { id: 'SETTINGS', label: 'Settings', icon: Settings2 },
  ];

  return (
    <header className="transform-gpu sticky top-0 z-50 w-full bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-color)] shadow-sm shrink-0">
      <div className="transform-gpu flex items-center justify-between px-6 py-4">
        <div className="transform-gpu flex items-center gap-6">
          <button 
            onClick={onBack}
            className="transform-gpu p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-xl text-[var(--text-secondary)] transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="transform-gpu flex flex-col text-left">
            <div className="transform-gpu flex items-center gap-3">
              <h1 className="transform-gpu text-xl font-black text-[var(--text-primary)] tracking-tight uppercase group relative italic">
                <span className="transform-gpu cursor-text">{track.title}</span>
                <Edit3 size={14} className="transform-gpu inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[var(--text-secondary)] hover:text-[var(--accent-color)]" />
              </h1>
              <div className="transform-gpu flex gap-2">
                <span className="transform-gpu px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm italic">
                  {metadata.projectType || 'Personal'}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm italic ${
                  metadata.priority === 'Critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                  metadata.priority === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                  'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]'
                }`}>
                  {metadata.priority || 'Medium'}
                </span>
                <span className="transform-gpu px-2.5 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm italic">
                  {track.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="transform-gpu flex items-center gap-4">
          <div className="transform-gpu hidden lg:flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 rounded-xl mr-4 shadow-inner">
             <div className="transform-gpu flex flex-col items-end">
                <span className="transform-gpu text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic">Global Timer</span>
                <span className="transform-gpu text-sm font-black text-[var(--text-primary)] font-mono italic">{formatTime(seconds)}</span>
             </div>
             <button 
               onClick={() => setIsTimerRunning(!isTimerRunning)}
               className={`p-2 rounded-lg transition-all ${isTimerRunning ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-primary)] text-[var(--accent-color)] hover:bg-[var(--bg-card)]'}`}
             >
               {isTimerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
             </button>
          </div>

          <button className="transform-gpu p-2 text-[var(--text-secondary)] hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors">
            <Star size={20} />
          </button>
          <button className="transform-gpu p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors">
            <Pin size={20} />
          </button>
          <div className="transform-gpu h-6 w-px bg-[var(--border-color)] mx-2" />
          
          <button className="transform-gpu flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 italic">
            <Timer size={14} className="transform-gpu text-[var(--accent-color)]" /> Quick Log
          </button>
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="transform-gpu flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-color)] rounded-xl text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[var(--accent-color)]/20 hover:opacity-90 transition-all active:scale-95 border border-transparent italic"
          >
            {isTimerRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
          </button>
          <button className="transform-gpu p-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-xl rounded-xl hover:opacity-90 transition-all active:scale-95">
            <Plus size={20} strokeWidth={3} />
          </button>
          
          <button className="transform-gpu p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="transform-gpu flex px-6 overflow-x-auto no-scrollbar border-t border-[var(--border-color)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ProjectTab)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all shrink-0 font-black italic ${
              activeTab === tab.id 
              ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/5' 
              : 'border-transparent text-[var(--text-secondary)] opacity-60 hover:text-[var(--text-primary)] hover:opacity-100 hover:bg-[var(--bg-secondary)]/50'
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-[var(--accent-color)]' : ''} />
            <span className="transform-gpu text-[10px] uppercase tracking-[0.2em]">{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
