import React, { useState } from 'react';
import { Minimize2, Info, MessageSquare, Plus, FileText, Activity, RotateCcw, Clock, Link as LinkIcon, Loader2, Github, Figma, Save } from 'lucide-react';
import { ProjectContextProps } from '../types';
import { toast } from 'sonner';

interface ProjectContextPanelProps extends Pick<ProjectContextProps, 'track' | 'units' | 'formatTime'> {
  isContextPanelOpen: boolean;
  setIsContextPanelOpen: (isOpen: boolean) => void;
  seconds: number;
  setSeconds: (seconds: number) => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (isRunning: boolean) => void;
  logProgress?: (unitId: string, data: { secondsSpent: number, watchPercentage: number }) => Promise<void>;
}

export function ProjectContextPanel({
  isContextPanelOpen,
  setIsContextPanelOpen,
  track,
  units,
  seconds,
  setSeconds,
  isTimerRunning,
  setIsTimerRunning,
  formatTime,
  logProgress
}: ProjectContextPanelProps) {
  const [logMins, setLogMins] = useState('');
  const [logTask, setLogTask] = useState(units.find(u => u.status === 'IN_PROGRESS')?.id || units[0]?.id || '');
  const [isLogging, setIsLogging] = useState(false);

  const handleQuickLog = async () => {
    if (!logProgress) return;
    const mins = parseInt(logMins);
    if (!mins || mins <= 0 || !logTask) {
      toast.error('Valid time and task required');
      return;
    }
    
    setIsLogging(true);
    try {
      const selectedUnit = units.find(u => u.id === logTask);
      const currentWatchPercent = selectedUnit?.watchPercentage || 0;
      await logProgress(logTask, { secondsSpent: mins * 60, watchPercentage: currentWatchPercent });
      setLogMins('');
      toast.success(`Logged ${mins}m to task`);
    } catch (e) {
      toast.error('Failed to log time');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <aside className={`${isContextPanelOpen ? 'w-[400px]' : 'w-0'} border-l border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-md transition-all duration-300 overflow-hidden flex flex-col relative shrink-0 text-left`}>
      <div className="transform-gpu flex-1 overflow-y-auto no-scrollbar p-8 space-y-12 min-w-[400px]">
        <header className="transform-gpu flex items-center justify-between mb-8">
           <h3 className="transform-gpu text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] italic opacity-40">Context Panel</h3>
           <button onClick={() => setIsContextPanelOpen(false)} className="transform-gpu p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 rounded-xl transition-all shadow-sm"><Minimize2 size={18} /></button>
        </header>
        
        <section className="transform-gpu space-y-6">
          <div className="transform-gpu flex items-center gap-4">
            <div className="transform-gpu p-2.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl border border-[var(--accent-color)]/20 shadow-sm"><Info size={18} /></div>
            <h4 className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-60">Project Brief</h4>
          </div>
          <p className="transform-gpu text-sm font-black text-[var(--text-primary)] leading-relaxed bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-inner p-8 rounded-[2.5rem] italic uppercase tracking-tight">
            {track.description || 'No description provided for this step.'}
          </p>
        </section>

        <section className="transform-gpu space-y-6 pt-12 border-t border-[var(--border-color)]">
          <div className="transform-gpu flex items-center justify-between">
            <div className="transform-gpu flex items-center gap-4">
              <div className="transform-gpu p-2.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl border border-[var(--accent-color)]/20 shadow-sm"><LinkIcon size={18} /></div>
              <h4 className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-60">Resources & Links</h4>
            </div>
          </div>
          <div className="transform-gpu space-y-3">
             <button className="transform-gpu w-full py-5 border-2 border-dashed border-[var(--border-color)] rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-secondary)] transition-all flex items-center justify-center gap-3 italic">
               <Plus size={18} strokeWidth={3} /> Add Resource
             </button>
          </div>
        </section>

        <section className="transform-gpu space-y-6 pt-12 border-t border-[var(--border-color)]">
          <div className="transform-gpu flex items-center justify-between">
            <div className="transform-gpu flex items-center gap-4">
              <div className="transform-gpu p-2.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl border border-[var(--accent-color)]/20 shadow-sm"><MessageSquare size={18} /></div>
              <h4 className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-60">Global Notes</h4>
            </div>
            <Plus size={18} className="transform-gpu text-[var(--accent-color)] hover:scale-125 transition-transform cursor-pointer" strokeWidth={3} />
          </div>
          <div className="transform-gpu bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] p-8 text-xs text-[var(--text-secondary)] font-black italic min-h-[250px] flex items-center justify-center text-center shadow-inner group">
            <div className="transform-gpu flex flex-col items-center gap-6">
               <FileText size={48} strokeWidth={1} className="transform-gpu text-[var(--text-secondary)] opacity-20 group-hover:opacity-40 transition-opacity" />
               <span className="transform-gpu opacity-40 uppercase tracking-widest leading-relaxed">Initialize notes sync to coordinate step intelligence...</span>
            </div>
          </div>
        </section>

        <section className="transform-gpu space-y-6 pt-12 border-t border-[var(--border-color)]">
           <div className="transform-gpu flex items-center gap-4">
             <div className="transform-gpu p-2.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl border border-[var(--accent-color)]/20 shadow-sm"><Activity size={18} /></div>
             <h4 className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-60">Live Sequence</h4>
           </div>
           <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] p-10 text-center space-y-8 relative overflow-hidden group/timer">
              <div className="transform-gpu absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none group-hover/timer:scale-150 transition-transform duration-1000" />
              <div className="transform-gpu text-7xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums drop-shadow-sm italic relative z-10">{formatTime(seconds)}</div>
              <div className="transform-gpu flex gap-4 relative z-10">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 italic ${isTimerRunning ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/30' : 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-[var(--accent-color)]/20 hover:opacity-90'}`}
                >
                  {isTimerRunning ? 'Pause Session' : 'Start Session'}
                </button>
                <button onClick={() => { setSeconds(0); setIsTimerRunning(false); }} className="transform-gpu p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all active:scale-95">
                  <RotateCcw size={22}/>
                </button>
              </div>
           </div>
        </section>
      </div>
      
      {/* Quick Log Form Floating at bottom if open */}
      <div className="transform-gpu p-10 bg-[var(--bg-card)]/80 backdrop-blur-xl border-t border-[var(--border-color)] mt-auto min-w-[400px]">
         <div className="transform-gpu bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[3rem] p-8 space-y-6 shadow-xl shadow-black/5">
            <h4 className="transform-gpu text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] flex items-center gap-3 italic">
               <Clock size={14}/> Quick Log Sequence
            </h4>
            <div className="transform-gpu space-y-4">
               <select 
                 value={logTask} 
                 onChange={e => setLogTask(e.target.value)}
                 className="transform-gpu w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[11px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all italic uppercase tracking-tighter shadow-inner appearance-none cursor-pointer"
               >
                 <option value="" disabled>SELECT VECTOR...</option>
                 {units.map(u => <option key={u.id} value={u.id}>{u.title.toUpperCase()}</option>)}
               </select>
               <div className="transform-gpu flex gap-4">
                  <div className="relative w-32">
                    <input 
                      type="number" 
                      value={logMins}
                      onChange={e => setLogMins(e.target.value)}
                      placeholder="MINS" 
                      className="transform-gpu w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[11px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all italic placeholder:text-[var(--text-secondary)]/20 shadow-inner" 
                    />
                  </div>
                  <button 
                    onClick={handleQuickLog}
                    disabled={isLogging || !logMins || !logTask}
                    className="transform-gpu flex-1 py-4 flex items-center justify-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-20 italic"
                  >
                    {isLogging ? <Loader2 size={16} className="transform-gpu animate-spin" /> : <Save size={16} />}
                    Sync Log
                  </button>
               </div>
            </div>
         </div>
      </div>
    </aside>
  );
}
