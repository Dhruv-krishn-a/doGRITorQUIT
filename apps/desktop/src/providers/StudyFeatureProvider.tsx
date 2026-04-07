//apps/desktop/src/providers/StudyFeatureProvider.tsx
"use client";
import React from 'react';
import { StudyProvider } from '@gritorquit/study-core';
import { StudyUIProvider } from '@gritorquit/study-ui-web';
import { Link, useNavigate } from 'react-router-dom';
import { OfflineProvider } from './OfflineProvider';
import { sqliteOfflineBridge } from '../lib/offline-bridge';

export function StudyFeatureProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <OfflineProvider>
      <StudyProvider offlineStorage={sqliteOfflineBridge}>
        <StudyUIProvider 
          renderLink={({ href, ...props }) => <Link to={href.replace('/dashboard', '')} {...props} />}
          navigate={(to) => navigate(to.replace('/dashboard', ''))}
        >
          {children}
        </StudyUIProvider>
      </StudyProvider>
    </OfflineProvider>
  );
}
