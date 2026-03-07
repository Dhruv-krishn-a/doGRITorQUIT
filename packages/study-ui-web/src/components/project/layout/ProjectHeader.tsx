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
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shrink-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors border border-transparent hover:border-slate-200"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase group relative">
                <span className="cursor-text">{track.title}</span>
                <Edit3 size={14} className="inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-slate-400 hover:text-rose-500" />
              </h1>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">
                  {metadata.projectType || 'Personal'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                  metadata.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' :
                  metadata.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {metadata.priority || 'Medium'}
                </span>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">
                  {track.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl mr-4 shadow-sm">
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Global Timer</span>
                <span className="text-sm font-black text-slate-800 font-mono">{formatTime(seconds)}</span>
             </div>
             <button 
               onClick={() => setIsTimerRunning(!isTimerRunning)}
               className={`p-2 rounded-lg transition-all ${isTimerRunning ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-slate-400 hover:bg-slate-100'}`}
             >
               {isTimerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
             </button>
          </div>

          <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors">
            <Star size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
            <Pin size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95">
            <Timer size={14} className="text-rose-500" /> Quick Log
          </button>
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 hover:shadow-xl hover:from-rose-600 hover:to-pink-600 transition-all active:scale-95 border border-transparent"
          >
            {isTimerRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
          </button>
          <button className="p-2 bg-slate-900 text-white shadow-lg rounded-xl hover:bg-slate-800 transition-all active:scale-95">
            <Plus size={20} strokeWidth={3} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex px-6 overflow-x-auto no-scrollbar border-t border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ProjectTab)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all shrink-0 ${
              activeTab === tab.id 
              ? 'border-rose-500 text-rose-600 font-black' 
              : 'border-transparent text-slate-400 font-bold hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-rose-500' : ''} />
            <span className="text-[10px] uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
