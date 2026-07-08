'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Monitor, Smartphone, Globe, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CrossPlatform() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Animate the main headline
      gsap.from('.cp-title', {
        scrollTrigger: { trigger: '.cp-title', start: 'top 80%' },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Animate the device cards staggering
      gsap.from('.cp-card', {
        scrollTrigger: { trigger: '.cp-cards-container', start: 'top 75%' },
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.8,
        ease: 'back.out(1.2)'
      });

      // Animate the Sync graphic connecting them
      gsap.fromTo('.cp-sync-line', 
        { scaleX: 0, opacity: 0 },
        { 
          scaleX: 1, 
          opacity: 1, 
          duration: 1.2, 
          ease: 'power3.inOut',
          scrollTrigger: { trigger: '.cp-sync-line', start: 'top 85%' }
        }
      );
      
      // Infinite rotate the sync icon
      gsap.to('.cp-sync-icon', {
        rotation: 360,
        repeat: -1,
        ease: 'linear',
        duration: 4
      });

    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 relative bg-[var(--bg-primary)] overflow-hidden border-t border-[var(--border-color)]">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-color)]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 cp-title">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] mb-6">
            <RefreshCw size={12} className="text-[var(--accent-color)] cp-sync-icon" />
            <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)]">Smart Sync Engine</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter italic mb-6">
            EVERYWHERE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-500">YOU GO</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            Built from the ground up as a unified ecosystem. Whether you're deep in focus at your desk or checking habits on the go, your entire life stays perfectly synchronized.
          </p>
        </div>

        {/* Devices Container */}
        <div className="cp-cards-container grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Web App */}
          <div className="cp-card group relative p-1 rounded-3xl bg-gradient-to-b from-[var(--border-color)] to-transparent">
            <div className="h-full bg-[var(--bg-card)] rounded-[1.4rem] p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 relative z-10 border border-blue-500/20">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tight mb-3">Web App</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                Full-featured dashboard accessible from any browser. Perfect for deep planning and analytics review.
              </p>
              <div className="mt-auto px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Next.js 15
              </div>
            </div>
          </div>

          {/* Desktop App */}
          <div className="cp-card group relative p-1 rounded-3xl bg-gradient-to-b from-[var(--border-color)] to-transparent mt-0 md:-mt-8">
            <div className="h-full bg-[var(--bg-card)] rounded-[1.4rem] p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl border border-[var(--accent-color)]/20 shadow-[0_0_40px_rgba(var(--accent-color-rgb),0.1)]">
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20">
                 <Zap size={10} className="fill-current" />
                 <span className="text-[8px] uppercase font-black tracking-widest">Native</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center mb-6 relative z-10 border border-[var(--accent-color)]/20">
                <Monitor size={32} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tight mb-3">Desktop Pro</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                Lightning-fast native application. Keyboard shortcuts, system tray integration, and extreme performance.
              </p>
              <div className="mt-auto px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Tauri v2 + Rust
              </div>
            </div>
          </div>

          {/* Mobile App */}
          <div className="cp-card group relative p-1 rounded-3xl bg-gradient-to-b from-[var(--border-color)] to-transparent">
            <div className="h-full bg-[var(--bg-card)] rounded-[1.4rem] p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                 <ShieldCheck size={10} className="text-[var(--text-secondary)]" />
                 <span className="text-[8px] text-[var(--text-secondary)] uppercase font-black tracking-widest">Offline-First</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 relative z-10 border border-purple-500/20">
                <Smartphone size={32} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tight mb-3">Mobile App</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                Habit tracking in your pocket. Optimized with local databases to work instantly even without cell service.
              </p>
              <div className="mt-auto px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Expo + WatermelonDB
              </div>
            </div>
          </div>

        </div>
        
        {/* Sync connecting line Graphic (Desktop only) */}
        <div className="hidden md:block absolute top-[55%] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent -z-10 cp-sync-line origin-center" />

      </div>
    </section>
  );
}
