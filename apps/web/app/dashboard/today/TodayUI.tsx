// apps/web/app/dashboard/today/TodayUI.tsx
"use client";

import { TodayUI as SharedTodayUI } from "@planner/dashboard-ui-web";

export default function TodayUI() {
  return (
    <div className="transform-gpu flex flex-col w-full h-full min-h-screen bg-[#fdfbfb]">
      <SharedTodayUI />
    </div>
  );
}
