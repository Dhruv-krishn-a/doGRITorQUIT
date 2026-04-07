// apps/web/app/components/landing/AppDemo.tsx
'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BrainCircuit, CheckCircle2, BarChart3, LayoutDashboard,
  Sparkles, MoreVertical
} from 'lucide-react';

export default function AppDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Register plugin inside effect to avoid SSR issues
    gsap.registerPlugin(ScrollTrigger);
    
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      
      // --- DESKTOP ANIMATION (Pinned) ---
      mm.add('(min-width: 1024px)', () => {
        
        // 1. Initial Setup (Prevent FOUC)
        gsap.set('.dashboard-view', { autoAlpha: 0, display: 'none' }); 
        gsap.set('.ai-modal', { autoAlpha: 1, scale: 1, y: 0 });
        gsap.set('.ai-cursor', { opacity: 0 });
        gsap.set('.app-screen', { x: '0%' }); // Start at Tasks view
        
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.pinned-container',
            start: 'top top',
            end: '+=4000', // Scroll distance
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          }
        });

        // --- SEQUENCE START ---

        // PHASE 1: The Idea (AI Input)
        masterTl
          .to('.text-step-1', { color: '#0f172a', scale: 1.05, opacity: 1, filter: 'blur(0px)', duration: 1 })
          .to('.ai-cursor', { opacity: 1, repeat: 3, yoyo: true, duration: 0.1 }, '<')
          .to('.ai-text-input', { width: '100%', duration: 1.5, ease: 'steps(24)' })
          .to('.ai-cursor', { opacity: 0 }, '>')
          // Transition: Hide Modal, Show Dashboard Preview
          .to('.ai-modal', { scale: 0.9, autoAlpha: 0, y: -20, duration: 0.5 }, '+=0.5')
          .set('.dashboard-view', { display: 'block' }, '<')
          .to('.dashboard-view', { autoAlpha: 1, duration: 0.5 }, '<0.1');

        // PHASE 2: The Plan (Tasks View)
        masterTl
          .addLabel('tasks')
          // Fade out narrative 1, Fade in narrative 2
          .to('.text-step-1', { color: '#94a3b8', scale: 1, opacity: 0.2, filter: 'blur(4px)', duration: 0.5 })
          .to('.text-step-2', { color: '#0f172a', scale: 1.05, opacity: 1, filter: 'blur(0px)', duration: 0.5 }, '<')
          
          // Switch App View: Hide Dashboard Overlay to reveal the Slider underneath
          .to('.dashboard-view', { autoAlpha: 0, duration: 0.5 })
          .set('.dashboard-view', { display: 'none' }) // Important: remove from flow
          
          // Animate Sidebar Highlight
          .to('.nav-item-dashboard', { background: 'transparent', color: '#64748b', duration: 0.3 }, '<')
          .to('.nav-item-tasks', { background: '#f3e8ff', color: '#7e22ce', duration: 0.3 }, '<')
          
          // Check off tasks
          .to('.task-row-1 .checkbox-fill', { scale: 1, duration: 0.3, ease: 'back.out(2)' })
          .to('.task-row-1 .task-text', { textDecoration: 'line-through', opacity: 0.5 }, '<')
          .to('.task-row-2 .checkbox-fill', { scale: 1, duration: 0.3, ease: 'back.out(2)' }, '+=0.1')
          .to('.task-row-2 .task-text', { textDecoration: 'line-through', opacity: 0.5 }, '<');

        // PHASE 3: The Momentum (Analytics View)
        masterTl
          .addLabel('analytics')
          // Narrative Switch
          .to('.text-step-2', { color: '#94a3b8', scale: 1, opacity: 0.2, filter: 'blur(4px)', duration: 0.5 })
          .to('.text-step-3', { color: '#0f172a', scale: 1.05, opacity: 1, filter: 'blur(0px)', duration: 0.5 }, '<')
          
          // Sidebar Switch
          .to('.nav-item-tasks', { background: 'transparent', color: '#64748b', duration: 0.3 }, '<')
          .to('.nav-item-analytics', { background: '#f3e8ff', color: '#7e22ce', duration: 0.3 }, '<')
          
          // Slide Screen Left (Reveal Analytics)
          .to('.app-screen', { x: '-50%', duration: 1, ease: 'power2.inOut' }, '<')
          
          // Animate Charts
          .fromTo('.chart-bar', 
            { scaleY: 0 }, 
            { scaleY: 1, transformOrigin: 'bottom', stagger: 0.05, duration: 0.8, ease: 'back.out(1.2)' }, 
            '-=0.5'
          );

      });

      // --- MOBILE FALLBACK (Simple Reveal) ---
      mm.add('(max-width: 1023px)', () => {
        // ✅ FIX: Explicitly cast the array to HTMLElement[] so forEach knows 'el' is an Element
        const mobileSteps = gsap.utils.toArray<HTMLElement>('.mobile-step');
        
        mobileSteps.forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0, y: 20 },
            {
              opacity: 1, y: 0,
              duration: 0.8,
              scrollTrigger: {
                trigger: el,
                start: 'top 80%',
              }
            }
          );
        });
      });

    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="transform-gpu bg-[#FDF2F8]">
      
      {/* DESKTOP PINNED SECTION */}
      <div className="transform-gpu pinned-container hidden lg:flex relative w-full h-screen flex-row overflow-hidden border-t border-purple-100 bg-white/50 backdrop-blur-sm">
        
        {/* LEFT SIDE: Narrative Steps */}
        <div className="transform-gpu w-1/3 h-full flex flex-col justify-center px-16 space-y-24 z-10">
          <div className="transform-gpu text-step-1 opacity-20 blur-xs transform origin-left">
            <div className="transform-gpu w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <BrainCircuit size={24} />
            </div>
            <h2 className="transform-gpu text-3xl font-bold mb-4 text-slate-900">It starts with a thought.</h2>
            <p className="transform-gpu text-lg leading-relaxed text-slate-600">
              Tell the AI your goal. &quot;Launch an MVP&quot;, &quot;Learn Rust&quot;. Our <strong>Devstral Model</strong> architects the roadmap.
            </p>
          </div>

          <div className="transform-gpu text-step-2 opacity-20 blur-xs transform origin-left">
            <div className="transform-gpu w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="transform-gpu text-3xl font-bold mb-4 text-slate-900">Mapped to Reality.</h2>
            <p className="transform-gpu text-lg leading-relaxed text-slate-600">
              We populate your calendar. Tasks are prioritized into <strong>Daily Checklists</strong> so you actually ship.
            </p>
          </div>

          <div className="transform-gpu text-step-3 opacity-20 blur-xs transform origin-left">
            <div className="transform-gpu w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <BarChart3 size={24} />
            </div>
            <h2 className="transform-gpu text-3xl font-bold mb-4 text-slate-900">Visual Momentum.</h2>
            <p className="transform-gpu text-lg leading-relaxed text-slate-600">
              Review your <strong>Focus Time</strong> and <strong>Task Velocity</strong>. The dashboard adapts to keep your streak alive.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Device Simulation */}
        <div className="transform-gpu w-2/3 h-full bg-[#F3F4F6] relative overflow-hidden flex items-center justify-center p-12">
          <div className="transform-gpu relative w-full max-w-5xl aspect-video bg-[#FDF2F8] rounded-2xl shadow-2xl border border-white/60 overflow-hidden flex ring-1 ring-slate-900/5">
            
            {/* App Sidebar */}
            <div className="transform-gpu w-64 bg-[#FDF2F8] border-r border-slate-200/60 p-6 flex flex-col gap-6 shrink-0 z-20">
              <div className="transform-gpu font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <div className="transform-gpu w-6 h-6 bg-slate-900 rounded-md"></div> Planner
              </div>
              <div className="transform-gpu space-y-1">
                <div className="transform-gpu nav-item-dashboard flex items-center gap-3 px-3 py-2 text-purple-700 bg-purple-50 rounded-lg font-medium transition-colors">
                  <LayoutDashboard size={18} /> Dashboard
                </div>
                <div className="transform-gpu nav-item-tasks flex items-center gap-3 px-3 py-2 text-slate-600 rounded-lg font-medium transition-colors">
                  <CheckCircle2 size={18} /> My Tasks
                </div>
                <div className="transform-gpu nav-item-analytics flex items-center gap-3 px-3 py-2 text-slate-600 rounded-lg font-medium transition-colors">
                  <BarChart3 size={18} /> Analytics
                </div>
              </div>
            </div>

            {/* App Content Area */}
            <div className="transform-gpu flex-1 relative overflow-hidden bg-white">
              
              {/* OVERLAY 1: Dashboard Preview */}
              <div className="transform-gpu dashboard-view absolute inset-0 z-40 bg-[#FDF2F8] p-8">
                <div className="transform-gpu bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
                  <div>
                    <div className="transform-gpu text-sm text-slate-400 font-medium">Overview</div>
                    <div className="transform-gpu text-2xl font-bold text-slate-800">Good Morning, Dhruv</div>
                  </div>
                  <div className="transform-gpu bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Focus Mode</div>
                </div>
                <div className="transform-gpu flex gap-4">
                  <div className="transform-gpu w-1/3 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
                    <div className="transform-gpu w-8 h-8 bg-orange-100 rounded-lg mb-2"></div>
                    <div className="transform-gpu h-4 w-16 bg-slate-100 rounded"></div>
                  </div>
                  <div className="transform-gpu w-1/3 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
                    <div className="transform-gpu w-8 h-8 bg-blue-100 rounded-lg mb-2"></div>
                    <div className="transform-gpu h-4 w-16 bg-slate-100 rounded"></div>
                  </div>
                  <div className="transform-gpu w-1/3 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
                    <div className="transform-gpu w-8 h-8 bg-green-100 rounded-lg mb-2"></div>
                    <div className="transform-gpu h-4 w-16 bg-slate-100 rounded"></div>
                  </div>
                </div>
              </div>

              {/* OVERLAY 2: AI Modal */}
              <div className="transform-gpu ai-modal absolute inset-0 z-50 flex items-center justify-center bg-slate-900/5 backdrop-blur-xs">
                <div className="transform-gpu bg-white w-[85%] max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden ring-4 ring-black/5">
                  <div className="transform-gpu bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                    <div className="transform-gpu flex items-center gap-3">
                      <div className="transform-gpu w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-inner">
                        <Sparkles size={14} />
                      </div>
                      <div className="transform-gpu text-sm font-bold text-slate-800">Strategic Planner</div>
                    </div>
                    <MoreVertical size={16} className="transform-gpu text-slate-400" />
                  </div>
                  <div className="transform-gpu p-10 flex flex-col justify-center items-center space-y-8">
                    <div className="transform-gpu w-full">
                      <div className="transform-gpu bg-white border-2 border-purple-100 rounded-xl p-4 shadow-sm flex items-center text-slate-800 text-xl font-medium">
                        <span className="transform-gpu ai-text-input overflow-hidden whitespace-nowrap w-0 block">I want to learn Next.js</span>
                        <span className="transform-gpu ai-cursor w-0.5 h-6 bg-purple-600 ml-1"></span>
                      </div>
                    </div>
                    <div className="transform-gpu flex gap-3 w-full opacity-50">
                        <div className="transform-gpu h-2 w-1/3 bg-slate-100 rounded-full"></div>
                        <div className="transform-gpu h-2 w-1/3 bg-slate-100 rounded-full"></div>
                        <div className="transform-gpu h-2 w-1/3 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDER: Tasks & Analytics */}
              <div className="transform-gpu app-screen w-[200%] h-full flex">
                
                {/* SCREEN 1: TASKS */}
                <div className="transform-gpu w-1/2 h-full p-8 bg-[#FDF2F8] overflow-y-auto">
                  <header className="transform-gpu flex justify-between items-center mb-8">
                    <h2 className="transform-gpu text-3xl font-bold text-slate-800">My Tasks</h2>
                    <div className="transform-gpu w-8 h-8 bg-slate-200 rounded-full"></div>
                  </header>
                  <div className="transform-gpu space-y-4">
                    <div className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Today</div>
                    {/* Task 1 */}
                    <div className="transform-gpu task-row-1 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="transform-gpu w-6 h-6 rounded-full border-2 border-purple-200 flex items-center justify-center relative overflow-hidden shrink-0">
                        <div className="transform-gpu checkbox-fill w-full h-full bg-purple-500 scale-0 rounded-full origin-center" />
                      </div>
                      <div className="transform-gpu task-text text-slate-800 font-medium text-lg">Setup Development Environment</div>
                    </div>
                    {/* Task 2 */}
                    <div className="transform-gpu task-row-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="transform-gpu w-6 h-6 rounded-full border-2 border-purple-200 flex items-center justify-center relative overflow-hidden shrink-0">
                        <div className="transform-gpu checkbox-fill w-full h-full bg-purple-500 scale-0 rounded-full origin-center" />
                      </div>
                      <div className="transform-gpu task-text text-slate-800 font-medium text-lg">Learn SQL Basics</div>
                    </div>
                    {/* Ghost Task */}
                    <div className="transform-gpu bg-white/50 p-5 rounded-xl border border-slate-100/50 flex items-center gap-4">
                      <div className="transform-gpu w-6 h-6 rounded-full border-2 border-slate-100"></div>
                      <div className="transform-gpu h-4 w-32 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* SCREEN 2: ANALYTICS */}
                <div className="transform-gpu w-1/2 h-full p-8 bg-[#FDF2F8]">
                  <header className="transform-gpu mb-8 flex justify-between items-center">
                    <h2 className="transform-gpu text-3xl font-bold text-slate-800">Performance</h2>
                    <div className="transform-gpu bg-white px-3 py-1 rounded-md border border-slate-200 text-xs font-bold text-slate-500">Weekly</div>
                  </header>
                  <div className="transform-gpu bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64 flex flex-col">
                    <div className="transform-gpu flex justify-between mb-6">
                        <div>
                            <div className="transform-gpu text-sm text-slate-400">Total Focus</div>
                            <div className="transform-gpu text-2xl font-bold text-slate-800">14h 30m</div>
                        </div>
                    </div>
                    <div className="transform-gpu flex-1 flex items-end justify-between gap-3 px-2">
                      {[35, 55, 25, 65, 85, 45, 95].map((h, i) => (
                        <div key={i} className="transform-gpu w-full bg-slate-50 rounded-t-lg h-full flex items-end relative group">
                          <div 
                            className="transform-gpu chart-bar w-full rounded-t-md bg-linear-to-t from-purple-600 to-indigo-400 relative" 
                            style={{ height: `${h}%` }} 
                          >
                            <div className="transform-gpu absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STATIC LAYOUT (No Pinning) */}
      <div className="transform-gpu lg:hidden px-6 py-16 space-y-16">
        <div className="transform-gpu mobile-step space-y-4">
            <div className="transform-gpu w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><BrainCircuit /></div>
            <h3 className="transform-gpu text-2xl font-bold text-slate-900">1. It starts with a thought.</h3>
            <p className="transform-gpu text-slate-600">Tell the AI your goal. We architect the roadmap.</p>
            <div className="transform-gpu bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4">
                <div className="transform-gpu flex items-center gap-3 text-slate-800 font-medium">
                    <Sparkles size={16} className="transform-gpu text-purple-600" /> I want to learn Next.js
                </div>
            </div>
        </div>

        <div className="transform-gpu mobile-step space-y-4">
            <div className="transform-gpu w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><CheckCircle2 /></div>
            <h3 className="transform-gpu text-2xl font-bold text-slate-900">2. Mapped to Reality.</h3>
            <p className="transform-gpu text-slate-600">Tasks are prioritized into daily checklists.</p>
            <div className="transform-gpu bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4 space-y-3">
                <div className="transform-gpu flex items-center gap-3"><CheckCircle2 size={20} className="transform-gpu text-purple-600" /> <span className="transform-gpu line-through text-slate-400">Setup Environment</span></div>
                <div className="transform-gpu flex items-center gap-3"><div className="transform-gpu w-5 h-5 border-2 border-slate-300 rounded-full" /> <span className="transform-gpu text-slate-800">Learn SQL Basics</span></div>
            </div>
        </div>

        <div className="transform-gpu mobile-step space-y-4">
            <div className="transform-gpu w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center"><BarChart3 /></div>
            <h3 className="transform-gpu text-2xl font-bold text-slate-900">3. Visual Momentum.</h3>
            <p className="transform-gpu text-slate-600">Review your progress and keep the streak alive.</p>
            <div className="transform-gpu h-32 bg-white rounded-xl border border-slate-200 flex items-end justify-between p-4 gap-2">
                 {[40, 60, 30, 80, 50].map((h,i) => <div key={i} className="transform-gpu w-full bg-purple-500 rounded-t-sm" style={{height: `${h}%`}} />)}
            </div>
        </div>
      </div>

    </div>
  );
}