'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BrainCircuit, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // --- 1. Staggered Entrance ---
      const items = gsap.utils.toArray<HTMLElement>('.feature-card');
      
      gsap.fromTo(items, 
        { 
          opacity: 0, 
          y: 50, 
          rotationX: -10 
        },
        { 
          opacity: 1, 
          y: 0, 
          rotationX: 0,
          duration: 1, 
          stagger: 0.15, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: 'top 75%',
          }
        }
      );

      // --- 2. 3D Hover Tilt Effect ---
      // Only enable on desktop to save mobile battery/performance
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        items.forEach((card) => {
          const content = card.querySelector('.card-content');
          const icon = card.querySelector('.card-icon');

          card.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on cursor position relative to center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -4; // Max 4deg tilt
            const rotateY = ((x - centerX) / centerX) * 4;

            gsap.to(card, {
              rotateX: rotateX,
              rotateY: rotateY,
              scale: 1.02,
              duration: 0.4,
              ease: "power2.out",
              transformPerspective: 1000,
              transformOrigin: "center"
            });

            // Parallax the inner content slightly
            gsap.to([content, icon], {
              x: (x - centerX) * 0.05,
              y: (y - centerY) * 0.05,
              duration: 0.4,
              ease: "power2.out"
            });
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              duration: 0.6,
              ease: "elastic.out(1, 0.5)"
            });
            
            gsap.to([content, icon], {
              x: 0,
              y: 0,
              duration: 0.6,
              ease: "power2.out"
            });
          });
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="transform-gpu py-32 bg-[#FDF2F8] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="transform-gpu absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* ✅ Fixed: Using Tailwind classes w-125 / w-150 assuming extended theme, or fallback to arbitrary if needed but valid syntax */}
        <div className="transform-gpu absolute top-1/4 right-0 w-125 h-125 bg-purple-200/20 rounded-full blur-[100px]" />
        <div className="transform-gpu absolute bottom-0 left-0 w-150 h-150 bg-pink-200/20 rounded-full blur-[100px]" />
      </div>

      <div className="transform-gpu max-w-6xl mx-auto px-6 relative z-10">
        <div className="transform-gpu text-center mb-20 max-w-3xl mx-auto">
          <div className="transform-gpu inline-block mb-4 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-wider">
            Why gritorquit?
          </div>
          <h2 className="transform-gpu text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Features that actually <span className="transform-gpu bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">ship work</span>
          </h2>
          <p className="transform-gpu text-lg text-slate-500 font-medium">
            Most tools are just lists. gritorquit is an active engine that blends generative planning, calendar physics, and behavioral analytics.
          </p>
        </div>

        <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
          
          {/* Card 1: AI */}
          <div className="transform-gpu feature-card group relative bg-white rounded-3xl p-1 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-purple-500/10 transition-shadow duration-500">
            <div className="transform-gpu absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="transform-gpu card-content h-full bg-white/50 backdrop-blur-sm rounded-[20px] p-8 flex flex-col relative z-10">
              <div className="transform-gpu card-icon w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <BrainCircuit size={28} />
              </div>
              
              <h3 className="transform-gpu font-bold text-2xl mb-3 text-slate-900 group-hover:text-purple-700 transition-colors">AI Roadmaps</h3>
              {/* ✅ Fixed: Escaped quotes */}
              <p className="transform-gpu text-slate-500 leading-relaxed mb-6">
                Decomposes vague goals like &quot;Launch MVP&quot; into concrete milestones, then breaks them down into daily estimate-backed tasks.
              </p>
              
              <div className="transform-gpu mt-auto flex items-center gap-2 text-sm font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                See it in action <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Card 2: Checklists */}
          <div className="transform-gpu feature-card group relative bg-white rounded-3xl p-1 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-500">
            <div className="transform-gpu absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="transform-gpu card-content h-full bg-white/50 backdrop-blur-sm rounded-[20px] p-8 flex flex-col relative z-10">
              <div className="transform-gpu card-icon w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <CheckCircle2 size={28} />
              </div>
              
              <h3 className="transform-gpu font-bold text-2xl mb-3 text-slate-900 group-hover:text-blue-700 transition-colors">Smart Checklists</h3>
              <p className="transform-gpu text-slate-500 leading-relaxed mb-6">
                Context-aware daily lists that adapt to your pace. Missed a task? The AI intelligently rebalances your week.
              </p>

              <div className="transform-gpu mt-auto flex items-center gap-2 text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                Learn more <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Card 3: Analytics */}
          <div className="transform-gpu feature-card group relative bg-white rounded-3xl p-1 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-green-500/10 transition-shadow duration-500">
            <div className="transform-gpu absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="transform-gpu card-content h-full bg-white/50 backdrop-blur-sm rounded-[20px] p-8 flex flex-col relative z-10">
              <div className="transform-gpu card-icon w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                <BarChart3 size={28} />
              </div>
              
              <h3 className="transform-gpu font-bold text-2xl mb-3 text-slate-900 group-hover:text-green-700 transition-colors">Deep Analytics</h3>
              <p className="transform-gpu text-slate-500 leading-relaxed mb-6">
                Visualize your focus time, velocity, and burnout patterns. Understand <em>when</em> you work best, not just what you did.
              </p>

              <div className="transform-gpu mt-auto flex items-center gap-2 text-sm font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                View metrics <ArrowRight size={14} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}