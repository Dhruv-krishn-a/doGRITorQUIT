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
      className="transform-gpu p-8 max-w-2xl"
    >
      <div className="transform-gpu flex items-center gap-3 mb-10">
        <Settings2 size={24} className="transform-gpu text-rose-500" />
        <h2 className="transform-gpu text-2xl font-bold text-slate-900 uppercase tracking-tight">Project Settings</h2>
      </div>
      
      <div className="transform-gpu space-y-10 bg-white border border-slate-200 shadow-sm p-10 rounded-[2.5rem]">
         <div className="transform-gpu space-y-4">
            <label className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-500">Project Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="transform-gpu w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:bg-white focus:shadow-sm transition-all outline-none" 
            />
         </div>

         <div className="transform-gpu space-y-4">
            <label className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="transform-gpu w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:bg-white focus:shadow-sm transition-all outline-none resize-none custom-scrollbar" 
            />
         </div>

         <div className="transform-gpu grid grid-cols-2 gap-8">
            <div className="transform-gpu space-y-4">
              <label className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-500">Priority (0-10)</label>
              <input 
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                min="0" max="10"
                className="transform-gpu w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:bg-white focus:shadow-sm transition-all outline-none" 
              />
            </div>
            <div className="transform-gpu space-y-4">
              <label className="transform-gpu text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="transform-gpu w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:bg-white focus:shadow-sm transition-all outline-none appearance-none"
              >
                 <option value="ACTIVE">Active</option>
                 <option value="PAUSED">Paused</option>
                 <option value="ARCHIVED">Archived</option>
              </select>
            </div>
         </div>

         <div className="transform-gpu pt-10 border-t border-slate-100 flex gap-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="transform-gpu flex-1 py-4 flex justify-center items-center gap-2 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="transform-gpu animate-spin" /> : "Save Changes"}
            </button>
            <button className="transform-gpu px-8 py-4 bg-red-50 text-red-600 border border-red-200 shadow-sm rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95">Archive Project</button>
         </div>
      </div>
    </motion.div>
  );
}
