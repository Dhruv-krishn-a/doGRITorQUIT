"use client";

import React from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Timer,
  Clock
} from "lucide-react";
// Adjust this import path if your type is located elsewhere
import { Plan } from "@/types/plan";

interface PlanCardProps {
  plan: Plan;
  onView: (plan: Plan) => void;
  onDelete: () => void;
}

export default function PlanCard({ plan, onView, onDelete }: PlanCardProps) {
  // --- Helper Logic ---

  const getProgress = () => plan.progress ?? 0;
  const taskCount = plan.tasks?.length || 0;

  // Calculate Status & Time Info
  const now = new Date();
  const endDate = plan.endDate ? new Date(plan.endDate) : null;
  const isExpired = endDate ? endDate < now : false;
  const isCompleted = getProgress() === 100;
  
  const getDaysRemaining = () => {
    if (!endDate) return null;
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysRemaining();

  // Determine Badge Styling
  let statusBadge;
  if (isCompleted) {
    statusBadge = (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
        <CheckCircle2 size={12} /> Completed
      </span>
    );
  } else if (isExpired) {
    statusBadge = (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-100">
        <AlertCircle size={12} /> Overdue
      </span>
    );
  } else {
    statusBadge = (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
        <Timer size={12} /> Active
      </span>
    );
  }

  // --- Handlers ---
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent parent onClick
    onDelete();
  };

  return (
    <div 
      onClick={() => onView(plan)}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Header Section */}
      <div className="p-5 flex justify-between items-start border-b border-slate-50 bg-slate-50/30">
        <div className="space-y-1.5 flex-1 min-w-0 pr-4">
          <div className="flex items-center justify-between mb-2">
             {statusBadge}
             {/* Delete Button */}
             <button
                onClick={handleDelete}
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors z-10"
                title="Delete Plan"
                type="button"
              >
                <Trash2 size={16} />
              </button>
          </div>
          <h3 className="text-lg font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-700 transition-colors">
            {plan.title}
          </h3>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10 leading-relaxed">
          {plan.description || "No description provided."}
        </p>

        {/* Progress Bar */}
        <div className="mt-auto space-y-2">
          <div className="flex justify-between items-end text-xs font-semibold">
            <span className="text-slate-500 uppercase tracking-wider">Progress</span>
            <span className={isCompleted ? "text-emerald-600" : "text-indigo-600"}>
              {getProgress()}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              style={{ width: `${getProgress()}%` }} 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isCompleted 
                  ? "bg-emerald-500" 
                  : isExpired 
                    ? "bg-rose-500" 
                    : "bg-linear-to-r from-indigo-500 to-purple-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
        <div className="flex gap-4">
           {/* Task Count */}
           <div className="flex items-center gap-1.5" title="Total Tasks">
              <CheckCircle2 size={14} className="text-slate-400" />
              <span className="font-medium">{taskCount} tasks</span>
           </div>

           {/* Days Left */}
           {daysLeft !== null && !isCompleted && !isExpired && (
             <div className="flex items-center gap-1.5" title="Days Remaining">
                <Clock size={14} className="text-slate-400" />
                <span className="font-medium text-indigo-600">{daysLeft} days left</span>
             </div>
           )}
           
           {/* Start Date - Hydration Safe */}
           {plan.startDate && (
             <div className="flex items-center gap-1.5" title="Start Date">
                <Calendar size={14} className="text-slate-400" />
                <span>{format(new Date(plan.startDate), 'MMM d')}</span>
             </div>
           )}
        </div>

        {/* Hover Arrow */}
        <div className="w-8 h-8 rounded-full bg-slate-50 text-indigo-600 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
            <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}