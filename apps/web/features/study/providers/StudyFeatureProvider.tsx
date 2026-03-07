"use client";

import React from 'react';
import { StudyProvider } from '@planner/study-core';
import { StudyUIProvider, StudyModalManager } from '@planner/study-ui-web';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function StudyFeatureProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <StudyProvider>
      <StudyUIProvider 
        renderLink={({ children, ...props }) => (
          <Link {...props}>
            {children}
          </Link>
        )}
        navigate={(to) => router.push(to)}
      >
        <StudyModalManager />
        {children}
      </StudyUIProvider>
    </StudyProvider>
  );
}