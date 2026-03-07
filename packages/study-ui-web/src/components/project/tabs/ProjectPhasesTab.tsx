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
      className="p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Phase Editor</h2>
        <button 
          onClick={() => {
            const name = prompt("Enter new phase name:");
            if (name) {
              setNewPhaseName(name);
              handleAddPhase();
            }
          }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus size={16} /> Add Root Phase
        </button>
      </div>

      <div className="flex-1 flex gap-12 overflow-hidden">
         <div className="w-80 space-y-4 overflow-y-auto no-scrollbar pr-4">
            {phaseList.map((phase, i) => (
              <div key={phase} className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl hover:border-rose-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <Layers size={16} className="text-rose-500" />
                    <span className="text-sm font-black text-slate-800 uppercase">{phase}</span>
                 </div>
                 <button onClick={() => handleDeletePhase(phase)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Delete
                 </button>
              </div>
            ))}
         </div>

         <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-[3rem] p-10 space-y-10 overflow-y-auto no-scrollbar">
            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-500">Phase Configuration</h3>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase text-slate-500">New Phase Name</label>
                     <input 
                       type="text" 
                       value={newPhaseName}
                       onChange={e => setNewPhaseName(e.target.value)}
                       placeholder="e.g., QA Testing..." 
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-rose-400 focus:bg-white focus:shadow-sm outline-none transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase text-slate-500">Type</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-rose-400 focus:bg-white focus:shadow-sm outline-none appearance-none transition-all">
                        <option>Requirements</option>
                        <option>Design</option>
                        <option>Development</option>
                        <option>Testing</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="pt-10 border-t border-slate-100 flex gap-4">
               <button 
                 onClick={handleAddPhase}
                 disabled={isSaving || !newPhaseName.trim()}
                 className="flex-1 py-4 flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
               >
                 {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save New Phase"}
               </button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
