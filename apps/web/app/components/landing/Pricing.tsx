// apps/web/app/components/landing/Pricing.tsx
'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2 } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
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
    <section ref={ref} className="transform-gpu pricing-section py-24 bg-white perspective-1000">
      <div className="transform-gpu max-w-6xl mx-auto px-6">
        <div className="transform-gpu text-center mb-16">
          <h2 className="transform-gpu text-4xl font-extrabold text-slate-900 mb-6">Invest in your focus</h2>
          <p className="transform-gpu text-slate-500 max-w-2xl mx-auto">Simple pricing. No hidden fees.</p>
        </div>

        <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Free */}
          <div className="transform-gpu pricing-card-anim group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="transform-gpu text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Starter</div>
            <div className="transform-gpu flex items-baseline gap-1 mb-6">
              <span className="transform-gpu text-4xl font-bold text-slate-900">$0</span>
              <span className="transform-gpu text-slate-500">/mo</span>
            </div>
            <ul className="transform-gpu space-y-4 mb-8 text-slate-600 text-sm">
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-slate-400" /> 1 Device Sync</li>
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-slate-400" /> Basic AI Planning</li>
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-slate-400" /> 7-day History</li>
            </ul>
            <button className="transform-gpu w-full py-4 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">Get Started</button>
          </div>

          {/* Pro */}
          <div className="transform-gpu pricing-card-anim group bg-slate-900 p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-3 transition-all duration-300 relative overflow-hidden">
            <div className="transform-gpu absolute top-0 right-0 bg-linear-to-bl from-purple-500 to-transparent w-24 h-24 opacity-20 rounded-bl-full"></div>
            <div className="transform-gpu text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">Professional</div>
            <div className="transform-gpu flex items-baseline gap-1 mb-6">
              <span className="transform-gpu text-5xl font-bold text-white">$12</span>
              <span className="transform-gpu text-slate-400">/mo</span>
            </div>
            <ul className="transform-gpu space-y-4 mb-8 text-slate-300 text-sm">
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-purple-400" /> Unlimited Devices</li>
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-purple-400" /> Advanced AI Model</li>
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-purple-400" /> Full Analytics History</li>
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-purple-400" /> Calendar Sync</li>
            </ul>
            <button className="transform-gpu w-full py-4 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/50">Start Free Trial</button>
          </div>

          {/* Team */}
          <div className="transform-gpu pricing-card-anim group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="transform-gpu text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Team</div>
            <div className="transform-gpu flex items-baseline gap-1 mb-6">
              <span className="transform-gpu text-4xl font-bold text-slate-900">$29</span>
              <span className="transform-gpu text-slate-500">/user</span>
            </div>
            <ul className="transform-gpu space-y-4 mb-8 text-slate-600 text-sm">
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-slate-400" /> Shared Workspaces</li>
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-slate-400" /> Admin Controls</li>
              <li className="transform-gpu flex items-center gap-3"><CheckCircle2 size={16} className="transform-gpu text-slate-400" /> Priority Support</li>
            </ul>
            <button className="transform-gpu w-full py-4 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>
  );
}