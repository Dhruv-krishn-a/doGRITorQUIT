// apps/web/app/components/landing/FAQ.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const faqs = [
  { q: 'How does the AI planning work?', a: 'Our custom AI engine analyzes your high-level goal and breaks it down into logical milestones. It then estimates time for each sub-task and fits them into your available calendar slots.' },
  { q: 'Is my data private?', a: 'Absolutely. We use enterprise-grade encryption. Your personal plans are never used to train our public models without explicit consent.' },
  { q: 'Can I track my habits offline?', a: 'Yes! The mobile app is built offline-first using WatermelonDB. Your data will seamlessly sync back to the server once you regain connection.' },
  { q: 'What happens if I miss a day?', a: 'Life happens. doGRITorQUIT detects missed tasks and offers a "Rebalance" button to intelligently reschedule them without overwhelming your next day.' }
];

export default function FAQ() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };

  return (
    <section ref={ref} className="faq-section py-24 bg-[var(--bg-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-[var(--text-primary)] mb-12 text-center">Frequently asked questions</h2>
        
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="faq-item-anim group bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden transition-all duration-300 hover:shadow-[var(--accent-color)]/10 hover:border-[var(--text-secondary)]/30">
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]">
                  <span className="font-bold text-[var(--text-primary)] text-lg">{f.q}</span>
                  <span className="transform group-open:rotate-180 transition-transform duration-300 text-[var(--accent-color)]">
                    <Plus size={20} className="block group-open:hidden" />
                    <Minus size={20} className="hidden group-open:block" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]/50 pt-4">
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
