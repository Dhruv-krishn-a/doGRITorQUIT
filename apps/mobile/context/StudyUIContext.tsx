import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'expo-router';

interface StudyUIContextValue {
  navigate: (to: string) => void;
  // Mobile doesn't need renderLink since it uses expo-router's Link or useRouter programmatically
}

const StudyUIContext = createContext<StudyUIContextValue | undefined>(undefined);

export function StudyUIProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigate = (to: string) => {
    // Basic mapping from web paths to mobile paths if needed, 
    // or just pass through for now
    router.push(to as any);
  };

  return (
    <StudyUIContext.Provider value={{ navigate }}>
      {children}
    </StudyUIContext.Provider>
  );
}

export function useStudyUI() {
  const context = useContext(StudyUIContext);
  if (context === undefined) {
    throw new Error('useStudyUI must be used within a StudyUIProvider');
  }
  return context;
}
