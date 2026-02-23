import React from 'react';
import { StudyFeatureProvider } from '@/features/study/providers/StudyFeatureProvider';

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    // Changed to `block w-full` to force the container to take 100% of available width
    <div className="block w-full h-full bg-white overflow-y-auto">
      <StudyFeatureProvider>
        {children}
      </StudyFeatureProvider>
    </div>
  );
}