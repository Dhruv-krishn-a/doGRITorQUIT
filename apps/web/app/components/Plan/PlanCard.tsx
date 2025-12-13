"use client";
import React from "react";
import Button from "@/components/ui/Button";
import { Plan } from "@/types/plan";

interface PlanCardProps {
  plan: Plan;
  onView: (plan: Plan) => void;
  onDelete: () => void;
}

export default function PlanCard({ plan, onView, onDelete }: PlanCardProps) {
  const getDaysRemaining = (): number | string => {
    if (!plan.endDate) return "-";
    
    const end = new Date(plan.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return "Expired";
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getTaskCount = (): number => {
    return plan.tasks?.length || 0;
  };

  const getProgress = (): number => {
    return plan.progress ?? 0;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 truncate pr-2">
          {plan.title}
        </h3>
        <button 
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          aria-label={`Delete plan: ${plan.title}`}
        >
          Delete
        </button>
      </div>

      {plan.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {plan.description}
        </p>
      )}

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{getProgress()}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            style={{ width: `${getProgress()}%` }} 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm">
          <div className="text-gray-700">
            <span className="font-medium">{getTaskCount()}</span> tasks
          </div>
          <div className="text-gray-500">
            {getDaysRemaining()} {typeof getDaysRemaining() === "number" ? "days left" : ""}
          </div>
        </div>

        <Button 
          onClick={() => onView(plan)} 
          variant="primary"
          className="min-w-[100px]"
        >
          View Plan
        </Button>
      </div>
    </div>
  );
}