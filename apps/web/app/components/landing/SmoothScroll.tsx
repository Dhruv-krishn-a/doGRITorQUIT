// apps/web/app/components/landing/SmoothScroll.tsx
'use client';

import React from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{
        duration: 1.2,
        smoothWheel: true,
        lerp: 0.1,
      }}
    >
      {children}
    </ReactLenis>
  );
}
