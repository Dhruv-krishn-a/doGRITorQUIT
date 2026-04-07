// apps/web/app/components/landing/SmoothScroll.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type LenisRefHandle = React.ElementRef<typeof ReactLenis>;

// Register Plugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRefHandle | null>(null);
  
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (lenisRef.current as any)?.lenis;
    if (!lenis) return;

    // 1. CRITICAL: Synchronize ScrollTrigger with Lenis scroll events
    // This ensures pinned elements update instantly, not a frame later
    lenis.on('scroll', ScrollTrigger.update);

    // 2. Add Lenis to GSAP's ticker
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);

    // 3. CRITICAL: Disable GSAP lag smoothing
    // This prevents GSAP from trying to "catch up" during smooth scrolls, which causes the shaking
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, []);

  return (
    <ReactLenis 
      ref={lenisRef} 
      root 
      options={{
        duration: 1.2,
        smoothWheel: true,
        lerp: 0.1,
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children as any}
    </ReactLenis>
  );
}
