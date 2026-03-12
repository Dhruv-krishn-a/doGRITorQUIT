// apps/web/app/components/landing/FAQ.tsx
'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function FAQ() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.faq-item-anim');
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
          }
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="transform-gpu faq-section py-24 bg-[#F8FAFC]">
      <div className="transform-gpu max-w-3xl mx-auto px-6">
        <h2 className="transform-gpu text-4xl font-extrabold text-slate-900 mb-12 text-center">Frequently asked questions</h2>
        
        <div className="transform-gpu space-y-4">
          {[
            { q: 'How does the AI planning work?', a: 'Our Devstral model analyzes your high-level goal and breaks it down into logical milestones. It then estimates time for each sub-task and fits them into your available calendar slots.' },
            { q: 'Is my data private?', a: 'Absolutely. We use enterprise-grade encryption. Your personal plans are never used to train our public models without explicit consent.' },
            { q: 'Can I use this with my team?', a: 'Yes! The Teams plan allows for shared workspaces, assigned tasks, and collective velocity tracking.' },
            { q: 'What happens if I miss a day?', a: 'Life happens. PlannerAI detects missed tasks and offers a "Rebalance" button to intelligently reschedule them without overwhelming your next day.' }
          ].map((f, i) => (
            <div key={i} className="transform-gpu faq-item-anim group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
              <details className="transform-gpu group">
                <summary className="transform-gpu flex justify-between items-center p-6 cursor-pointer list-none">
                  <span className="transform-gpu font-bold text-slate-800 text-lg">{f.q}</span>
                  <span className="transform-gpu transform group-open:rotate-180 transition-transform duration-300 text-purple-600">
                    <Plus size={20} className="transform-gpu block group-open:hidden" />
                    <Minus size={20} className="transform-gpu hidden group-open:block" />
                  </span>
                </summary>
                <div className="transform-gpu px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                  {f.a}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}