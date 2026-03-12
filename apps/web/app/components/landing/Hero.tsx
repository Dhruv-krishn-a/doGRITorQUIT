'use client';

import React, { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Sparkles, ArrowRight, Zap, Target, Layers } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // --- 1. SETUP ELEMENTS ---
      const blob1 = root.querySelector('.hero-blob-1');
      const blob2 = root.querySelector('.hero-blob-2');
      const floaters = gsap.utils.toArray<HTMLElement>('.floater');

      // optimized setters for performance
      const setX1 = gsap.quickSetter(blob1, "x", "px");
      const setY1 = gsap.quickSetter(blob1, "y", "px");
      const setX2 = gsap.quickSetter(blob2, "x", "px");
      const setY2 = gsap.quickSetter(blob2, "y", "px");

      // --- 2. MOUSE PARALLAX ---
      const onMouse = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 50;
        const y = (e.clientY / window.innerHeight - 0.5) * 50;
        
        // Move blobs deeply
        setX1(x * 1.5);
        setY1(y * 1.5);
        setX2(-x);
        setY2(-y);

        // Move floating icons with varying depth
        floaters.forEach((el, i) => {
          const speed = 0.2 + (i * 0.15); // Different speeds for depth
          gsap.to(el, { 
            x: x * speed * 2, 
            y: y * speed * 2, 
            duration: 1, 
            ease: "power2.out", 
            overwrite: "auto" 
          });
        });
      };

      window.addEventListener('mousemove', onMouse);

      // --- 3. ELEGANT ENTRANCE TIMELINE ---
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

      tl
        // Blobs fade in slowly
        .from('.hero-blob-1', { scale: 0.5, opacity: 0, duration: 2 }, 0)
        .from('.hero-blob-2', { scale: 0.5, opacity: 0, duration: 2 }, 0.2)
        
        // Badge pops
        .from('.hero-badge', { y: 20, opacity: 0, scale: 0.9 }, 0.5)
        
        // Text Masking Reveal (The "Elegant" part)
        .from('.hero-title-line', { 
          yPercent: 100, 
          skewY: 5, 
          stagger: 0.15,
          duration: 1.4
        }, 0.4)
        
        // Description Fade
        .from('.hero-desc', { y: 20, opacity: 0 }, 0.9)
        
        // Buttons Slide Up
        .from('.hero-btn', { y: 20, opacity: 0, stagger: 0.1 }, 1.0)
        
        // Floaters Pop in with elastic effect
        .from('.floater', { 
          scale: 0, 
          opacity: 0, 
          stagger: 0.1, 
          duration: 1.5, 
          ease: "elastic.out(1, 0.75)" 
        }, 1.2);

      // --- 4. CONTINUOUS ANIMATIONS ---
      // Subtle rotation for blobs
      gsap.to([blob1, blob2], {
        rotation: 360,
        duration: 120,
        repeat: -1,
        ease: "linear"
      });

      // Shimmer text effect
      gsap.to('.gradient-text', {
        backgroundPosition: "200% center",
        duration: 6,
        ease: "linear",
        repeat: -1
      });

      return () => {
        window.removeEventListener('mousemove', onMouse);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="transform-gpu hero-section min-h-[92vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#FDF2F8]">
      
      {/* Background Ambience */}
      <div className="transform-gpu hero-blob-1 absolute top-[-10%] left-[-10%] w-150 h-150 rounded-full blur-[120px] bg-purple-500/20 pointer-events-none mix-blend-multiply will-change-transform" />
      <div className="transform-gpu hero-blob-2 absolute bottom-[-10%] right-[-10%] w-150 h-150 rounded-full blur-[120px] bg-pink-500/20 pointer-events-none mix-blend-multiply will-change-transform" />

      {/* Floating 3D Elements */}
      <div className="transform-gpu absolute inset-0 pointer-events-none overflow-hidden">
        <div className="transform-gpu floater absolute top-[20%] left-[15%] text-purple-300/60"><Zap size={32} /></div>
        <div className="transform-gpu floater absolute top-[15%] right-[20%] text-blue-300/60"><Target size={40} /></div>
        <div className="transform-gpu floater absolute bottom-[25%] left-[20%] text-pink-300/60"><Layers size={36} /></div>
      </div>

      <div className="transform-gpu z-10 text-center space-y-8 max-w-5xl px-6 relative">
        
        {/* Badge */}
        <div className="transform-gpu hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200/60 bg-white/60 text-purple-900 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
          <Sparkles size={12} className="transform-gpu text-purple-600 animate-pulse" /> 
          <span>v2.0 Now Live</span>
        </div>

        {/* Main Heading with Masking Containers */}
        <h1 className="transform-gpu text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-slate-900 leading-[0.9] flex flex-col items-center">
          {/* Mask Container 1 */}
          <span className="transform-gpu block overflow-hidden pb-2">
            <span className="transform-gpu hero-title-line block">ARCHITECT</span>
          </span>
          {/* Mask Container 2 */}
          <span className="transform-gpu block overflow-hidden pb-4">
            <span className="transform-gpu hero-title-line block bg-linear-to-r from-purple-600 via-pink-500 to-purple-600 bg-size-[200%_auto] bg-clip-text text-transparent gradient-text">
              YOUR FUTURE
            </span>
          </span>
        </h1>

        <p className="transform-gpu hero-desc text-lg md:text-xl text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
          The only workspace that uses AI to break down your massive goals into daily, bite-sized tasks.
        </p>

        {/* CTA Buttons */}
        <div className="transform-gpu pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" aria-label="Open Dashboard">
            <button className="transform-gpu hero-btn group relative px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-2xl shadow-purple-900/20 hover:shadow-purple-900/40 transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 overflow-hidden">
              <span className="transform-gpu relative z-10">Open Dashboard</span>
              <ArrowRight size={18} className="transform-gpu relative z-10 group-hover:translate-x-1 transition-transform" />
              {/* Shine Effect */}
              <div className="transform-gpu absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-12" />
            </button>
          </Link>
          
          <button className="transform-gpu hero-btn px-8 py-4 text-slate-600 font-semibold hover:text-slate-900 transition-colors flex items-center gap-2 group">
            Watch Demo 
            <div className="transform-gpu w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-purple-200 group-hover:text-purple-600 transition-colors shadow-sm">
              ▶
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}