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
    <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-[300px]'} border-r border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-md flex flex-col transition-all duration-300 relative group shrink-0`}>
      <div className="transform-gpu flex-1 overflow-y-auto no-scrollbar p-8 space-y-12">
        {/* Progress Section */}
        <div className="transform-gpu flex flex-col items-center gap-6">
          <div className="transform-gpu relative w-36 h-36 flex items-center justify-center cursor-pointer group/ring">
            <svg className="transform-gpu w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" className="transform-gpu text-[var(--bg-secondary)]" />
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * track.progressPercentage) / 100} className="transform-gpu text-[var(--accent-color)] drop-shadow-[0_0_10px_var(--accent-color)] transition-all duration-1000" strokeLinecap="round" />
            </svg>
            <div className="transform-gpu absolute flex flex-col items-center group-hover/ring:scale-110 transition-transform">
              <span className="transform-gpu text-4xl font-black text-[var(--text-primary)] italic tracking-tighter">{Math.round(track.progressPercentage)}<span className="transform-gpu text-base text-[var(--accent-color)]">%</span></span>
            </div>
          </div>
          
          <div className="transform-gpu text-center space-y-2">
            <div className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center justify-center gap-2 italic opacity-40">
              <Target size={12} /> Next Milestone
            </div>
            <div className="transform-gpu text-xs font-black text-[var(--text-primary)] uppercase leading-tight italic tracking-tight">
              {track.units?.find(u => u.status !== 'DONE')?.title || 'Completion'}
            </div>
          </div>
        </div>

        <div className="transform-gpu h-px bg-[var(--border-color)] mx-4" />

        {/* Focus Protocol Section */}
        <div className="transform-gpu space-y-6">
          <h3 className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] px-1 italic opacity-40">Focus Protocol</h3>
          <div className="transform-gpu grid grid-cols-1 gap-2.5">
            {[
              { id: 'HIGH', label: 'Hyper-Focus', icon: Zap, color: 'text-rose-500' },
              { id: 'MEDIUM', label: 'Flow State', icon: Activity, color: 'text-sky-500' },
              { id: 'LOW', label: 'Maintenance', icon: Clock, color: 'text-[var(--text-secondary)]' }
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setEnergy(lvl.id as EnergyLevel)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left shadow-sm ${
                  energy === lvl.id 
                  ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-xl shadow-[var(--accent-color)]/20' 
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-card)]'
                }`}
              >
                <lvl.icon size={16} className={energy === lvl.id ? 'text-[var(--bg-primary)]' : lvl.color} />
                <span className="transform-gpu text-[10px] font-black uppercase tracking-widest italic">{lvl.label}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => planToday(track.id, energy)}
            className="transform-gpu w-full py-4 bg-[var(--accent-color)] rounded-2xl text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[var(--accent-color)]/20 hover:opacity-90 transition-all active:scale-95 italic"
          >
            Optimize Execution
          </button>
        </div>

        <div className="transform-gpu h-px bg-[var(--border-color)] mx-4" />

        {/* Quick Stats */}
        <div className="transform-gpu space-y-6">
          <div className="transform-gpu grid grid-cols-2 gap-4">
            <div className="transform-gpu bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl shadow-inner">
               <div className="transform-gpu text-[var(--text-secondary)] font-black text-[8px] uppercase tracking-widest mb-2 opacity-40 italic">Weekly Path</div>
               <div className="transform-gpu text-xl font-black text-[var(--text-primary)] italic">
                {units.filter(u => u.status === 'DONE').length}<span className="text-[10px] opacity-20 mx-1">/</span>{units.length}
               </div>
            </div>
            <div className="transform-gpu bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl shadow-inner">
               <div className="transform-gpu text-[var(--text-secondary)] font-black text-[8px] uppercase tracking-widest mb-2 opacity-40 italic">Temporal Log</div>
               <div className="transform-gpu text-xl font-black text-[var(--text-primary)] italic">{formatMins(units.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0))}</div>
            </div>
          </div>
          
          <div className="transform-gpu flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-sm">
             <div className="transform-gpu flex items-center gap-3">
               <div className="transform-gpu w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
               <span className="transform-gpu text-[10px] font-black uppercase text-emerald-500 tracking-widest italic leading-none">System Health</span>
             </div>
             <span className="transform-gpu text-[9px] font-black text-emerald-600 uppercase italic leading-none">Healthy</span>
          </div>
        </div>

        {/* Mini Phase List */}
        <div className="transform-gpu space-y-6">
           <div className="transform-gpu flex items-center justify-between px-1">
             <h3 className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic opacity-40">Current Phases</h3>
             <button className="transform-gpu text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest hover:underline italic">View All</button>
           </div>
           <div className="transform-gpu space-y-3">
             {Object.keys(phases).slice(0, 3).map(phaseName => (
               <div key={phaseName} className="transform-gpu flex items-center gap-4 p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-2xl transition-all cursor-pointer group/item">
                 <div className="transform-gpu w-1 h-5 bg-[var(--border-color)] group-hover/item:bg-[var(--accent-color)] group-hover/item:shadow-[0_0_8px_var(--accent-color)] transition-all rounded-full" />
                 <span className="transform-gpu text-xs font-black text-[var(--text-primary)] italic uppercase tracking-tight truncate flex-1">{phaseName}</span>
                 <ChevronRight size={14} className="transform-gpu text-[var(--text-secondary)] group-hover/item:text-[var(--accent-color)] opacity-40 group-hover/item:opacity-100 transition-all" />
               </div>
             ))}
           </div>
        </div>

        {/* Quick Links */}
        <div className="transform-gpu space-y-3 pt-8 border-t border-[var(--border-color)]">
           <button className="transform-gpu flex items-center gap-4 w-full text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] p-3 rounded-xl transition-all group/link italic">
             <History size={18} className="opacity-40 group-hover/link:text-[var(--accent-color)] group-hover/link:opacity-100" /> <span className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em]">Weekly Review</span>
           </button>
           <button className="transform-gpu flex items-center gap-4 w-full text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] p-3 rounded-xl transition-all group/link italic">
             <Download size={18} className="opacity-40 group-hover/link:text-[var(--accent-color)] group-hover/link:opacity-100" /> <span className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em]">Export Project</span>
           </button>
           <button className="transform-gpu flex items-center gap-4 w-full text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] p-3 rounded-xl transition-all group/link italic">
             <Copy size={18} className="opacity-40 group-hover/link:text-[var(--accent-color)] group-hover/link:opacity-100" /> <span className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em]">Clone Phase</span>
           </button>
        </div>
      </div>
      
      <div className="transform-gpu p-6 bg-[var(--bg-card)]/80 border-t border-[var(--border-color)]">
        <div className="transform-gpu relative group">
          {isAdding ? (
            <Loader2 size={18} className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-color)] animate-spin" />
          ) : (
            <PlusCircle size={18} className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors opacity-40 group-focus-within:opacity-100" />
          )}
          <input 
            type="text" 
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            onKeyDown={handleQuickAdd}
            disabled={isAdding}
            placeholder="ADD QUICK VECTOR..." 
            className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-4 text-[10px] font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all placeholder:text-[var(--text-secondary)]/20 uppercase tracking-[0.2em] disabled:opacity-50 italic"
          />
        </div>
      </div>
    </aside>
  );
}
