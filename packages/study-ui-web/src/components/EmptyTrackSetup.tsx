//packages/study-ui-web/src/components/EmptyTrackSetup.tsx
"use client";
import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  Layout,
  PlusCircle,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface EmptyTrackSetupProps {
  trackId: string;
  onRefresh: () => void;
  onAddUnit: (trackId: string, unit: any) => Promise<any>;
}

export const EmptyTrackSetup: React.FC<EmptyTrackSetupProps> = ({ trackId, onRefresh, onAddUnit }) => {
  const [loading, setLoading] = useState(false);
  
  // Quick Add State
  const [newUnit, setNewUnit] = useState({
    title: '',
    durationMinutes: 30,
    type: 'LESSON'
  });

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.title) return;
    
    setLoading(true);
    try {
      await onAddUnit(trackId, newUnit);
      
      toast.success("Lesson added");
      setNewUnit({ title: '', durationMinutes: 30, type: 'LESSON' });
      onRefresh();
    } catch {
      toast.error("Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto py-16 space-y-16"
    >
      <div className="text-center space-y-5">
        <motion.div 
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-flex p-6 bg-rose-50 text-rose-500 rounded-[2.5rem] border-2 border-rose-100 shadow-2xl shadow-rose-100/20 mb-6"
        >
          <Cpu size={56} strokeWidth={1.2} />
        </motion.div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">Empty Track</h2>
        <p className="text-slate-400 text-lg font-bold max-w-lg mx-auto leading-relaxed tracking-tight">This course has no content yet. Add some lessons to start tracking your progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Option A: Structured Setup */}
        <motion.div 
          whileHover={{ y: -8 }}
          className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10 group hover:border-rose-200 transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="space-y-3 relative z-10">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl inline-block shadow-sm group-hover:rotate-6 transition-transform">
              <Layout size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Import Syllabus</h3>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Add many items at once</p>
          </div>
          
          <div className="space-y-5 relative z-10">
            <div className="flex items-center gap-5 p-6 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 group-hover:border-indigo-200 transition-colors">
              <PlusCircle size={24} />
              <span className="text-sm font-black uppercase tracking-widest">Select Files</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic uppercase tracking-widest opacity-60">
              Coming soon: automatically extract lessons from your documents.
            </p>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full py-5 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 group-hover:shadow-indigo-100"
          >
            Start Importing
          </motion.button>
        </motion.div>

        {/* Option B: Quick Add / Session Mode */}
        <motion.div 
          whileHover={{ y: -8 }}
          className="bg-slate-950 p-12 rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.4)] space-y-10 group relative overflow-hidden border border-white/5"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/10 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000 blur-3xl" />
          
          <div className="space-y-3 relative z-10">
            <div className="p-4 bg-rose-600 text-white rounded-2xl inline-block shadow-[0_0_20px_rgba(225,29,72,0.4)] group-hover:rotate-12 transition-transform">
              <Zap size={28} fill="currentColor" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Quick Add</h3>
            <p className="text-[11px] text-rose-400 font-black uppercase tracking-[0.2em]">Add a single lesson</p>
          </div>

          <form onSubmit={handleQuickAdd} className="space-y-5 relative z-10">
            <input 
              type="text"
              placeholder="Lesson Title"
              className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] py-5 px-8 font-black text-white placeholder:text-slate-700 focus:border-rose-500 outline-none transition-all shadow-inner"
              value={newUnit.title}
              onChange={e => setNewUnit({...newUnit, title: e.target.value})}
            />
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <input 
                  type="number"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 font-black text-white outline-none focus:border-rose-500 transition-all"
                  value={newUnit.durationMinutes}
                  onChange={e => setNewUnit({...newUnit, durationMinutes: parseInt(e.target.value)})}
                />
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || !newUnit.title}
                className="px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-rose-900/50 disabled:opacity-50 relative overflow-hidden"
              >
                Add Lesson
              </motion.button>
            </div>
          </form>

          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] text-center relative z-10 opacity-60">
            Your progress stats will update as you finish lessons.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
