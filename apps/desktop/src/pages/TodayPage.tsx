// apps/desktop/src/pages/TodayPage.tsx
import React from 'react';
import { TodayUI } from '@gritorquit/dashboard-ui-web';
import { HabitsProvider } from '@gritorquit/habits-core';
import { StudyFeatureProvider } from '../providers/StudyFeatureProvider';
import { sqliteHabitsBridge } from '../lib/habits-bridge';

export default function TodayPage() {
 return (
  <HabitsProvider offlineStorage={sqliteHabitsBridge}>
   <StudyFeatureProvider>
    <div className="min-h-screen w-full bg-[#fafbfc]">
     <TodayUI />
    </div>
   </StudyFeatureProvider>
  </HabitsProvider>
 );
}
