// apps/web/app/page.tsx
import React from 'react';
import SmoothScroll from '../components/landing/SmoothScroll';
import Hero from '../components/landing/Hero';
import AppDemo from '../components/landing/AppDemo';
import Features from '../components/landing/Features';
import Roadmap from '../components/landing/Roadmap';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';

export default function Home() {
  return (
    <SmoothScroll>
      <div className="transform-gpu font-sans text-slate-900 selection:bg-purple-200">
        
        {/* Main Content Layer - Slides OVER the footer */}
        {/* Added bottom margin so you can scroll enough to reveal the footer */}
        <main className="transform-gpu relative z-10 bg-white shadow-2xl shadow-slate-900/20 mb-125">
          
          <div className="transform-gpu relative z-10 bg-[#FDF2F8]">
            <Hero />
          </div>

          <div className="transform-gpu relative z-20 bg-white">
            <AppDemo />
          </div>

          <div className="transform-gpu relative z-30 bg-white">
            <Features />
          </div>

          <div className="transform-gpu relative z-40 bg-[#F8FAFC]">
            <Roadmap />
          </div>

          <div className="transform-gpu relative z-50 bg-white">
            <Pricing />
          </div>

          <div className="transform-gpu relative z-50 bg-[#F8FAFC]">
            <FAQ />
          </div>
          
        </main>

      </div>
    </SmoothScroll>
  );
}