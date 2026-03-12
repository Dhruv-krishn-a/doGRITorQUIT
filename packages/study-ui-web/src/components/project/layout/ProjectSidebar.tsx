import React, { useState } from 'react';
import { Target, Zap, Activity, Clock, History, Download, Copy, ChevronRight, PlusCircle, Loader2 } from 'lucide-react';
import { ProjectContextProps, EnergyLevel } from '../types';
import { toast } from 'sonner';

interface ProjectSidebarProps extends ProjectContextProps {
  isSidebarCollapsed: boolean;
  energy: EnergyLevel;
  setEnergy: (energy: EnergyLevel) => void;
  planToday: (trackId: string, energy: EnergyLevel) => void;
}

export function ProjectSidebar({
  isSidebarCollapsed,
  track,
  units,
  phases,
  energy,
  setEnergy,
  planToday,
  formatMins,
  addUnit
}: ProjectSidebarProps) {
  const [quickTask, setQuickTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickTask.trim()) {
      setIsAdding(true);
      try {
        await addUnit(track.id, {
          title: quickTask.trim(),
          type: 'TASK',
          status: 'BACKLOG',
          durationMinutes: 30, // Default estimate
          metadata: { phase: 'Default', priority: 'Medium' }
        });
        setQuickTask('');
        toast.success("Task added");
      } catch (err) {
        // Error handled in context
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-[280px]'} border-r border-slate-200/60 bg-white/40 backdrop-blur-sm flex flex-col transition-all duration-300 relative group shrink-0`}>
      <div className="transform-gpu flex-1 overflow-y-auto no-scrollbar p-6 space-y-10">
        {/* Progress Section */}
        <div className="transform-gpu flex flex-col items-center gap-6">
          <div className="transform-gpu relative w-32 h-32 flex items-center justify-center cursor-pointer group/ring">
            <svg className="transform-gpu w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" className="transform-gpu text-slate-100" />
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * track.progressPercentage) / 100} className="transform-gpu text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] transition-all duration-1000" strokeLinecap="round" />
            </svg>
            <div className="transform-gpu absolute flex flex-col items-center group-hover/ring:scale-110 transition-transform">
              <span className="transform-gpu text-3xl font-bold text-slate-900">{Math.round(track.progressPercentage)}<span className="transform-gpu text-sm text-rose-500">%</span></span>
            </div>
          </div>
          
          <div className="transform-gpu text-center space-y-2">
            <div className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Target size={12} /> Next Milestone
            </div>
            <div className="transform-gpu text-xs font-bold text-slate-800 uppercase leading-tight">
              {track.units?.find(u => u.status !== 'DONE')?.title || 'Completion'}
            </div>
          </div>
        </div>

        <div className="transform-gpu h-px bg-slate-200" />

        {/* Focus Protocol Section */}
        <div className="transform-gpu space-y-4">
          <h3 className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Focus Protocol</h3>
          <div className="transform-gpu grid grid-cols-1 gap-2">
            {[
              { id: 'HIGH', label: 'Hyper-Focus', icon: Zap, color: 'text-rose-500' },
              { id: 'MEDIUM', label: 'Flow State', icon: Activity, color: 'text-rose-400' },
              { id: 'LOW', label: 'Maintenance', icon: Clock, color: 'text-slate-400' }
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setEnergy(lvl.id as EnergyLevel)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  energy === lvl.id 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                <lvl.icon size={14} className={energy === lvl.id ? 'text-rose-500' : lvl.color} />
                <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">{lvl.label}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => planToday(track.id, energy)}
            className="transform-gpu w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-rose-200 hover:shadow-xl hover:from-rose-600 hover:to-pink-600 transition-all active:scale-95"
          >
            Optimize Execution
          </button>
        </div>

        <div className="transform-gpu h-px bg-slate-200" />

        {/* Quick Stats */}
        <div className="transform-gpu space-y-4">
          <div className="transform-gpu grid grid-cols-2 gap-3">
            <div className="transform-gpu bg-white border border-slate-200 shadow-sm p-4 rounded-2xl">
               <div className="transform-gpu text-slate-400 font-bold text-[8px] uppercase tracking-widest mb-1">Weekly Tasks</div>
               <div className="transform-gpu text-lg font-bold text-slate-800">
                {units.filter(u => u.status === 'DONE').length} / {units.length}
               </div>
            </div>
            <div className="transform-gpu bg-white border border-slate-200 shadow-sm p-4 rounded-2xl">
               <div className="transform-gpu text-slate-400 font-bold text-[8px] uppercase tracking-widest mb-1">Hours Logged</div>
               <div className="transform-gpu text-lg font-bold text-slate-800">{formatMins(units.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0))}</div>
            </div>
          </div>
          
          <div className="transform-gpu flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
             <div className="transform-gpu flex items-center gap-2">
               <div className="transform-gpu w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
               <span className="transform-gpu text-[9px] font-bold uppercase text-emerald-600 tracking-widest">Health</span>
             </div>
             <span className="transform-gpu text-[9px] font-bold text-emerald-700 uppercase">Healthy</span>
          </div>
        </div>

        {/* Mini Phase List */}
        <div className="transform-gpu space-y-4">
           <div className="transform-gpu flex items-center justify-between">
             <h3 className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Phases</h3>
             <button className="transform-gpu text-[9px] font-bold text-rose-500 uppercase hover:text-rose-600">View All</button>
           </div>
           <div className="transform-gpu space-y-2">
             {Object.keys(phases).slice(0, 3).map(phaseName => (
               <div key={phaseName} className="transform-gpu flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl transition-colors cursor-pointer group/item">
                 <div className="transform-gpu w-1 h-4 bg-slate-200 group-hover/item:bg-rose-500 transition-colors rounded-full" />
                 <span className="transform-gpu text-xs font-bold text-slate-700 group-hover/item:text-slate-900">{phaseName}</span>
                 <ChevronRight size={14} className="transform-gpu ml-auto text-slate-300 group-hover/item:text-rose-500" />
               </div>
             ))}
           </div>
        </div>

        {/* Quick Links */}
        <div className="transform-gpu space-y-3 pt-6 border-t border-slate-200">
           <button className="transform-gpu flex items-center gap-3 w-full text-left text-slate-500 hover:text-slate-900 hover:bg-slate-50 p-2 rounded-lg transition-colors">
             <History size={16} /> <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">Weekly Review</span>
           </button>
           <button className="transform-gpu flex items-center gap-3 w-full text-left text-slate-500 hover:text-slate-900 hover:bg-slate-50 p-2 rounded-lg transition-colors">
             <Download size={16} /> <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">Export Project</span>
           </button>
           <button className="transform-gpu flex items-center gap-3 w-full text-left text-slate-500 hover:text-slate-900 hover:bg-slate-50 p-2 rounded-lg transition-colors">
             <Copy size={16} /> <span className="transform-gpu text-[10px] font-bold uppercase tracking-widest">Clone Phase</span>
           </button>
        </div>
      </div>
      
      <div className="transform-gpu p-4 bg-white border-t border-slate-200">
        <div className="transform-gpu relative group">
          {isAdding ? (
            <Loader2 size={16} className="transform-gpu absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 animate-spin" />
          ) : (
            <PlusCircle size={16} className="transform-gpu absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
          )}
          <input 
            type="text" 
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            onKeyDown={handleQuickAdd}
            disabled={isAdding}
            placeholder="ADD QUICK TASK..." 
            className="transform-gpu w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[10px] font-bold text-slate-800 focus:border-rose-300 focus:bg-white focus:shadow-sm outline-none transition-all placeholder:text-slate-400 uppercase tracking-widest disabled:opacity-50"
          />
        </div>
      </div>
    </aside>
  );
}
