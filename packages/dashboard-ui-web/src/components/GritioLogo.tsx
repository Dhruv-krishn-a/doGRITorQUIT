"use client";

import React, { useEffect } from 'react';
import { motion, useAnimate } from 'framer-motion';

interface GritioLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
}

export function GritioLogo({ className = '', size = 'md', withText = true }: GritioLogoProps) {
  const [scope, animate] = useAnimate();

  // Size mappings - Increased dot sizes and adjusted alignment
  const sizes = {
    sm: { text: 'text-lg', dotSize: 6, gap: 'gap-1.5' },
    md: { text: 'text-2xl', dotSize: 8, gap: 'gap-2' },
    lg: { text: 'text-4xl', dotSize: 12, gap: 'gap-3' },
    xl: { text: 'text-6xl', dotSize: 18, gap: 'gap-4' },
  };

  const s = sizes[size];

  useEffect(() => {
    let isMounted = true;
    
    const runLoop = async () => {
      if (!isMounted || !scope.current) return;

      while (isMounted) {
        // Frame 1: Neutral State (● ● ● ○)
        if (!scope.current) break;
        // Reset without animating
        // Fix: "transparent" is not animatable in some contexts, using rgba(0,0,0,0)
        await Promise.all([
          animate(".dot-1", { backgroundColor: "var(--text-primary)", opacity: 1, x: 0, scale: 1 }, { duration: 0 }),
          animate(".dot-2", { backgroundColor: "var(--text-primary)", opacity: 1, x: 0, scale: 1 }, { duration: 0 }),
          animate(".dot-3", { backgroundColor: "var(--text-primary)", opacity: 1, x: 0, scale: 1 }, { duration: 0 }),
          animate(".dot-4", { backgroundColor: "rgba(0, 0, 0, 0)", borderColor: "var(--text-primary)", opacity: 1, x: 0, scale: 1 }, { duration: 0 })
        ]);
        
        await new Promise(r => setTimeout(r, 1200)); // Hold neutral
        if (!isMounted || !scope.current) break;

        // Frame 2: Activation (Last dot fills orange, slight pulse) (● ● ● 🟠)
        await animate(".dot-4", { 
          backgroundColor: "var(--accent-color)", 
          borderColor: "rgba(0, 0, 0, 0)",
          scale: [1, 1.2, 1]
        }, { duration: 0.6, ease: "easeInOut" });
        
        await new Promise(r => setTimeout(r, 800)); // Hold activated state
        if (!isMounted || !scope.current) break;

        // Frame 3: Fade Past (First dot fades slightly) (◐ ● ● 🟠)
        await animate(".dot-1", { 
          opacity: 0.3,
          scale: 0.8
        }, { duration: 0.5, ease: "easeOut" });

        await new Promise(r => setTimeout(r, 500)); // Hold faded state
        if (!isMounted || !scope.current) break;

        // Frame 4: Shift Forward (All dots shift left, first disappears, new hollow appears at end)
        const shiftAmount = -(s.dotSize + (size === 'sm' ? 6 : size === 'md' ? 8 : size === 'lg' ? 12 : 16));
        
        await Promise.all([
          animate(".dot-1", { x: shiftAmount, opacity: 0 }, { duration: 0.5, ease: "easeInOut" }),
          animate(".dot-2", { x: shiftAmount }, { duration: 0.5, ease: "easeInOut" }),
          animate(".dot-3", { x: shiftAmount }, { duration: 0.5, ease: "easeInOut" }),
          animate(".dot-4", { x: shiftAmount }, { duration: 0.5, ease: "easeInOut" }),
        ]);
      }
    };

    runLoop();

    return () => {
      isMounted = false;
    };
  }, [animate, s.dotSize, size, scope]);

  return (
    <div ref={scope} className={`flex items-center gap-4 cursor-pointer group ${className}`}>
      {withText && (
        <span className={`font-black ${s.text} tracking-tighter text-[var(--text-primary)] italic uppercase group-hover:text-[var(--accent-color)] transition-colors leading-none self-center`}>
          grit.io
        </span>
      )}
      
      {/* Container must hide overflow during the shift left phase */}
      <div className={`flex items-center ${s.gap} overflow-hidden py-2 px-0.5 self-center`}>
        <motion.div 
          style={{ width: s.dotSize, height: s.dotSize }}
          className="dot-1 rounded-full shrink-0 border border-transparent" 
        />
        <motion.div 
          style={{ width: s.dotSize, height: s.dotSize }}
          className="dot-2 rounded-full shrink-0 border border-transparent" 
        />
        <motion.div 
          style={{ width: s.dotSize, height: s.dotSize }}
          className="dot-3 rounded-full shrink-0 border border-transparent" 
        />
        <motion.div 
          style={{ width: s.dotSize, height: s.dotSize }}
          className="dot-4 rounded-full shrink-0 box-border border" 
        />
      </div>
    </div>
  );
}
