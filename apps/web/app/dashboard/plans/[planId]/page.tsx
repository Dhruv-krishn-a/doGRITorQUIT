// apps/web/app/dashboard/plans/[planId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plan } from "@/types/plan";
import Button from "@/components/ui/Button";

// Define a strict Task type based on the Plan interface to avoid 'any'
type Task = NonNullable<Plan["tasks"]>[number];

export default function PlanDetailPage() {
  const { planId } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    fetch(`/api/plans/${planId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load plan");
        return res.json();
      })
      .then((data) => setPlan(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading timeline...</div>;
  if (!plan) return <div className="p-12 text-center text-red-500">Plan not found</div>;

  // Group tasks by Date
  const timeline: Record<string, Task[]> = {};
  
  // Safe access to tasks
  const tasks = plan.tasks ?? [];

  tasks.forEach((task) => {
    // Safe date string or fallback
    const dateStr = task.date ? new Date(task.date).toISOString() : "";
    const key = dateStr.length >= 10 ? dateStr.substring(0, 10) : "Unscheduled";
    
    if (!timeline[key]) {
      timeline[key] = [];
    }
    // We know timeline[key] exists now
    timeline[key]!.push(task);
  });

  const sortedDates = Object.keys(timeline).sort();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-2 pl-0 hover:bg-transparent hover:underline"
          >
            ← Back to Plans
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{plan.title}</h1>
          {plan.description && <p className="text-slate-600 mt-1">{plan.description}</p>}
        </div>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 space-y-10">
        {sortedDates.map((dateKey, idx) => {
          const dayTasks = timeline[dateKey] ?? [];
          const isUnscheduled = dateKey === "Unscheduled";
          const displayDate = isUnscheduled 
            ? "Unscheduled" 
            : new Date(dateKey).toLocaleDateString("en-US", { weekday: 'short', month: 'long', day: 'numeric' });

          return (
            <div key={dateKey} className="relative pl-8">
              <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm" />
              
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                {displayDate}
                {!isUnscheduled && <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Day {idx + 1}</span>}
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {dayTasks.map((task) => (
                  <div key={task.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{task.title}</h4>
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          task.priority === 'High' ? 'bg-red-50 text-red-700' :
                          task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-600 whitespace-pre-line mb-3">{task.description}</p>
                    )}

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtasks</div>
                        {task.subtasks.map((st) => (
                          <div key={st.id} className="flex items-center gap-2 text-sm text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(task.estimatedMinutes ?? 0) > 0 && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                            <span>⏱ {task.estimatedMinutes} min</span>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}