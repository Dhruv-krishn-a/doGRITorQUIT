// packages/dashboard-ui-web/src/components/today/QuickCapture.tsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowRight, 
  Layout, 
  CheckCircle2, 
  Briefcase, 
  BookOpen, 
  X,
  Zap,
  Loader2
} from 'lucide-react';

interface QuickCaptureProps {
  onCapture: (title: string, domain: 'PLAN' | 'PROJECT' | 'COURSE') => Promise<void>;
}

export function QuickCapture({ onCapture }: QuickCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState<'PLAN' | 'PROJECT' | 'COURSE'>('PLAN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsSubmitting(true);
    try {
      await onCapture(title, domain);
      setTitle('');
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="transform-gpu mb-8 relative z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="transform-gpu w-full py-5 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(244,63,94,0.1)] hover:border-rose-100 transition-all flex items-center justify-center gap-4 group"
          >
            <div className="transform-gpu p-2 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
              <Plus size={18} />
            </div>
            <span className="transform-gpu text-slate-400 font-bold text-sm tracking-tight group-hover:text-slate-800 transition-colors">Capture new objective...</span>
            <div className="transform-gpu ml-auto mr-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300 group-hover:text-rose-400 transition-colors">Quick Capture</div>
          </motion.button>
        ) : (
          <motion.form 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="transform-gpu bg-white border-2 border-rose-200 rounded-[2.5rem] p-4 shadow-[0_20px_50px_rgba(244,63,94,0.15)] relative overflow-hidden"
          >
            <div className="transform-gpu absolute top-0 right-0 p-4">
               <button onClick={() => setIsOpen(false)} className="transform-gpu p-2 text-slate-300 hover:text-rose-500 transition-colors">
                  <X size={16} />
               </button>
            </div>

            <div className="transform-gpu flex flex-col gap-4">
              <div className="transform-gpu flex items-center gap-3 px-4 pt-2">
                 <div className="transform-gpu p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
                    <Zap size={18} fill="currentColor" />
                 </div>
                 <input 
                    autoFocus
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="transform-gpu flex-1 bg-transparent border-none outline-none text-xl font-bold text-slate-800 placeholder:text-slate-200"
                 />
              </div>

              <div className="transform-gpu flex items-center justify-between gap-4 p-2 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                 <div className="transform-gpu flex gap-2">
                    {[
                      { id: 'PLAN', icon: <CheckCircle2 size={14} />, label: 'Plan' },
                      { id: 'PROJECT', icon: <Briefcase size={14} />, label: 'Project' },
                      { id: 'COURSE', icon: <BookOpen size={14} />, label: 'Course' }
                    ].map(item => (
                      <button 
                        key={item.id}
                        type="button"
                        onClick={() => setDomain(item.id as any)}
                        className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest transition-all ${domain === item.id ? 'bg-white text-rose-500 shadow-sm border border-rose-100/50' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                 </div>

                 <button 
                    disabled={isSubmitting || !title}
                    type="submit"
                    className="transform-gpu p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                 >
                    {isSubmitting ? <Loader2 size={18} className="transform-gpu animate-spin" /> : <ArrowRight size={18} />}
                 </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
