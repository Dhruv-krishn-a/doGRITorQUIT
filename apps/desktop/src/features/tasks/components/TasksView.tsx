import React, { useState } from "react";
import TaskItem from "./TaskItem";
import { useTasks } from "../hooks/useTasks";

export default function TasksView() {
  const { tasks, loading, error, actions } = useTasks();
  const [filter, setFilter] = useState<"today" | "upcoming" | "completed" | "discarded">("today");

  if (loading) return <div className="p-8">Loading tasks...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  // --- FILTER LOGIC ---
  const filteredTasks = tasks.filter(t => {
    const isCompleted = t.status === "Completed" || t.status === "completed"; 
    const isDiscarded = t.status === "Discarded";
    
    const tDate = t.date ? new Date(t.date) : new Date(); 
    tDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (filter === "completed") return isCompleted;
    if (filter === "discarded") return isDiscarded;
    if (isCompleted || isDiscarded) return false;

    if (filter === "today") return tDate.getTime() <= today.getTime(); 
    if (filter === "upcoming") return tDate.getTime() > today.getTime();
    return false;
  });

  // --- GROUPING LOGIC ---
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const dateKey = task.date ? new Date(task.date).toDateString() : "No Date";
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(task);
    return groups;
  }, {} as Record<string, any[]>);

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
        
        <div className="bg-white p-1 rounded-lg border flex gap-1 shadow-sm">
          {(["today", "upcoming", "completed", "discarded"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === f ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {sortedDateKeys.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400">No tasks in this view</p>
          </div>
        ) : (
          sortedDateKeys.map(dateKey => (
            <div key={dateKey}>
              <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
                {dateKey === new Date().toDateString() ? <span className="text-blue-600 font-extrabold">Today</span> : dateKey}
                <span className="h-px bg-slate-200 flex-1 ml-2"></span>
              </h3>
              <div className="grid gap-3">
                {groupedTasks[dateKey]?.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onUpdate={actions.updateTask}
                    onDelete={actions.deleteTask}
                    onLogTime={actions.logTime}
                    onToggleSubtask={actions.toggleSubtask}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
