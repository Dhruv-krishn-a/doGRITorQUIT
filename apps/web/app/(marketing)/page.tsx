// apps/web/app/(marketing)/page.tsx
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
      <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-color)]/30">
        <main>
          <Hero />
          <AppDemo />
          <Features />
          <Roadmap />
          <Pricing />
          <FAQ />
        </main>
      </div>
    </SmoothScroll>
  );
}
