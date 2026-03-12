// apps/web/app/dashboard/daily-checklist/client.tsx
"use client";

import React, { useEffect } from "react";
import { HabitsProvider, setHabitsApiBaseUrl, HabitData } from "@planner/habits-core";
import { ChecklistUI } from "@planner/habits-ui-web";

interface ChecklistClientProps {
  initialData: HabitData;
  serverDate: string;
}

export default function ChecklistClientPage({ 
  initialData, 
  serverDate 
}: ChecklistClientProps) {
  
  useEffect(() => {
    // In Web, we use the relative path (standard Next.js API routes)
    setHabitsApiBaseUrl("");
  }, []);

  return (
    <HabitsProvider>
      <ChecklistUI 
        initialData={initialData}
        serverDate={serverDate}
      />
    </HabitsProvider>
  );
}
