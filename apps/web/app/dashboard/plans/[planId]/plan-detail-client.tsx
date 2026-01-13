"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plan as BasePlan, Task as BaseTask } from "@/types/plan";
import Button from "@shared/components/ui/Button"; // Ensure this path is correct
import { Clock, CheckCircle2 } from "lucide-react";

// Types
interface ExtendedTask extends BaseTask {
  timeSpentMinutes?: number;
}

export interface ExtendedPlan extends Omit<BasePlan, 'tasks'> {
  tasks?: ExtendedTask[];
}

interface PlanDetailClientProps {
  initialPlan: ExtendedPlan;
}

export default function PlanDetailClient({ initialPlan }: PlanDetailClientProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<ExtendedPlan>(initialPlan);

  // --- Toggle Subtask (Optimistic + API) ---
  const toggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    // 1. Optimistic Update
    setPlan(prev => {
      if (!prev) return prev;
      const newTasks = prev.tasks?.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks?.map(s => s.id === subtaskId ? { ...s, completed } : s)
        };
      });
      return { ...prev, tasks: newTasks };
    });

    // 2. Persist to Server
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed })
      });
      // Optionally revalidate data in background
      router.refresh();
    } catch (error) {
      console.error("Failed to save subtask", error);
      // Revert state here if needed
      setPlan(initialPlan);
    }
  };

  // --- Calculate Stats ---
  const totalTasks = plan.tasks?.length || 0;
  const completedTasks = plan.tasks?.filter(t => t.status === "Completed").length || 0;
  
  const totalEstMinutes = plan.tasks?.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0) || 0;
  const totalSpentMinutes = plan.tasks?.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0) || 0;
  
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // --- Group Tasks by Date ---
  const timeline: Record<string, ExtendedTask[]> = {};
  
  (plan.tasks ?? []).forEach((task) => {
    const dateKey = task.date 
      ? new Date(task.date).toISOString().substring(0, 10) 
      : "Unscheduled";
      
    if (!timeline[dateKey]) {
      timeline[dateKey] = [];
    }
    timeline[dateKey].push(task);
  });

  const sortedDates = Object.keys(timeline).sort();

  return (
    <div className="p-6 max-w-5xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 pl-0 hover:bg-transparent hover:underline">
          ← Back to Plans
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">{plan.title}</h1>
        {plan.description && <p className="text-slate-600 mt-1">{plan.description}</p>}
      </div>

      {/* Stats Widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Progress</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{progress}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Est. Time</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {Math.floor(totalEstMinutes / 60)}h {totalEstMinutes % 60}m
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Actual Time</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {Math.floor(totalSpentMinutes / 60)}h {totalSpentMinutes % 60}m
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tasks Done</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {completedTasks} <span className="text-sm text-slate-400 font-normal">/ {totalTasks}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border-l-2 border-slate-200 ml-4 space-y-10 pb-10">
        {sortedDates.map((dateKey) => {
          const dateObj = new Date(dateKey);
          const isUnscheduled = dateKey === "Unscheduled";
          const displayDate = isUnscheduled ? "Unscheduled" : dateObj.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });

          return (
            <div key={dateKey} className="relative pl-8">
              <div className="absolute -left-2.25 top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm" />
              
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                {displayDate}
              </h3>

              <div className="grid gap-4">
                {timeline[dateKey]?.map(task => {
                  const isTaskCompleted = task.status === "Completed";
                  
                  return (
                    <div key={task.id} className={`bg-white border rounded-xl p-5 transition-all ${isTaskCompleted ? "opacity-60 bg-gray-50 border-gray-100" : "shadow-sm hover:shadow-md border-slate-200"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-bold text-lg ${isTaskCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {task.title}
                          </h4>
                          
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            {task.estimatedMinutes && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>Est: {task.estimatedMinutes}m</span>
                              </div>
                            )}
                            {(task.timeSpentMinutes || 0) > 0 && (
                              <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                <Clock size={12} />
                                <span>Spent: {task.timeSpentMinutes}m</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {task.priority && (
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                            task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      
                      {task.description && <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{task.description}</p>}

                      {/* Subtasks */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                          {task.subtasks.map(st => (
                            <div 
                              key={st.id} 
                              className="flex items-center gap-3 cursor-pointer group select-none"
                              onClick={() => toggleSubtask(task.id, st.id, !st.completed)}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${st.completed ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-blue-400"}`}>
                                {st.completed && <CheckCircle2 size={14} className="text-white" />}
                              </div>
                              <span className={`text-sm ${st.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}