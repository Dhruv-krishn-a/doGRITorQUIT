import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectContextProps } from '../types';

interface ProjectNotesTabProps extends Pick<ProjectContextProps, 'track' | 'metadata'> {
  projectNotes: string;
  setProjectNotes: (notes: string) => void;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  updateTrack: (trackId: string, updates: any) => Promise<void>;
}

export function ProjectNotesTab({ track, metadata, projectNotes, setProjectNotes, isSaving, setIsSaving, updateTrack }: ProjectNotesTabProps) {
  return (
    <motion.div 
      key="notes"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="transform-gpu p-8 space-y-6 h-full flex flex-col text-left"
    >
       <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] p-12 space-y-10 flex-1 flex flex-col relative overflow-hidden group">
          <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="transform-gpu flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border-color)] pb-8 gap-6 relative z-10">
            <div className="text-left">
              <h3 className="transform-gpu text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter flex items-center gap-4 italic leading-none"><FileText size={28} className="transform-gpu text-[var(--accent-color)]" /> Project Documentation</h3>
              <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-3 italic opacity-40">Global intelligence base for this step</p>
            </div>
            <button 
              onClick={async () => {
                setIsSaving(true);
                try {
                  await updateTrack(track.id, { metadata: { ...metadata, globalNotes: projectNotes } });
                  toast.success("Project documentation saved");
                } catch {
                  toast.error("Failed to save documentation");
                } finally {
                  setIsSaving(false);
                }
              }}
              className="transform-gpu flex items-center justify-center gap-3 px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[var(--accent-color)]/20 hover:opacity-90 transition-all active:scale-95 italic"
            >
              {isSaving ? <Loader2 size={16} className="transform-gpu animate-spin" /> : <Save size={16} />}
              Sync Notes
            </button>
          </div>
          
          <textarea 
            className="transform-gpu flex-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] p-10 font-black text-[var(--text-primary)] text-lg focus:border-[var(--accent-color)]/50 focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all outline-none resize-none placeholder:text-[var(--text-secondary)]/20 italic uppercase tracking-tighter custom-scrollbar shadow-inner relative z-10"
            placeholder="Initialize neural recording for project parameters, architecture, and core protocols..."
            value={projectNotes}
            onChange={(e) => setProjectNotes(e.target.value)}
          />
       </div>
    </motion.div>
  );
}
