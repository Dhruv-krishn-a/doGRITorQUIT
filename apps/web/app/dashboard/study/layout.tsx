//apps/web/app/dashboard/study/layout.tsx
import React from 'react';
import { StudyFeatureProvider } from '@/features/study/providers/StudyFeatureProvider';

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    // CHANGED: Removed `bg-white` and `overflow-y-auto` so it seamlessly inherits the dark theme from the parent dashboard layout
    <div className="block w-full h-full bg-transparent">
      <StudyFeatureProvider>
        {children}
      </StudyFeatureProvider>
    </div>
  );
}