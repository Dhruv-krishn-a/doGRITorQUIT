"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface StudyUIContextValue {
  renderLink: (props: { href: string; className?: string; children: React.ReactNode, key?: string | number }) => React.ReactNode;
  navigate: (to: string) => void;
}

const StudyUIContext = createContext<StudyUIContextValue | undefined>(undefined);

export function StudyUIProvider({ 
  children, 
  renderLink, 
  navigate 
}: StudyUIContextValue & { children: ReactNode }) {
  return (
    <StudyUIContext.Provider value={{ renderLink, navigate }}>
      {children}
      {/* We will inject the Modal Manager here in Phase 4 */}
    </StudyUIContext.Provider>
  );
}

export function useStudyUI() {
  const context = useContext(StudyUIContext);
  if (context === undefined) {
    return {
      renderLink: ({ href, children, className, key }: any) => <a href={href} className={className} key={key}>{children}</a>,
      navigate: (to: string) => { window.location.href = to; }
    };
  }
  return context;
}