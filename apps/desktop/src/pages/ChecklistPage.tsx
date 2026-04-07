// apps/desktop/src/pages/ChecklistPage.tsx
import React from 'react';
import { HabitsProvider } from "@gritorquit/habits-core";
import { ChecklistUI } from "@gritorquit/habits-ui-web";
import { sqliteHabitsBridge } from '../lib/habits-bridge';

export default function ChecklistPage() {
  return (
    <HabitsProvider offlineStorage={sqliteHabitsBridge}>
      <ChecklistUI />
    </HabitsProvider>
  );
}
