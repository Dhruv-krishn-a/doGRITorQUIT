"use client";
import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  Layout,
  PlusCircle,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';

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
      
      toast.success("Lesson added successfully");
      setNewUnit({ title: '', durationMinutes: 30, type: 'LESSON' });
      onRefresh();
    } catch {
      toast.error("Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  // Animation Configs - Explicitly typed as Variants to fix TS errors
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto py-16 space-y-16 transform-gpu antialiased font-sans relative z-10"
    >
      {/* Background Soft Glow to ground the view */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-rose-100/40 rounded-full blur-[120px] pointer-events-none -z-10 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]" />

      {/* Header Section */}
      <motion.div variants={itemVariants} className="text-center space-y-6">
        <motion.div 
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex p-6 bg-white border border-rose-100 text-rose-500 rounded-[2.5rem] shadow-[0_8px_30px_rgba(244,63,94,0.15)] mb-2"
        >
          <Cpu size={56} strokeWidth={1.5} className="drop-shadow-sm" />
        </motion.div>
        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase drop-shadow-sm">
          Empty Vector
        </h2>
        <p className="text-slate-400 text-lg font-bold max-w-lg mx-auto leading-relaxed tracking-tight">
          This neural track requires content. Import a syllabus or quick-add lessons to initiate tracking.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Option A: Import Syllabus */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8 }}
          className="bg-white/60 backdrop-blur-xl p-10 md:p-12 rounded-[3.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10 group hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-500 relative overflow-hidden flex flex-col"
        >
          {/* Subtle Hover Gradient */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />
          
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-200/20 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-1000 opacity-0 group-hover:opacity-100 pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-[1.5rem] inline-block shadow-sm group-hover:rotate-12 transition-transform duration-500">
              <Layout size={28} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Import Syllabus</h3>
            <p className="text-[11px] text-indigo-500 font-black uppercase tracking-[0.2em]">Batch Ingestion Process</p>
          </div>
          
          <div className="space-y-5 relative z-10 flex-1">
            <button className="w-full flex items-center justify-center gap-4 p-8 bg-white/80 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-500 group-hover:bg-indigo-50/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <PlusCircle size={28} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest mt-0.5">Select Files</span>
            </button>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic uppercase tracking-widest opacity-80 text-center">
              Coming soon: Auto-extraction from PDF/CSV.
            </p>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled
            className="w-full py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all border border-slate-200 cursor-not-allowed relative z-10"
          >
            Module Offline
          </motion.button>
        </motion.div>

        {/* Option B: Quick Add / Session Mode */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8 }}
          className="bg-white/60 backdrop-blur-xl p-10 md:p-12 rounded-[3.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10 group hover:shadow-xl hover:shadow-rose-100/50 hover:border-rose-100 transition-all duration-500 relative overflow-hidden flex flex-col"
        >
          {/* Subtle Hover Gradient */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50 bg-[length:200%_200%] animate-gradient-xy transition-opacity duration-700 pointer-events-none -z-10" />

          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200/30 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-1000 opacity-0 group-hover:opacity-100 pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="p-4 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-[1.5rem] inline-block shadow-[0_8px_20px_rgba(244,63,94,0.3)] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <Zap size={28} fill="currentColor" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Quick Add</h3>
            <p className="text-[11px] text-rose-500 font-black uppercase tracking-[0.2em]">Manual Data Entry</p>
          </div>

          <form onSubmit={handleQuickAdd} className="space-y-5 relative z-10 flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Lesson Title</label>
              <input 
                type="text"
                placeholder="e.g. Introduction to Neural Networks"
                className="w-full bg-white/80 border border-slate-200 rounded-[2rem] py-5 px-6 font-black text-slate-800 placeholder:text-slate-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all shadow-inner text-sm"
                value={newUnit.title}
                onChange={e => setNewUnit({...newUnit, title: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-2">
              <div className="w-full sm:w-1/3 space-y-2 relative">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Duration</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number"
                    className="w-full bg-white/80 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-black text-slate-800 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 transition-all shadow-inner text-sm"
                    value={newUnit.durationMinutes}
                    onChange={e => setNewUnit({...newUnit, durationMinutes: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-2/3 flex items-end">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !newUnit.title}
                  className="w-full h-[54px] bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_8px_20px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] disabled:opacity-50 disabled:grayscale relative overflow-hidden group/btn flex items-center justify-center gap-2"
                >
                   {/* CSS Shimmer/Glass Reflection Effect inside Button */}
                   <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                   <span className="relative z-10 pt-0.5">Initialize Lesson</span>
                   <ArrowRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </form>

          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] text-center relative z-10">
            Metrics update upon task completion.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};