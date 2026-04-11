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
      className="transform-gpu max-w-5xl mx-auto py-16 space-y-16 transform-gpu antialiased font-sans relative z-10 text-left"
    >
      {/* Background Soft Glow to ground the view */}
      <div className="transform-gpu absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[var(--accent-color)]/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]" />

      {/* Header Section */}
      <motion.div variants={itemVariants} className="transform-gpu text-center space-y-8">
        <motion.div 
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="transform-gpu inline-flex p-8 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-color)] rounded-[3rem] shadow-2xl mb-4 relative group"
        >
          <div className="transform-gpu absolute inset-0 bg-[var(--accent-color)]/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Cpu size={64} strokeWidth={1.5} className="transform-gpu drop-shadow-sm relative z-10" />
        </motion.div>
        <h2 className="transform-gpu text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter leading-none uppercase drop-shadow-sm italic">
          Empty Vector
        </h2>
        <p className="transform-gpu text-[var(--text-secondary)] text-xl font-black max-w-lg mx-auto leading-relaxed tracking-tight uppercase italic opacity-40">
          Neural track requires content. Import syllabus or quick-add lessons to initiate tracking.
        </p>
      </motion.div>

      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* Option A: Import Syllabus */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8 }}
          className="transform-gpu bg-[var(--bg-card)]/60 backdrop-blur-xl p-10 md:p-14 rounded-[4rem] border border-[var(--border-color)] shadow-2xl space-y-12 group hover:shadow-[var(--accent-color)]/5 hover:border-[var(--accent-color)]/30 transition-all duration-500 relative overflow-hidden flex flex-col"
        >
          <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
          
          <div className="transform-gpu space-y-6 relative z-10 text-left">
            <div className="transform-gpu p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sky-500 rounded-[1.5rem] inline-block shadow-sm group-hover:rotate-12 transition-transform duration-500">
              <Layout size={32} />
            </div>
            <h3 className="transform-gpu text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Import Syllabus</h3>
            <p className="transform-gpu text-[11px] text-sky-500 font-black uppercase tracking-[0.3em] italic opacity-80">Batch Ingestion Process</p>
          </div>
          
          <div className="transform-gpu space-y-6 relative z-10 flex-1">
            <button className="transform-gpu w-full flex flex-col items-center justify-center gap-6 p-12 bg-[var(--bg-secondary)]/50 rounded-[3rem] border-2 border-dashed border-[var(--border-color)] text-[var(--text-secondary)] group-hover:border-[var(--accent-color)]/30 group-hover:text-[var(--text-primary)] group-hover:bg-[var(--bg-secondary)] transition-all duration-300 shadow-inner group-hover:shadow-xl">
              <PlusCircle size={36} className="transform-gpu group-hover:scale-110 group-hover:text-[var(--accent-color)] transition-all" strokeWidth={1.5} />
              <span className="transform-gpu text-[11px] font-black uppercase tracking-[0.3em] mt-0.5 italic opacity-40 group-hover:opacity-100">Select Files</span>
            </button>
            <p className="transform-gpu text-[10px] text-[var(--text-secondary)] font-black leading-relaxed italic uppercase tracking-widest opacity-20 text-center">
              System expansion: PDF/CSV extraction pending.
            </p>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled
            className="transform-gpu w-full py-6 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] transition-all border border-[var(--border-color)] cursor-not-allowed relative z-10 opacity-20 italic"
          >
            Module Offline
          </motion.button>
        </motion.div>

        {/* Option B: Quick Add / Session Mode */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8 }}
          className="transform-gpu bg-[var(--bg-card)]/60 backdrop-blur-xl p-10 md:p-14 rounded-[4rem] border border-[var(--border-color)] shadow-2xl space-y-12 group hover:shadow-[var(--accent-color)]/5 hover:border-[var(--accent-color)]/30 transition-all duration-500 relative overflow-hidden flex flex-col"
        >
          <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
          
          <div className="transform-gpu space-y-6 relative z-10 text-left">
            <div className="transform-gpu p-4 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-[1.5rem] border border-[var(--accent-color)]/20 inline-block shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <Zap size={32} fill="currentColor" />
            </div>
            <h3 className="transform-gpu text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Quick Add</h3>
            <p className="transform-gpu text-[11px] text-[var(--accent-color)] font-black uppercase tracking-[0.3em] italic opacity-80">Manual Data Entry</p>
          </div>

          <form onSubmit={handleQuickAdd} className="transform-gpu space-y-8 relative z-10 flex-1 flex flex-col justify-center">
            <div className="transform-gpu space-y-3 text-left">
              <label className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-6 italic opacity-40">Lesson Title</label>
              <input 
                type="text"
                placeholder="NEURAL NETWORK INTRODUCTION..."
                className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] py-6 px-8 font-black text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/20 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all shadow-inner text-sm uppercase italic tracking-tighter"
                value={newUnit.title}
                onChange={e => setNewUnit({...newUnit, title: e.target.value})}
              />
            </div>
            
            <div className="transform-gpu flex flex-col sm:flex-row gap-6 pt-2">
              <div className="transform-gpu w-full sm:w-1/3 space-y-3 relative text-left">
                <label className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-6 italic opacity-40">Temporal</label>
                <div className="transform-gpu relative">
                  <Clock className="transform-gpu absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent-color)]" size={20} />
                  <input 
                    type="number"
                    className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl py-5 pl-14 pr-6 font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all shadow-inner text-sm italic"
                    value={newUnit.durationMinutes}
                    onChange={e => setNewUnit({...newUnit, durationMinutes: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="transform-gpu w-full sm:w-2/3 flex items-end">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !newUnit.title}
                  className="transform-gpu w-full h-[64px] bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-xl shadow-[var(--accent-color)]/20 hover:opacity-90 disabled:opacity-20 disabled:grayscale relative overflow-hidden group/btn flex items-center justify-center gap-3 italic"
                >
                   <span className="transform-gpu relative z-10">Initialize Vector</span>
                   <ArrowRight size={16} strokeWidth={3} className="transform-gpu relative z-10 group-hover/btn:translate-x-2 transition-transform" />
                </motion.button>
              </div>
            </div>
          </form>

          <p className="transform-gpu text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] text-center relative z-10 italic opacity-20">
            Metrics sync upon resolution.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};