// apps/web/app/components/landing/Roadmap.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BrainCircuit, Zap, ShieldCheck } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function Roadmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // 1. Line Drawing
      gsap.fromTo('.roadmap-line-inner', 
        { scaleY: 0 },
        { 
          scaleY: 1, 
          ease: 'none',
          scrollTrigger: {
            trigger: '.roadmap-section',
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: 1
          }
        }
      );

      // 2. Items Pop-in
      const items = gsap.utils.toArray<HTMLElement>('.roadmap-item');
      items.forEach((item) => {
        gsap.fromTo(item,
          { opacity: 0, y: 50, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
            }
          }
        );
      });

      // 3. Parallax Text Strip
      gsap.to('.gsap-strip', {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.roadmap-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5
        }
      });

    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="roadmap-section py-24 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* GSAP Strip Background Effect */}
      <div className="absolute right-0 top-0 h-[200%] w-24 md:w-32 opacity-5 pointer-events-none select-none overflow-hidden">
        <div className="gsap-strip flex flex-col text-8xl md:text-9xl font-bold text-[var(--text-primary)] leading-none">
          {Array(20).fill('PLAN').map((txt, i) => (
            <span key={i} className="my-4 block transform -rotate-90 origin-center whitespace-nowrap">{txt}</span>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--accent-color)] text-xs font-bold uppercase tracking-wider">
            Roadmap
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-6">Built for scale</h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">Our journey from MVP to Enterprise scale.</p>
        </div>

        {/* Vertical Line Container */}
        <div className="absolute left-8 md:left-1/2 top-48 bottom-20 w-1 bg-[var(--border-color)] rounded-full transform -translate-x-1/2 overflow-hidden">
          <div className="roadmap-line-inner w-full h-full bg-linear-to-b from-[var(--accent-color)] to-purple-500 origin-top"></div>
        </div>

        <div className="space-y-24">
          {[
            { label: 'Q1 2026', title: 'Core Foundations', desc: 'Refine AI planner, offline sync, and native mobile pairing.', icon: <BrainCircuit size={20} /> },
            { label: 'Q2 2026', title: 'Advanced Habit Analytics', desc: 'Deep dive into your focus trends, burnout detection, and mood correlations.', icon: <Zap size={20} /> },
            { label: 'Q3 2026', title: 'Community Challenges', desc: 'Social accountability, shared goals, and friend leaderboards.', icon: <ShieldCheck size={20} /> }
          ].map((item, i) => (
            <div key={i} className={`roadmap-item relative flex items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Content Side */}
              <div className="flex-1 md:w-1/2 p-6 md:p-0">
                <div className={`bg-[var(--bg-card)] p-8 rounded-3xl shadow-lg border border-[var(--border-color)] relative ${i % 2 === 0 ? 'md:mr-12' : 'md:ml-12 md:text-right'} ml-12 md:ml-0`}>
                  <div className={`absolute top-8 ${i % 2 === 0 ? 'md:-right-3 -left-3' : 'md:-left-3 -left-3'} w-6 h-6 bg-[var(--bg-primary)] border-4 border-[var(--border-color)] rounded-full flex items-center justify-center z-10 shadow-sm`}>
                    <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full"></div>
                  </div>
                  <div className={`text-xs font-bold text-[var(--accent-color)] uppercase tracking-widest mb-2 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>{item.label}</div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              </div>

              {/* Empty Side for layout balance */}
              <div className="hidden md:block flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
