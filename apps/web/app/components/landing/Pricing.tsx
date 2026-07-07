'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2, XCircle } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.pricing-card-anim');
      gsap.fromTo(cards, 
        { opacity: 0, y: 100, rotationX: 10 },
        {
          opacity: 1, y: 0, rotationX: 0,
          stagger: 0.15,
          duration: 1,
          ease: 'elastic.out(1, 0.75)',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 75%',
          }
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="pricing-section py-32 bg-[var(--bg-primary)] perspective-1000">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
            Pricing
          </div>
          <h2 className="text-4xl font-extrabold text-[var(--text-primary)] mb-6 tracking-tight">Invest in your focus</h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg font-medium">Simple pricing. No hidden fees. Upgrade when you are ready to unlock your full potential.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="pricing-card-anim group bg-[var(--bg-card)] p-10 rounded-3xl border border-[var(--border-color)] shadow-sm hover:border-[var(--text-secondary)] transition-all duration-300 relative overflow-hidden">
            <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Free Tier</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-bold text-[var(--text-primary)]">₹0</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm mb-8">The starter plan for individuals.</p>
            <ul className="space-y-4 mb-8 text-[var(--text-primary)] text-sm font-medium">
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-500" /> Access unified Today dashboard</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-500" /> Track daily habits</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-500" /> 1 Active Plan</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-500" /> 5 Daily AI generation credits</li>
              <li className="flex items-center gap-3 opacity-50"><XCircle size={18} className="text-[var(--text-secondary)]" /> Daily notes and journal entries</li>
              <li className="flex items-center gap-3 opacity-50"><XCircle size={18} className="text-[var(--text-secondary)]" /> Deep Analytics</li>
            </ul>
            <button className="w-full py-4 rounded-xl border border-[var(--border-color)] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">Get Started</button>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card-anim group bg-[var(--bg-secondary)] p-10 rounded-3xl border border-[var(--accent-color)]/30 shadow-2xl hover:shadow-[var(--accent-color)]/20 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-linear-to-bl from-[var(--accent-color)]/30 to-transparent w-32 h-32 opacity-50 rounded-bl-full"></div>
            <div className="text-sm font-bold text-[var(--accent-color)] uppercase tracking-wider mb-4">Pro Plan</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-bold text-[var(--text-primary)]">₹499</span>
              <span className="text-[var(--text-secondary)]">/mo</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm mb-8">Unlock your full potential.</p>
            <ul className="space-y-4 mb-8 text-[var(--text-primary)] text-sm font-medium">
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[var(--accent-color)]" /> Everything in Free</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[var(--accent-color)]" /> Daily notes and journal entries</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[var(--accent-color)]" /> Deep Productivity Analytics</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[var(--accent-color)]" /> Theme Customization</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[var(--accent-color)]" /> Unlimited Plans</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[var(--accent-color)]" /> 100 Daily AI generation credits</li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-[var(--accent-color)] text-white font-bold hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-color)]/30">Upgrade to Pro</button>
          </div>
        </div>
      </div>
    </section>
  );
}
