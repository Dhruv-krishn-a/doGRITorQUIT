"use client";

import React, { useState } from 'react';
import { X, Briefcase, Loader2, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useStudy, studyApi } from '@planner/study-core';
import { toast } from 'sonner';

type ProjectStep = 1 | 2 | 3 | 4;

export function CreateProjectModal() {
  const { closeModal, fetchDashboard } = useStudy();
  const [projectStep, setProjectStep] = useState<ProjectStep>(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const [projectType, setProjectType] = useState('Personal');
  const [priority, setPriority] = useState('Medium');
  const [template, setTemplate] = useState('SDLC');
  const [createPhases, setCreatePhases] = useState(true);
  
  const [weeklyReview, setWeeklyReview] = useState(true);
  const [planningPref, setPlanningPref] = useState('Auto-plan');
  const [weeklyCapacity, setWeeklyCapacity] = useState('');
  const [tShirtSize, setTShirtSize] = useState('M');

  // Handle ESC key to close
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  const handleCreateProject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title) {
      toast.error("Please add a project name to continue.");
      return;
    }
    setLoading(true);
    try {
      await studyApi.createTrack({
        title,
        description,
        type: 'PROJECT',
        targetDate: targetDate || undefined,
        metadata: {
          projectType,
          priority,
          template,
          createPhases,
          weeklyReview,
          planningPref,
          weeklyCapacity,
          tShirtSize,
          phases: template === 'SDLC' ? ['Requirements', 'Design', 'Development', 'Testing', 'Deployment'] :
                  template === 'MVP' ? ['Plan', 'Execute', 'Review'] :
                  template === 'RESEARCH' ? ['Discovery', 'PoC', 'Documentation'] : ['Default']
        }
      } as any);
      toast.success('Project vector initialized');
      fetchDashboard();
      closeModal();
    } catch (err: any) {
      toast.error('Project creation failed');
    } finally {
      setLoading(false);
    }
  };

  const changeStep = (newStep: number) => {
    setDirection(newStep > projectStep ? 1 : -1);
    setProjectStep(newStep as ProjectStep);
  };

  // Animation Configs
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  const slideVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0, filter: 'blur(4px)' }),
    center: { zIndex: 1, x: 0, opacity: 1, filter: 'blur(0px)', transition: springConfig },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 40 : -40, opacity: 0, filter: 'blur(4px)', transition: { duration: 0.2 } })
  };

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const listItemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: springConfig }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-6">
      {/* Pinkish Frosted Glass Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-rose-50/40 backdrop-blur-md"
      />
      
      {/* Premium Glass Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={springConfig}
        className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(244,63,94,0.15)] overflow-hidden border border-rose-100/50 transform-gpu antialiased flex flex-col max-h-[90vh]"
      >
        {/* Subtle Internal Gradient Canvas (Rose/Pink for Projects) */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
           <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-rose-200/30 rounded-full blur-[80px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-pink-100/30 rounded-full blur-[80px]" />
        </div>

        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="flex justify-between items-start p-8 md:p-10 pb-4 shrink-0 relative z-10">
            <div className="flex gap-4 items-center">
              <div className="p-3.5 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl shadow-lg shadow-rose-200">
                <Briefcase size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">New Project</h2>
                <p className="text-rose-600 font-bold text-xs uppercase tracking-[0.2em] mt-1">Execution & Delivery Vector</p>
              </div>
            </div>
            <button 
              onClick={closeModal} 
              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm hover:shadow-md rounded-xl transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </header>

          {/* Form Content Area */}
          <div className="px-8 md:px-10 flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-4">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/60 backdrop-blur-md py-4 rounded-b-2xl z-20 -mx-2 px-2 border-b border-rose-100/50">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Step {projectStep} of 4</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${step === projectStep ? 'w-6 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : step < projectStep ? 'w-2 bg-rose-300' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>
            </div>

            <div className="min-h-[280px]">
              <AnimatePresence custom={direction} mode="wait">
                {projectStep === 1 && (
                  <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Project Name <span className="text-rose-500">*</span></label>
                      <input autoFocus required className="w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-black text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all placeholder:text-slate-300 shadow-inner text-sm" placeholder="Project codename..." value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Outcome Goal <span className="text-rose-500">*</span></label>
                      <input required className="w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all placeholder:text-slate-300 shadow-inner text-sm" placeholder="What does success look like?" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Type</label>
                        <select className="w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 outline-none appearance-none transition-all shadow-inner text-sm" value={projectType} onChange={e => setProjectType(e.target.value)}>
                          <option>Personal</option>
                          <option>Freelance</option>
                          <option>Company</option>
                          <option>Research</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Priority</label>
                        <select className="w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 focus:border-rose-400 outline-none appearance-none transition-all shadow-inner text-sm" value={priority} onChange={e => setPriority(e.target.value)}>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {projectStep === 2 && (
                  <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Select Execution Framework</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'SDLC', name: 'Standard SDLC', desc: 'Requirements to Deploy' },
                        { id: 'MVP', name: 'MVP Spike', desc: 'Speed-focused execution' },
                        { id: 'RESEARCH', name: 'Research Spike', desc: 'PoC and Discovery' },
                        { id: 'CUSTOM', name: 'Custom (Blank)', desc: 'Full manual control' }
                      ].map(t => {
                        const isActive = template === t.id;
                        return (
                          <motion.div 
                            key={t.id} 
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTemplate(t.id)} 
                            className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                              isActive 
                                ? 'bg-rose-50 border-rose-400 shadow-[0_8px_20px_rgba(244,63,94,0.15)]' 
                                : 'bg-white border-slate-200 hover:border-rose-300 shadow-sm'
                            }`}
                          >
                            <h3 className={`text-sm font-black uppercase tracking-wide mb-1 ${isActive ? 'text-rose-700' : 'text-slate-800'}`}>{t.name}</h3>
                            <p className={`text-[10px] font-bold leading-relaxed ${isActive ? 'text-rose-600/70' : 'text-slate-500'}`}>{t.desc}</p>
                            
                            {/* Magic selection indicator */}
                            <AnimatePresence>
                              {isActive && (
                                <motion.div 
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute top-4 right-4 text-rose-500 bg-white rounded-full p-0.5 shadow-sm"
                                >
                                  <Check size={14} strokeWidth={4} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {projectStep === 3 && (
                  <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Phases Preview</label>
                    <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3 bg-white/80 p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                      {(template === 'SDLC' ? ['Requirements', 'Design', 'Development', 'Testing', 'Deployment'] :
                        template === 'MVP' ? ['Plan', 'Execute', 'Review'] :
                        template === 'RESEARCH' ? ['Discovery', 'PoC', 'Documentation'] : ['Default Phase']
                      ).map((p, idx) => (
                        <motion.div key={p} variants={listItemVariants} className="flex items-center gap-4 text-sm font-black text-slate-800 bg-rose-50/30 p-4 rounded-2xl border border-rose-100">
                          <span className="text-[10px] text-rose-500 font-black w-4">{idx + 1}.</span>
                          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0" /> 
                          {p}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {projectStep === 4 && (
                  <motion.div key="step4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Cognitive Cadence</label>
                      <motion.div 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`flex items-center justify-between p-6 border rounded-[2rem] cursor-pointer transition-all duration-300 ${weeklyReview ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white/80 border-slate-200 shadow-sm'}`} 
                        onClick={() => setWeeklyReview(!weeklyReview)}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-rose-500">
                            <Sparkles size={18} className={weeklyReview ? "animate-pulse" : "opacity-50 grayscale"} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">Automated Weekly Review</h4>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Schedule reflection tasks automatically.</p>
                          </div>
                        </div>
                        {/* Animated Custom Toggle */}
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${weeklyReview ? 'bg-rose-500' : 'bg-slate-300'}`}>
                          <motion.div 
                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ x: weeklyReview ? 24 : 0 }}
                            transition={springConfig}
                          />
                        </div>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Weekly Capacity</label>
                        <input type="number" placeholder="Hrs/week" className="w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-black text-slate-800 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all shadow-inner text-sm placeholder:text-slate-300" value={weeklyCapacity} onChange={e => setWeeklyCapacity(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">T-Shirt Size</label>
                        <select className="w-full bg-white/80 border border-slate-200 rounded-[1.5rem] px-6 py-4 font-black text-slate-800 focus:border-rose-400 outline-none appearance-none transition-all shadow-inner text-sm" value={tShirtSize} onChange={e => setTShirtSize(e.target.value)}>
                          <option value="S">Small</option>
                          <option value="M">Medium</option>
                          <option value="L">Large</option>
                          <option value="XL">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center gap-4 p-8 md:p-10 pt-6 shrink-0 relative z-10">
            {projectStep > 1 ? (
              <button 
                type="button" 
                onClick={() => changeStep(projectStep - 1)} 
                className="flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:bg-rose-50 hover:text-rose-800 transition-all flex justify-center items-center gap-2 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
              </button>
            ) : <div className="flex-1" />} {/* Spacer */}
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading} 
              type="button" 
              onClick={() => projectStep < 4 ? changeStep(projectStep + 1) : handleCreateProject()} 
              className="flex-[2] bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale relative overflow-hidden group/btn"
            >
              {/* CSS Shimmer/Glass Reflection Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
              
              {loading ? <Loader2 className="animate-spin relative z-10" size={16} /> : projectStep === 4 ? <Briefcase size={16} className="relative z-10" /> : null}
              <span className="relative z-10">{loading ? 'Initializing...' : projectStep < 4 ? 'Next Phase' : 'Create Project'}</span>
              {projectStep < 4 && <ArrowRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
