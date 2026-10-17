// apps/web/app/(marketing)/page.tsx
import React from "react";
import dynamic from "next/dynamic";
import SmoothScroll from "../components/landing/SmoothScroll";
import Hero from "../components/landing/Hero";

// Lazy load below-the-fold components
const AppDemo = dynamic(() => import("../components/landing/AppDemo"), {
  ssr: true,
});
const Features = dynamic(() => import("../components/landing/Features"), {
  ssr: true,
});
const CrossPlatform = dynamic(
  () => import("../components/landing/CrossPlatform"),
  { ssr: true },
);
const Roadmap = dynamic(() => import("../components/landing/Roadmap"), {
  ssr: true,
});
const Pricing = dynamic(() => import("../components/landing/Pricing"), {
  ssr: true,
});
const FAQ = dynamic(() => import("../components/landing/FAQ"), { ssr: true });

export default function Home() {
  return (
    <SmoothScroll>
      <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-color)]/30 overflow-hidden">
        <main>
          <Hero />
          <AppDemo />
          <Features />
          <CrossPlatform />
          <Roadmap />
          <Pricing />
          <FAQ />
        </main>
      </div>
    </SmoothScroll>
  );
}
