import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Loader2 } from 'lucide-react';
import { ProjectContextProps } from '../types';

interface ProjectSettingsTabProps extends Pick<ProjectContextProps, 'track'> {
  updateTrack: (trackId: string, updates: any) => Promise<void>;
}

export function ProjectSettingsTab({ track, updateTrack }: ProjectSettingsTabProps) {
  const [title, setTitle] = useState(track.title);
  const [description, setDescription] = useState(track.description || '');
  const [priority, setPriority] = useState(String(track.priority || 0));
  const [status, setStatus] = useState(track.status);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateTrack(track.id, {
      title,
      description,
      priority: parseInt(priority, 10),
      status
    });
    setIsSaving(false);
  };

  return (
    <motion.div 
      key="settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="transform-gpu p-8 max-w-2xl text-left"
    >
      <div className="transform-gpu flex items-center gap-4 mb-10 px-2 leading-none italic">
        <Settings2 size={28} className="transform-gpu text-[var(--accent-color)]" />
        <h2 className="transform-gpu text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Vector Settings</h2>
      </div>
      
      <div className="transform-gpu space-y-10 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-12 rounded-[3rem] relative overflow-hidden group">
         <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
         
         <div className="transform-gpu space-y-4 relative z-10">
            <label className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40 ml-1">Vector Designation</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all outline-none italic uppercase tracking-tight shadow-inner" 
            />
         </div>

         <div className="transform-gpu space-y-4 relative z-10">
            <label className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40 ml-1">Mission Parameters</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="transform-gpu w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all outline-none resize-none custom-scrollbar italic uppercase tracking-tight shadow-inner" 
            />
         </div>

         <div className="transform-gpu grid grid-cols-2 gap-8 relative z-10">
            <div className="transform-gpu space-y-4">
              <label className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40 ml-1">Priority Scale (0-10)</label>
              <input 
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                min="0" max="10"
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all outline-none italic shadow-inner" 
              />
            </div>
            <div className="transform-gpu space-y-4">
              <label className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40 ml-1">Operational Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all outline-none appearance-none italic uppercase tracking-tight shadow-inner cursor-pointer"
              >
                 <option value="ACTIVE">ACTIVE</option>
                 <option value="PAUSED">PAUSED</option>
                 <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
         </div>

         <div className="transform-gpu pt-10 border-t border-[var(--border-color)] flex gap-6 relative z-10">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="transform-gpu flex-1 py-5 flex justify-center items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-20 italic"
            >
              {isSaving ? <Loader2 size={18} className="transform-gpu animate-spin" /> : "Commit Changes"}
            </button>
            <button className="transform-gpu px-8 py-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all active:scale-95 italic">Purge Vector</button>
         </div>
      </div>
    </motion.div>
  );
}
