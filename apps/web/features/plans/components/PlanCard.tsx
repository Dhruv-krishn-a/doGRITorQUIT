// apps/web/features/plans/components/PlanCard.tsx
"use client";

import React from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Play,
  Bot,
  FileSpreadsheet
} from "lucide-react";
import { Plan } from "@/types/plan";

interface PlanCardProps {
  plan: Plan;
  onView: (plan: Plan) => void;
  onDelete: () => void;
}

export default function PlanCard({ plan, onView, onDelete }: PlanCardProps) {
  // --- Helpers ---
  const progress = plan.progress ?? 0;
  const taskCount = plan.tasks?.length || 0;
  
  // Calculate total hours (approximate based on estimatedMinutes or default 60m)
  const totalMinutes = plan.tasks?.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0) || 0;
  const totalHours = Math.round(totalMinutes / 60);

  // Status Logic
  const isCompleted = progress === 100;
  const isStarted = progress > 0;
  
  // Determine Badge
  let statusBadge;
  let statusColor;
  
  if (isCompleted) {
    statusBadge = "Completed";
    statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
  } else if (isStarted) {
    statusBadge = "Active";
    statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
  } else {
    statusBadge = "Draft";
    statusColor = "bg-slate-100 text-slate-600 border-slate-200";
  }

  // Determine Source (Heuristic checks)
  // In a real app, you might have a specific 'source' field in your DB
  const isAI = plan.description?.toLowerCase().includes("ai") || plan.title.toLowerCase().includes("ai");
  const isImport = plan.description?.toLowerCase().includes("import");

  return (
    <div 
      onClick={() => onView(plan)}
      className="group relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="p-6 flex flex-col h-full">
        
        {/* Top Badges & Actions */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor}`}>
              {statusBadge}
            </span>
            {isAI && (
              <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100 text-xs font-medium flex items-center gap-1">
                <Bot size={12} /> AI Generated
              </span>
            )}
            {isImport && (
               <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 text-xs font-medium flex items-center gap-1">
                <FileSpreadsheet size={12} /> Imported
              </span>
            )}
          </div>
          
          {/* Delete Button (Visible on Hover) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            title="Delete Plan"
          >
            <span className="sr-only">Delete</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {plan.title}
        </h3>
        
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 font-medium">
           <div className="flex items-center gap-1.5">
             <CheckCircle2 size={14} className="text-slate-400" /> {taskCount} Tasks
           </div>
           <div className="flex items-center gap-1.5">
             <Clock size={14} className="text-slate-400" /> {totalHours} Hours
           </div>
           {plan.startDate && (
             <div className="flex items-center gap-1.5">
               <Calendar size={14} className="text-slate-400" /> {format(new Date(plan.startDate), 'MMM d')}
             </div>
           )}
        </div>

        {/* Progress Section (Pushed to bottom) */}
        <div className="mt-auto pt-4 border-t border-slate-50">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Progress</span>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
            <div 
              style={{ width: `${progress}%` }} 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isCompleted ? "bg-emerald-500" : "bg-indigo-600"
              }`}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
                e.stopPropagation();
                onView(plan);
            }}
            className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isCompleted 
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-indigo-200"
            }`}
          >
            {isCompleted ? (
              <>View Details <ArrowRight size={16} /></>
            ) : isStarted ? (
              <>Resume Plan <Play size={16} fill="currentColor" /></>
            ) : (
              <>Start Today <Play size={16} fill="currentColor" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}