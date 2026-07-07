// apps/web/app/components/landing/AppDemo.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BrainCircuit, CheckCircle2, BarChart3, LayoutDashboard,
  Sparkles, MoreVertical
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AppDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      
      mm.add('(min-width: 1024px)', () => {
        // 1. Initial State
        gsap.set('.dashboard-view', { opacity: 0, x: 50 }); 
        gsap.set('.ai-modal', { opacity: 1, scale: 1 });
        gsap.set('.app-screen', { x: '0%' });
        
        // 2. Main Pinned Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=3000',
            pin: true,
            scrub: 1,
            // Force fixed to avoid stacking context issues
            pinType: 'fixed',
          }
        });

        tl.to('.text-step-1', { opacity: 1, filter: 'blur(0px)', duration: 1 })
          .to('.ai-text-input', { width: '100%', duration: 1.5 })
          .to('.ai-modal', { opacity: 0, scale: 0.9, duration: 0.5 }, '+=0.2')
          .to('.dashboard-view', { opacity: 1, x: 0, duration: 0.5 }, '<')
          .to('.text-step-1', { opacity: 0.2, filter: 'blur(4px)', duration: 0.5 }, '+=0.5')
          .to('.text-step-2', { opacity: 1, filter: 'blur(0px)', duration: 0.5 }, '<')
          .to('.nav-item-dashboard', { opacity: 0.4, duration: 0.3 })
          .to('.nav-item-tasks', { color: 'var(--accent-color)', duration: 0.3 }, '<')
          .to('.dashboard-view', { opacity: 0, x: -50, duration: 0.5 }, '+=0.5')
          .to('.text-step-2', { opacity: 0.2, filter: 'blur(4px)', duration: 0.5 }, '+=0.5')
          .to('.text-step-3', { opacity: 1, filter: 'blur(0px)', duration: 0.5 }, '<')
          .to('.app-screen', { x: '-50%', duration: 1 }, '<');
      });

      // Mobile
      mm.add('(max-width: 1023px)', () => {
        gsap.utils.toArray<HTMLElement>('.mobile-step').forEach(step => {
          gsap.from(step, {
            opacity: 0, y: 30, duration: 1,
            scrollTrigger: { trigger: step, start: 'top 90%' }
          });
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-10 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
      
      {/* Desktop */}
      <div className="hidden lg:flex w-full h-screen overflow-hidden bg-[var(--bg-secondary)]">
        <div className="w-1/3 h-full flex flex-col justify-center px-16 space-y-24">
          {[1, 2, 3].map(i => (
            <div key={i} className={`text-step-${i} opacity-20 blur-xs transition-all`}>
               <h2 className="text-3xl font-bold mb-4">Step {i}</h2>
               <p className="text-[var(--text-secondary)]">Narrative for step {i} goes here.</p>
            </div>
          ))}
        </div>
        <div className="w-2/3 h-full flex items-center justify-center p-12 bg-[var(--bg-primary)]">
           <div className="relative w-full max-w-5xl aspect-video bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-color)] overflow-hidden flex">
              {/* Sidebar */}
              <div className="w-64 border-r border-[var(--border-color)] p-8">
                 <div className="space-y-4">
                    <div className="nav-item-dashboard font-bold">Dashboard</div>
                    <div className="nav-item-tasks font-bold">Tasks</div>
                    <div className="nav-item-analytics font-bold">Analytics</div>
                 </div>
              </div>
              {/* Screen */}
              <div className="flex-1 relative overflow-hidden">
                 <div className="dashboard-view absolute inset-0 z-10 bg-blue-500/10 p-12">
                    <div className="h-full border-2 border-dashed border-blue-500/20 rounded-2xl flex items-center justify-center font-bold text-blue-500">Dashboard View</div>
                 </div>
                 <div className="ai-modal absolute inset-0 z-20 flex items-center justify-center bg-black/20">
                    <div className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-color)] shadow-xl">
                       <div className="w-64 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                          <div className="ai-text-input h-full bg-[var(--accent-color)] w-0"></div>
                       </div>
                    </div>
                 </div>
                 <div className="app-screen w-[200%] h-full flex">
                    <div className="w-1/2 h-full bg-green-500/10 flex items-center justify-center font-bold text-green-500">Tasks Screen</div>
                    <div className="w-1/2 h-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-500">Analytics Screen</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden p-8 space-y-12">
         {[1, 2, 3].map(i => <div key={i} className="mobile-step h-64 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-8 font-bold">Step {i} Mobile</div>)}
      </div>
    </section>
  );
}
