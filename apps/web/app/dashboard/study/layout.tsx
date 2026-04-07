//apps/web/app/dashboard/study/layout.tsx
import React from 'react';

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="transform-gpu block w-full h-full bg-transparent">
      {children}
    </div>
  );
}