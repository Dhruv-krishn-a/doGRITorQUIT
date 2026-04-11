import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectContextProps } from '../types';

interface ProjectPhasesTabProps extends Pick<ProjectContextProps, 'track' | 'phases' | 'metadata'> {
  updateTrack: (trackId: string, updates: any) => Promise<void>;
}

export function ProjectPhasesTab({ track, phases, metadata, updateTrack }: ProjectPhasesTabProps) {
  const [newPhaseName, setNewPhaseName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const phaseList = metadata.phases || ['Default'];

  const handleAddPhase = async () => {
    if (!newPhaseName.trim()) {
      toast.error('Phase name cannot be empty');
      return;
    }
    if (phaseList.includes(newPhaseName.trim())) {
      toast.error('Phase already exists');
      return;
    }

    setIsSaving(true);
    const updatedPhases = [...phaseList, newPhaseName.trim()];
    
    try {
      await updateTrack(track.id, { metadata: { ...metadata, phases: updatedPhases } });
      setNewPhaseName('');
      toast.success('Phase added successfully');
    } catch (e) {
      toast.error('Failed to add phase');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhase = async (phaseToDelete: string) => {
    if (phaseList.length <= 1) {
      toast.error('Must have at least one phase');
      return;
    }
    const hasUnits = phases[phaseToDelete]?.length > 0;
    if (hasUnits && !confirm(`Phase "${phaseToDelete}" has tasks. They will be moved to the default phase. Continue?`)) {
      return;
    }

    setIsSaving(true);
    const updatedPhases = phaseList.filter(p => p !== phaseToDelete);
    
    // We would ideally also need to trigger a backend update to reassign units 
    // to the default phase if we are deleting their current phase. 
    // For now, the UI fallback will catch them in 'Default'.
    
    try {
      await updateTrack(track.id, { metadata: { ...metadata, phases: updatedPhases } });
      toast.success('Phase removed');
    } catch (e) {
      toast.error('Failed to remove phase');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      key="phases"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="transform-gpu p-8 h-full flex flex-col text-left"
    >
      <div className="transform-gpu flex items-center justify-between mb-10 px-2">
        <h2 className="transform-gpu text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Phase Editor</h2>
        <button 
          onClick={() => {
            const name = prompt("Enter new phase name:");
            if (name) {
              setNewPhaseName(name);
              handleAddPhase();
            }
          }}
          className="transform-gpu flex items-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:opacity-90 transition-all active:scale-95 italic"
        >
          <Plus size={18} strokeWidth={3} /> Add Root Phase
        </button>
      </div>

      <div className="transform-gpu flex-1 flex gap-12 overflow-hidden">
         <div className="transform-gpu w-80 space-y-4 overflow-y-auto no-scrollbar pr-4">
            {phaseList.map((phase, i) => (
              <div key={phase} className="transform-gpu p-6 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm rounded-[2rem] hover:border-[var(--accent-color)]/30 hover:shadow-xl cursor-pointer transition-all flex items-center justify-between group">
                 <div className="transform-gpu flex items-center gap-5">
                    <Layers size={18} className="transform-gpu text-[var(--accent-color)]" />
                    <span className="transform-gpu text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">{phase}</span>
                 </div>
                 <button onClick={() => handleDeletePhase(phase)} className="transform-gpu text-rose-500/40 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest italic">
                    Purge
                 </button>
              </div>
            ))}
         </div>

         <div className="transform-gpu flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] p-12 space-y-12 overflow-y-auto no-scrollbar relative">
            <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="transform-gpu space-y-8 relative z-10">
               <h3 className="transform-gpu text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] italic">Phase Configuration</h3>
               <div className="transform-gpu grid grid-cols-2 gap-10">
                  <div className="transform-gpu space-y-4">
                     <label className="transform-gpu text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-[0.2em] italic opacity-40 ml-1">New Phase Designation</label>
                     <input 
                       type="text" 
                       value={newPhaseName}
                       onChange={e => setNewPhaseName(e.target.value)}
                       placeholder="e.g., QA TESTING..." 
                       className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all italic uppercase tracking-tighter shadow-inner" 
                     />
                  </div>
                  <div className="transform-gpu space-y-4">
                     <label className="transform-gpu text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-[0.2em] italic opacity-40 ml-1">Architectural Type</label>
                     <select className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all italic uppercase tracking-tighter shadow-inner appearance-none cursor-pointer">
                        <option>Requirements</option>
                        <option>Design</option>
                        <option>Development</option>
                        <option>Testing</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="transform-gpu pt-12 border-t border-[var(--border-color)] flex gap-6 relative z-10">
               <button 
                 onClick={handleAddPhase}
                 disabled={isSaving || !newPhaseName.trim()}
                 className="transform-gpu flex-1 py-5 flex items-center justify-center gap-3 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 italic"
               >
                 {isSaving ? <Loader2 size={18} className="transform-gpu animate-spin" /> : "Commit New Phase"}
               </button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
