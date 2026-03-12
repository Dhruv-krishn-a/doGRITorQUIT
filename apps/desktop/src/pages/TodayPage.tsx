// apps/desktop/src/pages/TodayPage.tsx
import React from 'react';
import { TodayUI } from '@planner/dashboard-ui-web';

export default function TodayPage() {
  return (
    <div className="transform-gpu p-4 lg:p-8 max-w-7xl mx-auto w-full h-full">
      <TodayUI />
    </div>
  );
}
