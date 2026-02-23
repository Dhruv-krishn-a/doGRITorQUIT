//apps/desktop/src/providers/StudyFeatureProvider.tsx
"use client";

import React from 'react';
import { StudyProvider } from '@planner/study-core';
import { StudyUIProvider } from '@planner/study-ui-web';
import { Link, useNavigate } from 'react-router-dom';

export function StudyFeatureProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <StudyProvider>
      <StudyUIProvider 
        renderLink={({ href, ...props }) => <Link to={href.replace('/dashboard', '')} {...props} />}
        navigate={(to) => navigate(to.replace('/dashboard', ''))}
      >
        {children}
      </StudyUIProvider>
    </StudyProvider>
  );
}
