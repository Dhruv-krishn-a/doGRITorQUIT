"use client";

import React, { useState } from 'react';
import { Briefcase, Loader2, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useStudy, studyApi } from '@gritorquit/study-core';
import { toast } from 'sonner';
import Modal from './Modal';

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

  const handleCreateProject = async () => {
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
      toast.success('Project path initialized');
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
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="New Project"
      panelClassName="!max-w-2xl"
    >
      <div className="transform-gpu flex flex-col h-full">
        {/* Step Indicators */}
        <div className="transform-gpu flex items-center justify-between mb-8 sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-md py-4 z-20 border-b border-[var(--border-color)]">
          <span className="transform-gpu text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40">Step {projectStep} of 4</span>
          <div className="transform-gpu flex gap-1.5">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${step === projectStep ? 'w-8 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : step < projectStep ? 'w-2 bg-rose-300' : 'w-2 bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`} />
            ))}
          </div>
        </div>

        <div className="transform-gpu min-h-[350px]">
          <AnimatePresence custom={direction} mode="wait">
            {projectStep === 1 && (
              <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="transform-gpu space-y-8">
                <div className="transform-gpu space-y-4">
                  <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">Project Name <span className="transform-gpu text-rose-500">*</span></label>
                  <input autoFocus required className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 font-black text-[var(--text-primary)] focus:border-rose-400 outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic uppercase tracking-tight" placeholder="Project codename..." value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                
                <div className="transform-gpu space-y-4">
                  <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">Outcome Goal <span className="transform-gpu text-rose-500">*</span></label>
                  <input required className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 font-black text-[var(--text-primary)] focus:border-rose-400 outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic uppercase tracking-tight" placeholder="What does success look like?" value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="transform-gpu grid grid-cols-2 gap-6">
                  <div className="transform-gpu space-y-4">
                    <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">Type</label>
                    <select className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] px-6 py-5 font-black text-[var(--text-primary)] focus:border-rose-400 outline-none appearance-none transition-all shadow-inner text-sm italic cursor-pointer" value={projectType} onChange={e => setProjectType(e.target.value)}>
                      <option>Personal</option>
                      <option>Freelance</option>
                      <option>Company</option>
                      <option>Research</option>
                    </select>
                  </div>
                  <div className="transform-gpu space-y-4">
                    <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">Priority</label>
                    <select className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] px-6 py-5 font-black text-[var(--text-primary)] focus:border-rose-400 outline-none appearance-none transition-all shadow-inner text-sm italic cursor-pointer" value={priority} onChange={e => setPriority(e.target.value)}>
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
              <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="transform-gpu space-y-6">
                <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">Select Execution Framework</label>
                <div className="transform-gpu grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                          isActive 
                            ? 'bg-rose-500/5 border-rose-500/40 shadow-xl' 
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]/30'
                        }`}
                      >
                        <h3 className={`text-sm font-black uppercase tracking-wide mb-2 italic ${isActive ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>{t.name}</h3>
                        <p className={`text-[10px] font-bold leading-relaxed italic ${isActive ? 'text-rose-500/70' : 'text-[var(--text-secondary)] opacity-60'}`}>{t.desc}</p>
                        
                        {isActive && (
                            <div className="transform-gpu absolute top-4 right-4 text-rose-500 bg-rose-500/10 rounded-full p-1 shadow-sm">
                              <Check size={12} strokeWidth={4} />
                            </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {projectStep === 3 && (
              <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="transform-gpu space-y-6">
                <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">Phases Preview</label>
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="transform-gpu space-y-3 bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-inner">
                  {(template === 'SDLC' ? ['Requirements', 'Design', 'Development', 'Testing', 'Deployment'] :
                    template === 'MVP' ? ['Plan', 'Execute', 'Review'] :
                    template === 'RESEARCH' ? ['Discovery', 'PoC', 'Documentation'] : ['Default Phase']
                  ).map((p, idx) => (
                    <motion.div key={p} variants={listItemVariants} className="transform-gpu flex items-center gap-4 text-xs font-black uppercase italic text-[var(--text-primary)] bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
                      <span className="transform-gpu text-rose-500 w-4">{idx + 1}.</span>
                      <div className="transform-gpu w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0" /> 
                      {p}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {projectStep === 4 && (
              <motion.div key="step4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="transform-gpu space-y-8">
                <div className="transform-gpu space-y-4">
                  <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">Cognitive Cadence</label>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center justify-between p-8 border rounded-[2.5rem] cursor-pointer transition-all duration-300 ${weeklyReview ? 'bg-rose-500/5 border-rose-500/30' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-inner'}`} 
                    onClick={() => setWeeklyReview(!weeklyReview)}
                  >
                    <div className="transform-gpu flex gap-5 items-center">
                      <div className={`transform-gpu p-4 rounded-2xl shadow-sm transition-all ${weeklyReview ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] opacity-40'}`}>
                        <Sparkles size={20} className={weeklyReview ? "animate-pulse" : ""} />
                      </div>
                      <div>
                        <h4 className="transform-gpu text-sm font-black text-[var(--text-primary)] uppercase italic">Automated Weekly Review</h4>
                        <p className="transform-gpu text-[10px] text-[var(--text-secondary)] font-bold mt-1 uppercase italic opacity-50">Schedule reflection tasks automatically.</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${weeklyReview ? 'bg-rose-500' : 'bg-[var(--bg-card)] border border-[var(--border-color)]'}`}>
                      <motion.div 
                        className="transform-gpu w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: weeklyReview ? 24 : 0 }}
                        transition={springConfig}
                      />
                    </div>
                  </motion.div>
                </div>

                <div className="transform-gpu grid grid-cols-2 gap-6">
                  <div className="transform-gpu space-y-4">
                    <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">Weekly Capacity</label>
                    <input type="number" placeholder="Hrs/week" className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 font-black text-[var(--text-primary)] focus:border-rose-400 outline-none transition-all shadow-inner text-sm italic" value={weeklyCapacity} onChange={e => setWeeklyCapacity(e.target.value)} />
                  </div>
                  <div className="transform-gpu space-y-4">
                    <label className="transform-gpu text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 italic opacity-40">T-Shirt Size</label>
                    <select className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] px-8 py-5 font-black text-[var(--text-primary)] focus:border-rose-400 outline-none appearance-none transition-all shadow-inner text-sm italic cursor-pointer" value={tShirtSize} onChange={e => setTShirtSize(e.target.value)}>
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

        {/* Footer Controls */}
        <div className="transform-gpu flex items-center gap-6 mt-10 pt-10 border-t border-[var(--border-color)] shrink-0">
          {projectStep > 1 ? (
            <button 
              type="button" 
              onClick={() => changeStep(projectStep - 1)} 
              className="transform-gpu flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all flex justify-center items-center gap-2 group italic active:scale-95 border border-transparent hover:border-[var(--border-color)]"
            >
              <ArrowLeft size={16} className="transform-gpu group-hover:-translate-x-1 transition-transform" /> Back
            </button>
          ) : <div className="transform-gpu flex-1" />}
          
          <button 
            disabled={loading} 
            type="button" 
            onClick={() => projectStep < 4 ? changeStep(projectStep + 1) : handleCreateProject()} 
            className="transform-gpu flex-[2] bg-gradient-to-r from-rose-500 to-pink-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 italic relative overflow-hidden"
          >
            {loading ? <Loader2 className="transform-gpu animate-spin" size={18} /> : projectStep === 4 ? <Briefcase size={18} /> : null}
            <span>{loading ? 'Initializing...' : projectStep < 4 ? 'Next Phase' : 'Commit Project'}</span>
            {projectStep < 4 && <ArrowRight size={16} className="transform-gpu group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </div>
    </Modal>
  );
}
