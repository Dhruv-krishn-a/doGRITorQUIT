import React, { useState } from 'react';
import { Minimize2, Info, MessageSquare, Plus, FileText, Activity, RotateCcw, Clock, Link as LinkIcon, Loader2, Github, Figma } from 'lucide-react';
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
    <aside className={`${isContextPanelOpen ? 'w-[400px]' : 'w-0'} border-l border-slate-200/60 bg-white/40 backdrop-blur-sm transition-all duration-300 overflow-hidden flex flex-col relative shrink-0`}>
      <div className="transform-gpu flex-1 overflow-y-auto no-scrollbar p-8 space-y-10 min-w-[400px]">
        <header className="transform-gpu flex items-center justify-between mb-8">
           <h3 className="transform-gpu text-sm font-bold text-slate-900 uppercase tracking-widest">Context Panel</h3>
           <button onClick={() => setIsContextPanelOpen(false)} className="transform-gpu p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><Minimize2 size={16} /></button>
        </header>
        
        <section className="transform-gpu space-y-6">
          <div className="transform-gpu flex items-center gap-3">
            <div className="transform-gpu p-2 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 shadow-sm"><Info size={16} /></div>
            <h4 className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-500">Project Brief</h4>
          </div>
          <p className="transform-gpu text-sm font-bold text-slate-700 leading-relaxed bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
            {track.description || 'No description provided for this vector.'}
          </p>
        </section>

        <section className="transform-gpu space-y-6 pt-10 border-t border-slate-200">
          <div className="transform-gpu flex items-center justify-between">
            <div className="transform-gpu flex items-center gap-3">
              <div className="transform-gpu p-2 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 shadow-sm"><LinkIcon size={16} /></div>
              <h4 className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-500">Resources & Links</h4>
            </div>
          </div>
          <div className="transform-gpu space-y-3">
             <button className="transform-gpu w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50 transition-all flex items-center justify-center gap-2">
               <Plus size={14} /> Add Resource
             </button>
          </div>
        </section>

        <section className="transform-gpu space-y-6 pt-10 border-t border-slate-200">
          <div className="transform-gpu flex items-center justify-between">
            <div className="transform-gpu flex items-center gap-3">
              <div className="transform-gpu p-2 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 shadow-sm"><MessageSquare size={16} /></div>
              <h4 className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Notes</h4>
            </div>
            <Plus size={16} className="transform-gpu text-rose-500 hover:text-rose-600 cursor-pointer" />
          </div>
          <div className="transform-gpu bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-xs text-slate-500 font-medium italic min-h-[200px] flex items-center justify-center text-center shadow-inner">
            <div className="transform-gpu flex flex-col items-center gap-4">
               <FileText size={40} strokeWidth={1} className="transform-gpu text-slate-300" />
               <span className="transform-gpu opacity-60">Start adding notes to this project to keep everything in sync...</span>
            </div>
          </div>
        </section>

        <section className="transform-gpu space-y-6 pt-10 border-t border-slate-200">
           <div className="transform-gpu flex items-center gap-3">
             <div className="transform-gpu p-2 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 shadow-sm"><Activity size={16} /></div>
             <h4 className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Timer</h4>
           </div>
           <div className="transform-gpu bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-10 text-center space-y-6">
              <div className="transform-gpu text-6xl font-bold text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">{formatTime(seconds)}</div>
              <div className="transform-gpu flex gap-4">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 ${isTimerRunning ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'}`}
                >
                  {isTimerRunning ? 'Pause Session' : 'Start Session'}
                </button>
                <button onClick={() => { setSeconds(0); setIsTimerRunning(false); }} className="transform-gpu p-4 bg-slate-50 border border-slate-200 shadow-sm rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white transition-all active:scale-95">
                  <RotateCcw size={20}/>
                </button>
              </div>
           </div>
        </section>
      </div>
      
      {/* Quick Log Form Floating at bottom if open */}
      <div className="transform-gpu p-8 bg-white/80 backdrop-blur-md border-t border-slate-200 mt-auto min-w-[400px]">
         <div className="transform-gpu bg-white border border-rose-100 rounded-[2rem] p-6 space-y-4 shadow-xl shadow-rose-100/50">
            <h4 className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
               <Clock size={12}/> Quick Log Time
            </h4>
            <div className="transform-gpu space-y-3">
               <select 
                 value={logTask} 
                 onChange={e => setLogTask(e.target.value)}
                 className="transform-gpu w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-rose-400 focus:bg-white focus:shadow-sm transition-all"
               >
                 <option value="" disabled>Select a task...</option>
                 {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
               </select>
               <div className="transform-gpu flex gap-3">
                  <input 
                    type="number" 
                    value={logMins}
                    onChange={e => setLogMins(e.target.value)}
                    placeholder="Mins" 
                    className="transform-gpu w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-rose-400 focus:bg-white focus:shadow-sm transition-all" 
                  />
                  <button 
                    onClick={handleQuickLog}
                    disabled={isLogging || !logMins || !logTask}
                    className="transform-gpu flex-1 py-3 flex items-center justify-center gap-2 bg-rose-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md shadow-rose-200 active:scale-95 border border-transparent disabled:opacity-50"
                  >
                    {isLogging ? <Loader2 size={14} className="transform-gpu animate-spin" /> : "Save Log"}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </aside>
  );
}
