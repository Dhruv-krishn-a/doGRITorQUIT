'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BrainCircuit, CheckCircle2, BarChart3, LayoutDashboard,
  Sparkles, Zap, Flame, Play, User, Check, Moon, Sun, Monitor,
  ChevronLeft, BookOpen, Brain, Github, RefreshCw, Palette, ChevronDown, ListTodo,
  CreditCard, MessageSquare
} from 'lucide-react';
import { GritioLogo } from '@gritorquit/dashboard-ui-web';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function AppDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const scrollToLabel = (label: string) => {
    if (tlRef.current) {
      const labelTime = tlRef.current.labels[label];
      if (labelTime !== undefined && ScrollTrigger.maxScroll(window)) {
        const st = tlRef.current.scrollTrigger;
        if (st) {
          const scrollPos = st.start + (st.end - st.start) * (labelTime / tlRef.current.duration());
          window.scrollTo({ top: scrollPos, behavior: 'smooth' });
        }
      }
    }
  };

  useIsomorphicLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      
      mm.add('(min-width: 1024px)', () => {
        // 1. Initial State
        gsap.set('.project-view', { opacity: 0, scale: 0.95, display: 'none' }); 
        gsap.set('.notes-view', { opacity: 0, scale: 0.95, display: 'none' }); 
        gsap.set('.today-view', { opacity: 0, scale: 0.95, display: 'none' }); 
        gsap.set('.insights-view', { opacity: 0, scale: 0.95, display: 'none' });
        gsap.set('.ai-modal', { opacity: 1, scale: 1, y: 0 });
        gsap.set('.app-screen', { x: '0%' });
        
        gsap.set('.text-step-2, .text-step-3, .text-step-4, .text-step-5', { opacity: 0, y: 20, filter: 'blur(8px)' });
        gsap.set('.text-step-1', { opacity: 1, y: 0, filter: 'blur(0px)' });
        
        // 2. Main Pinned Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=7000',
            pin: true,
            scrub: 1,
            pinType: 'fixed',
          }
        });

        tlRef.current = tl;

        // STEP 1: AI Architect (Creates Project)
        tl.addLabel('step1')
          .to('.ai-text-input', { width: '100%', duration: 2, ease: 'steps(30)' })
          .to('.ai-generate-btn', { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 }, '+=0.5')
          .to('.ai-progress', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
          
          // Transition to Project Tracker
          .to('.text-step-1', { opacity: 0, y: -20, filter: 'blur(8px)', duration: 0.5 }, '+=0.2')
          .to('.text-step-2', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, '<')
          .to('.ai-modal', { opacity: 0, scale: 0.9, y: -20, duration: 0.5 }, '<')
          .set('.project-view', { display: 'flex' })
          .to('.project-view', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }, '<')
          
          // Activate nav-item-project
          .to('.nav-item-project', { opacity: 1, color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.05)', duration: 0.3 }, '<')
          .to('.task-progress', { width: '75%', duration: 1, ease: 'power2.out' }, '+=0.5')
          
          // STEP 2: Notes
          .addLabel('step2')
          .to('.text-step-2', { opacity: 0, y: -20, filter: 'blur(8px)', duration: 0.5 }, '+=1')
          .to('.text-step-3', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, '<')
          .to('.nav-item-project', { opacity: 0.6, color: 'var(--text-secondary)', backgroundColor: 'transparent', duration: 0.3 }, '<')
          .to('.nav-item-notes', { opacity: 1, color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.05)', duration: 0.3 }, '<')
          
          .to('.project-view', { opacity: 0, x: -50, duration: 0.5 }, '<')
          .set('.project-view', { display: 'none' })
          .set('.notes-view', { display: 'flex', x: 50, opacity: 0 })
          .to('.notes-view', { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '<')
          .fromTo('.notes-text-1', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power1.out' }, '+=0.3')
          .fromTo('.notes-text-2', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power1.out' }, '+=0.2')

          // STEP 3: Today
          .addLabel('step3')
          .to('.text-step-3', { opacity: 0, y: -20, filter: 'blur(8px)', duration: 0.5 }, '+=1')
          .to('.text-step-4', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, '<')
          .to('.nav-item-notes', { opacity: 0.6, color: 'var(--text-secondary)', backgroundColor: 'transparent', duration: 0.3 }, '<')
          .to('.nav-item-today', { opacity: 1, color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.05)', duration: 0.3 }, '<')
          
          .to('.notes-view', { opacity: 0, x: -50, duration: 0.5 }, '<')
          .set('.notes-view', { display: 'none' })
          .set('.today-view', { display: 'flex', x: 50, opacity: 0 })
          .to('.today-view', { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '<')
          .fromTo('.today-task-1', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, '+=0.3')
          .fromTo('.today-task-2', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, '+=0.2')

          // STEP 4: Insights
          .addLabel('step4')
          .to('.text-step-4', { opacity: 0, y: -20, filter: 'blur(8px)', duration: 0.5 }, '+=1')
          .to('.text-step-5', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, '<')
          .to('.nav-item-today', { opacity: 0.6, color: 'var(--text-secondary)', backgroundColor: 'transparent', duration: 0.3 }, '<')
          .to('.nav-item-insights', { opacity: 1, color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.05)', duration: 0.3 }, '<')
          
          .to('.today-view', { opacity: 0, x: -50, duration: 0.5 }, '<')
          .set('.today-view', { display: 'none' })
          .set('.insights-view', { display: 'flex', x: 50, opacity: 0 })
          .to('.insights-view', { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '<')
          .fromTo('.growth-bar', { width: '0%' }, { width: '65%', duration: 1, ease: 'power2.out' }, '+=0.5')
          
          // STEP 5: Adapt (Theme Switching)
          .addLabel('step5')
          // Change to Light Theme
          .to('.theme-dot-dark', { opacity: 0.5, scale: 0.8, duration: 0.3 }, '+=1')
          .to('.theme-dot-light', { opacity: 1, scale: 1.1, duration: 0.3 }, '<')
          .to('.mock-app-container', { 
            '--bg-primary': '#f8fafc',
            '--bg-secondary': '#f1f5f9',
            '--bg-card': '#ffffff',
            '--text-primary': '#0f172a',
            '--text-secondary': '#64748b',
            '--border-color': '#e2e8f0',
            duration: 0.8 
          }, '<')

          // Change to Noir Theme
          .to('.theme-dot-light', { opacity: 0.5, scale: 0.8, duration: 0.3 }, '+=1')
          .to('.theme-dot-noir', { opacity: 1, scale: 1.1, duration: 0.3 }, '<')
          .to('.mock-app-container', { 
            '--bg-primary': '#000000',
            '--bg-secondary': '#0a0a0a',
            '--bg-card': '#111111',
            '--text-primary': '#ffffff',
            '--text-secondary': '#888888',
            '--border-color': '#222222',
            duration: 0.8 
          }, '<');
      });

      // Mobile
      mm.add('(max-width: 1023px)', () => {
        gsap.utils.toArray<HTMLElement>('.mobile-step').forEach(step => {
          gsap.from(step, {
            opacity: 0, y: 30, duration: 1,
            scrollTrigger: { trigger: step, start: 'top 85%' }
          });
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full">
      <section ref={containerRef} className="relative z-10 bg-[var(--bg-primary)] border-y border-[var(--border-color)]">
      
      {/* Desktop */}
      <div className="hidden lg:flex w-full h-screen overflow-hidden bg-[var(--bg-primary)] relative">
        
        {/* Left Side: Animated Text Overlay */}
        <div className="w-1/3 h-full flex flex-col justify-center px-8 lg:px-16 relative z-10">
          <div className="relative w-full h-[400px]">
            
            <div className="text-step-1 absolute inset-0 flex flex-col justify-center pointer-events-none">
               <div className="text-[10px] font-black tracking-[0.4em] text-[var(--accent-color)] uppercase mb-3">Step 1</div>
               <h2 className="text-5xl font-black italic tracking-tighter mb-4 text-[var(--text-primary)]">BRAIN DUMP</h2>
               <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 Offload your ideas into our AI Architect. Watch it instantly structure your chaos into an actionable Project Tracker.
               </p>
            </div>
            
            <div className="text-step-2 absolute inset-0 flex flex-col justify-center pointer-events-none">
               <div className="text-[10px] font-black tracking-[0.4em] text-[var(--accent-color)] uppercase mb-3">Step 2</div>
               <h2 className="text-5xl font-black italic tracking-tighter mb-4 text-[var(--text-primary)]">BUILD</h2>
               <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 Manage active tasks, milestones, and project scope directly inside your generated Project Tracker view.
               </p>
            </div>
            
            <div className="text-step-3 absolute inset-0 flex flex-col justify-center pointer-events-none">
               <div className="text-[10px] font-black tracking-[0.4em] text-[var(--accent-color)] uppercase mb-3">Step 3</div>
               <h2 className="text-5xl font-black italic tracking-tighter mb-4 text-[var(--text-primary)]">SYNTHESIZE</h2>
               <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 Transition to the Notes view. Connect dots, drop in references, and synthesize your knowledge seamlessly.
               </p>
            </div>

            <div className="text-step-4 absolute inset-0 flex flex-col justify-center pointer-events-none">
               <div className="text-[10px] font-black tracking-[0.4em] text-[var(--accent-color)] uppercase mb-3">Step 4</div>
               <h2 className="text-5xl font-black italic tracking-tighter mb-4 text-[var(--text-primary)]">EXECUTE</h2>
               <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 Jump into Today. Tackle your daily checklist, block out focus sessions, and execute your daily action plan.
               </p>
            </div>

            <div className="text-step-5 absolute inset-0 flex flex-col justify-center pointer-events-none">
               <div className="text-[10px] font-black tracking-[0.4em] text-[var(--accent-color)] uppercase mb-3">Step 5</div>
               <h2 className="text-5xl font-black italic tracking-tighter mb-4 text-[var(--text-primary)]">OPTIMIZE</h2>
               <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 Analyze your performance in the Insights view. Adapt the platform's theme to match your environment.
               </p>
            </div>
          </div>
        </div>

        {/* Right Side: Mock App Container */}
        <div className="w-2/3 h-full p-12 lg:p-24 flex items-center justify-center relative">
           {/* Mock App Window */}
           <div 
             className="mock-app-container w-full h-full max-h-[800px] rounded-[2rem] border border-[var(--border-color)] overflow-hidden flex shadow-2xl relative transition-colors duration-300"
             style={{
               '--bg-primary': '#0a0a0a',
               '--bg-secondary': '#141414',
               '--bg-card': '#111111',
               '--text-primary': '#ffffff',
               '--text-secondary': '#888888',
               '--border-color': '#222222',
               backgroundColor: 'var(--bg-primary)'
             } as React.CSSProperties}
           >
              
              {/* Sidebar */}
              <div className="w-64 border-r border-[var(--border-color)] p-6 flex flex-col justify-between bg-[var(--bg-card)]/50 backdrop-blur-md relative z-30">
                 <div>
                    <div className="flex items-center justify-between mb-8 px-2">
                       <GritioLogo size="sm" withText={true} />
                       <div className="p-2 rounded-xl text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] opacity-50">
                          <ChevronLeft size={16} />
                       </div>
                    </div>
                    
                    <div className="space-y-0.5">
                       {/* Today */}
                       <div className="nav-item-today cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm transition-all opacity-60">
                          <Zap size={18} className="shrink-0" /> Today
                       </div>
                       {/* Notes */}
                       <div className="nav-item-notes cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm transition-all opacity-60">
                          <BookOpen size={18} className="shrink-0" /> Notes
                       </div>
                       
                       {/* Study Paths (Expanded) */}
                       <div className="cursor-pointer flex items-center justify-between px-4 py-3 rounded-xl text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm transition-all mt-2">
                          <div className="flex items-center gap-4"><Brain size={18} className="shrink-0" /> Study Paths</div>
                          <ChevronDown size={14} className="opacity-50" />
                       </div>
                       <div className="pl-11 space-y-1">
                          <div className="nav-item-project cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px] transition-all opacity-60">
                             <Github size={14} className="shrink-0" /> Project Tracker
                          </div>
                          <div className="cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px] transition-all opacity-60">
                             <BookOpen size={14} className="shrink-0" /> Course Tracker
                          </div>
                          <div className="cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px] transition-all opacity-60">
                             <RefreshCw size={14} className="shrink-0" /> Media Tracker
                          </div>
                          <div className="cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px] transition-all opacity-60">
                             <Sparkles size={14} className="shrink-0" /> Roadmap Tracker
                          </div>
                       </div>

                       {/* Daily Checklist */}
                       <div className="cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm transition-all mt-2 opacity-60">
                          <ListTodo size={18} className="shrink-0" /> Daily Checklist
                       </div>

                       {/* Insights */}
                       <div className="nav-item-insights cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm transition-all mt-2 opacity-60">
                          <LayoutDashboard size={18} className="shrink-0" /> Insights
                       </div>
                       
                       {/* Subscription */}
                       <div className="cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm transition-all mt-2 opacity-60">
                          <CreditCard size={18} className="shrink-0" /> Subscription
                       </div>
                       
                       {/* Feedback */}
                       <div className="cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-secondary)] font-black uppercase tracking-widest text-sm transition-all opacity-60">
                          <MessageSquare size={18} className="shrink-0" /> Feedback
                       </div>
                    </div>
                 </div>

                 <div className="border-t border-[var(--border-color)]/30 pt-6 mt-6">
                    <div className="flex items-center gap-4 group cursor-pointer">
                       <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)]/10 border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-color)] text-xs font-black shadow-inner shrink-0 group-hover:scale-105 transition-transform">D</div>
                       <div className="min-w-0">
                          <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight truncate leading-none">Dhruv K.</p>
                          <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1.5 opacity-40 truncate">System Hub</p>
                       </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 opacity-70">
                       <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)] shadow-inner">
                          <RefreshCw size={16} className="text-[var(--text-secondary)]" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] leading-none">Smart Sync</p>
                          <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1.5 opacity-60">Operational</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Main Screen Area */}
              <div className="flex-1 relative overflow-hidden bg-[var(--bg-primary)] flex flex-col">
                 
                 {/* Fake Header inside Mock App */}
                 <div className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-20">
                    <div className="flex items-center gap-10">

                    </div>
                    <div className="flex items-center gap-4">
                       <div className="relative group cursor-pointer" onClick={() => scrollToLabel('step5')}>
                          <div className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl transition-all shadow-sm flex items-center justify-center">
                             <Palette size={18} />
                          </div>
                          <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex gap-3 justify-center">
                             <div className="theme-dot-dark w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 opacity-100 scale-110 shadow-lg"><Moon size={10} /></div>
                             <div className="theme-dot-light w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 opacity-50 scale-100"><Sun size={10} /></div>
                             <div className="theme-dot-noir w-6 h-6 rounded-full bg-black border border-neutral-800 flex items-center justify-center text-neutral-400 opacity-50 scale-100"><Monitor size={10} /></div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shadow-sm cursor-pointer hover:border-[var(--accent-color)] transition-all">
                          <div className="w-8 h-8 rounded-full border border-[var(--border-color)] bg-gradient-to-tr from-[var(--accent-color)] to-purple-500 shadow-sm flex-shrink-0" />
                          <div className="flex flex-col items-start hidden lg:flex">
                             <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tighter leading-tight">Dhruv K.</span>
                             <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5 leading-none">Cloud Sync</span>
                          </div>
                          <ChevronDown size={14} className="text-[var(--text-secondary)] ml-1" />
                       </div>
                    </div>
                 </div>

                 {/* Scrollable Main Content Wrapper */}
                 <div className="flex-1 relative overflow-hidden flex flex-col z-10">
                    
                    {/* Step 1: AI Modal Overlay (Brain Dump) */}
                    <div className="ai-modal absolute inset-0 z-30 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-xl">
                       <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl w-[90%] max-w-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/10 blur-[50px] rounded-full pointer-events-none" />
                          <div className="flex items-center gap-3 mb-6 text-[var(--accent-color)]">
                             <BrainCircuit size={24} />
                             <h3 className="font-black italic uppercase tracking-[0.3em] text-sm">AI Architect</h3>
                          </div>
                          
                          <div className="space-y-4 mb-6">
                             <div className="h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center px-4 overflow-hidden">
                                <div className="ai-text-input h-2 bg-[var(--text-secondary)]/30 rounded-full w-0" />
                             </div>
                          </div>

                          <div className="ai-generate-btn w-full py-4 rounded-xl bg-[var(--accent-color)] text-white font-black italic tracking-widest text-center uppercase shadow-lg shadow-[var(--accent-color)]/20">
                             Generate Project
                          </div>

                          <div className="mt-6 h-1 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                             <div className="ai-progress h-full bg-[var(--accent-color)] w-0 rounded-full" />
                          </div>
                       </div>
                    </div>

                    {/* Step 2: Project Tracker View */}
                    <div className="project-view absolute inset-0 flex-col p-8 lg:p-12 hidden">
                       <div className="max-w-3xl w-full mx-auto">
                          <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)]">
                                <Github size={24} />
                             </div>
                             <div>
                                <h2 className="text-3xl font-black italic tracking-tighter text-[var(--text-primary)]">Machine Learning Mastery</h2>
                                <p className="text-[var(--text-secondary)] font-bold tracking-widest uppercase text-[10px] mt-1">Project Tracker • Active</p>
                             </div>
                          </div>
                          
                          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-xl">
                              <div className="flex items-center gap-3 mb-6">
                                 <CheckCircle2 className="text-[var(--accent-color)]" size={20} />
                                 <h3 className="font-black tracking-widest text-sm uppercase">Active Tasks</h3>
                              </div>
                              <div className="space-y-4">
                                 <div className="h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center px-4">
                                    <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-color)] mr-4 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[var(--accent-color)]" /></div>
                                    <span className="text-sm font-bold text-[var(--text-primary)]">Complete Neural Networks Module (CS231n)</span>
                                 </div>
                                 <div className="h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center px-4">
                                    <div className="w-4 h-4 rounded-full border-2 border-[var(--text-secondary)] mr-4" />
                                    <span className="text-sm font-bold text-[var(--text-primary)]">Implement Backpropagation in Python</span>
                                 </div>
                                 <div className="h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center px-4 opacity-50">
                                    <div className="w-4 h-4 rounded-full border-2 border-[var(--text-secondary)] mr-4 flex items-center justify-center bg-[var(--text-secondary)]">
                                       <Check size={10} className="text-[var(--bg-primary)]" />
                                    </div>
                                    <span className="text-sm font-bold text-[var(--text-secondary)] line-through">Review Linear Algebra Flashcards</span>
                                 </div>
                              </div>

                              <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
                                 <div className="flex justify-between text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                                    <span>Progress</span>
                                    <span className="text-[var(--text-primary)]">75%</span>
                                 </div>
                                 <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                    <div className="task-progress h-full bg-[var(--accent-color)] w-0 rounded-full" />
                                 </div>
                              </div>
                          </div>
                       </div>
                    </div>

                    {/* Step 3: Notes View */}
                    <div className="notes-view absolute inset-0 flex-col p-8 lg:p-12 hidden">
                       <div className="max-w-3xl w-full mx-auto">
                          <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <BookOpen size={24} />
                             </div>
                             <div>
                                <h2 className="text-3xl font-black italic tracking-tighter text-[var(--text-primary)]">Neural Networks Notes</h2>
                                <p className="text-[var(--text-secondary)] font-bold tracking-widest uppercase text-[10px] mt-1">Knowledge Base • Edited Just Now</p>
                             </div>
                          </div>
                          
                          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-10 shadow-xl min-h-[400px]">
                              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Gradient Descent Optimization</h1>
                              <div className="space-y-6 text-[var(--text-secondary)] text-sm leading-loose">
                                 <p className="notes-text-1 opacity-0">Gradient descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function. To find a local minimum, we take steps proportional to the negative of the gradient of the function at the current point.</p>
                                 <p className="notes-text-2 opacity-0">Adam (Adaptive Moment Estimation) optimizer computes adaptive learning rates for each parameter. In addition to storing an exponentially decaying average of past squared gradients like AdaGrad and RMSProp...</p>
                                 
                                 <div className="mt-8 p-6 rounded-xl bg-[var(--bg-secondary)] border-l-4 border-blue-500 text-[var(--text-primary)]">
                                    <p className="font-bold mb-2">Key Hyperparameters to Tune:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                       <li>Learning Rate (α)</li>
                                       <li>Batch Size</li>
                                       <li>Number of Epochs</li>
                                    </ul>
                                 </div>
                              </div>
                          </div>
                       </div>
                    </div>

                    {/* Step 4: Today View */}
                    <div className="today-view absolute inset-0 flex-col p-8 lg:p-12 hidden">
                       <div className="max-w-3xl w-full mx-auto">
                          <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Zap size={24} />
                             </div>
                             <div>
                                <h2 className="text-3xl font-black italic tracking-tighter text-[var(--text-primary)]">Today's Action Plan</h2>
                                <p className="text-[var(--text-secondary)] font-bold tracking-widest uppercase text-[10px] mt-1">Focus Mode • 3 Tasks Remaining</p>
                             </div>
                          </div>
                          
                          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-xl">
                              <div className="space-y-4">
                                 <div className="today-task-1 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-md border-2 border-amber-500 flex items-center justify-center mt-0.5" />
                                    <div>
                                       <h4 className="text-[var(--text-primary)] font-bold mb-2">Deep Work Session: Neural Networks</h4>
                                       <div className="flex gap-2">
                                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">09:00 AM</span>
                                          <span className="px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] font-black uppercase">High Priority</span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="today-task-2 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-md border-2 border-[var(--text-secondary)] flex items-center justify-center mt-0.5" />
                                    <div>
                                       <h4 className="text-[var(--text-primary)] font-bold mb-2">Daily Habit: 45 Min Cardio</h4>
                                       <div className="flex gap-2">
                                          <span className="px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] font-black uppercase">14:00 PM</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                          </div>
                       </div>
                    </div>

                    {/* Step 5: Insights View */}
                    <div className="insights-view absolute inset-0 flex-col p-8 lg:p-12 hidden">
                       <div className="max-w-3xl w-full mx-auto">
                          <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <BarChart3 size={24} />
                             </div>
                             <div>
                                <h2 className="text-3xl font-black italic tracking-tighter text-[var(--text-primary)]">Growth Insights</h2>
                                <p className="text-[var(--text-secondary)] font-bold tracking-widest uppercase text-[10px] mt-1">Analytics • Last 7 Days</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                             <div className="col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-xl flex flex-col justify-center">
                                <div className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase mb-2">Cognitive Load</div>
                                <h3 className="text-5xl font-black italic tracking-tighter text-[var(--text-primary)] mb-6">65% <span className="text-xl text-[var(--text-secondary)] not-italic tracking-normal">CAPACITY</span></h3>
                                <div className="w-full h-4 bg-[var(--bg-secondary)] rounded-full overflow-hidden p-0.5 border border-[var(--border-color)]">
                                   <div className="growth-bar w-[65%] h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-lg shadow-emerald-500/20" />
                                </div>
                             </div>
                             
                             <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-xl flex items-center justify-between">
                                 <div>
                                    <div className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase mb-2">Consistency</div>
                                    <div className="text-3xl font-black italic text-[var(--text-primary)]">12 <span className="text-sm text-[var(--text-secondary)] not-italic">DAYS</span></div>
                                 </div>
                                 <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center"><Flame size={20} /></div>
                             </div>

                             <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-xl flex items-center justify-between">
                                 <div>
                                    <div className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase mb-2">Deep Work</div>
                                    <div className="text-3xl font-black italic text-[var(--text-primary)]">34 <span className="text-sm text-[var(--text-secondary)] not-italic">HOURS</span></div>
                                 </div>
                                 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><BrainCircuit size={20} /></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="absolute bottom-6 left-6 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-50 z-20 pointer-events-none">
                    © {new Date().getFullYear()} grit.io
                 </div>
              </div>

           </div>
        </div>
      </div>
      
      {/* Mobile Placeholder */}
      <div className="lg:hidden py-24 px-6 text-center">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-6 text-[var(--accent-color)] shadow-xl">
            <Monitor size={24} />
         </div>
         <h2 className="text-3xl font-black italic tracking-tighter mb-4">DESKTOP EXPERIENCE</h2>
         <p className="text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
            The full interactive demo is optimized for larger screens. Please visit us on your desktop to see the platform in action, or download our mobile app.
         </p>
      </div>

    </section>
    </div>
  );
}
