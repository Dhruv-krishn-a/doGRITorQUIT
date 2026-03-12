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
      className="transform-gpu p-8 space-y-6 h-full flex flex-col"
    >
       <div className="transform-gpu bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-10 space-y-8 flex-1 flex flex-col">
          <div className="transform-gpu flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h3 className="transform-gpu text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3"><FileText className="transform-gpu text-rose-500" /> Project Documentation</h3>
              <p className="transform-gpu text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Global knowledge base for this vector</p>
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
              className="transform-gpu flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95"
            >
              {isSaving ? <Loader2 size={14} className="transform-gpu animate-spin" /> : <Save size={14} />}
              Save Notes
            </button>
          </div>
          
          <textarea 
            className="transform-gpu flex-1 w-full bg-slate-50/50 border border-slate-200/60 rounded-3xl p-10 font-medium text-slate-700 text-lg focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all outline-none resize-none placeholder:text-slate-300 custom-scrollbar"
            placeholder="Capture high-level project specs, architecture decisions, and important links..."
            value={projectNotes}
            onChange={(e) => setProjectNotes(e.target.value)}
          />
       </div>
    </motion.div>
  );
}
