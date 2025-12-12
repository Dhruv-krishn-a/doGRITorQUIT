// apps/web/app/components/Plan/PlanCard.tsx
"use client";
import React from "react";
// FIX: Updated import path (removed /app)
import Button from "@/components/ui/Button";
import { Plan } from "@/types/plan";

type Props = {
  plan: Plan;
  onView: (plan: Plan) => void;
  onDelete: () => void;
};

export default function PlanCard({ plan, onView, onDelete }: Props) {
  const getDaysRemaining = () => {
    if (!plan.endDate) return "-";
    const diff = new Date(plan.endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // FIX: Removed unused function 'getDuration'

  return (
    <div className="bg-(--bg-card) rounded-xl border p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold">{plan.title}</h3>
        <div className="flex gap-2">
          <button onClick={onDelete} className="text-red-500">Delete</button>
        </div>
      </div>

      {plan.description && <p className="text-sm text-(--text-secondary) mt-2">{plan.description}</p>}

      <div className="mt-4">
        <div className="flex justify-between text-sm text-(--text-secondary)">
          <span>Progress</span>
          <span>{plan.progress ?? 0}%</span>
        </div>
        <div className="h-2 bg-(--hover-bg) rounded mt-2 overflow-hidden">
          <div style={{ width: `${plan.progress ?? 0}%` }} className="h-full bg-(--accent-color)" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-(--text-secondary)">
          <div>{plan.tasks?.length ?? 0} tasks</div>
          <div>{getDaysRemaining()} days left</div>
        </div>

        <div className="flex gap-2">
          {/* FIX: Removed invalid 'size' prop */}
          <Button onClick={() => onView(plan)} variant="primary">View Plan</Button>
        </div>
      </div>
    </div>
  );
}