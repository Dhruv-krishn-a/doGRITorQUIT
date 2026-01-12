// apps/web/app/dashboard/tasks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import TaskItem from "@/features/tasks/components/TaskItem";
import { Task as BaseTask } from "@/types/plan";
import { Loader2 } from "lucide-react";

// ✅ FIX 1: Extend Task type locally to handle API extensions
interface ExtendedTask extends BaseTask {
  timeSpentMinutes?: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [filter, setFilter] = useState<"today" | "upcoming" | "completed" | "discarded">("today");
  const [loading, setLoading] = useState(true);

  // --- API CALLS ---
  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  // ✅ FIX 3: Replaced 'any' with Partial<ExtendedTask>
  const handleUpdate = async (taskId: string, updates: Partial<ExtendedTask>) => {
    // Optimistic
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    await fetch(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(updates) });
  };

  const handleLogTime = async (taskId: string, minutes: number) => {
    // ✅ FIX 1: timeSpentMinutes is now valid on ExtendedTask
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, timeSpentMinutes: (t.timeSpentMinutes || 0) + minutes } : t));
    await fetch(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ addMinutes: minutes }) });
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    // Deep update in state
    setTasks(prev => prev.map(t => ({
      ...t,
      subtasks: t.subtasks?.map(st => st.id === subtaskId ? { ...st, completed } : st)
    })));
    await fetch(`/api/subtasks/${subtaskId}`, { method: "PATCH", body: JSON.stringify({ completed }) });
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  };

  // --- FILTER LOGIC ---
  const filteredTasks = tasks.filter(t => {
    const isCompleted = t.status === "Completed";
    const isDiscarded = t.status === "Discarded";
    
    // Safety check for date
    const tDate = t.date ? new Date(t.date) : new Date(); 
    tDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (filter === "completed") return isCompleted;
    if (filter === "discarded") return isDiscarded;
    
    // Hide completed/discarded from Today/Upcoming views
    if (isCompleted || isDiscarded) return false;

    if (filter === "today") return tDate.getTime() <= today.getTime(); // Today + Overdue
    if (filter === "upcoming") return tDate.getTime() > today.getTime();
    
    return false;
  });

  // --- GROUPING LOGIC (New) ---
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const dateKey = task.date ? new Date(task.date).toDateString() : "No Date";
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(task);
    return groups;
  }, {} as Record<string, ExtendedTask[]>);

  // Sort dates (Today first, then future)
  const sortedDateKeys = Object.keys(groupedTasks).sort((a, b) => {
    if (a === "No Date") return 1;
    if (b === "No Date") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-slate-500">Manage your daily goals and track progress</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="bg-white p-1 rounded-lg border flex gap-1 shadow-sm">
          {(["today", "upcoming", "completed", "discarded"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === f 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-8">
          {sortedDateKeys.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400">No tasks in this view</p>
            </div>
          ) : (
            sortedDateKeys.map(dateKey => (
              <div key={dateKey}>
                <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
                  {dateKey === new Date().toDateString() ? (
                    <span className="text-blue-600 font-extrabold">Today</span>
                  ) : (
                    dateKey
                  )}
                  <span className="h-px bg-slate-200 flex-1 ml-2"></span>
                </h3>
                
                <div className="grid gap-3">
                  {/* ✅ FIX 2: Added optional chaining just in case */}
                  {groupedTasks[dateKey]?.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onLogTime={handleLogTime}
                      onToggleSubtask={handleToggleSubtask}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}