"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plan as BasePlan, Task as BaseTask, Subtask as BaseSubtask } from "@/types/plan";
import Button from "../../../../shared/components/ui/Button"; 
import { Clock, CheckCircle2, Plus, Trash2, Pencil, X, Save } from "lucide-react";

// --- 1. Types ---
type PriorityType = "Low" | "Medium" | "High" | "Urgent" | "low" | "medium" | "high" | "urgent";

interface ExtendedSubtask extends BaseSubtask {
  completed: boolean;
}

interface ExtendedTask extends Omit<BaseTask, 'subtasks' | 'priority'> {
  subtasks?: ExtendedSubtask[];
  timeSpentMinutes?: number;
  priority?: PriorityType | string | null;
}

export interface ExtendedPlan extends Omit<BasePlan, 'tasks'> {
  tasks?: ExtendedTask[];
}

interface TaskFormData {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: PriorityType;
  subtasks?: string[];
}

// Interface for the actions object returned by the hook
interface PlanManagerActions {
  insertDay: (date: string) => Promise<void>;
  deleteDay: (date: string) => Promise<void>;
  createTask: (data: TaskFormData) => Promise<void>;
  updateTask: (taskId: string, data: TaskFormData) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
}

// --- 2. Utilities ---
const normalizeDate = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- 3. Custom Hook (Logic Layer) ---
function usePlanManager(initialPlan: ExtendedPlan) {
  const router = useRouter();
  const [plan, setPlan] = useState<ExtendedPlan>(initialPlan);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // UI State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [creatingTaskDate, setCreatingTaskDate] = useState<string | null>(null);

  useEffect(() => { setPlan(initialPlan); }, [initialPlan]);

  const refresh = () => router.refresh();

  // API Helpers
  const apiCall = async (url: string, method: string, body?: unknown, errorMsg = "Operation failed") => {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) throw new Error(errorMsg);
      return true;
    } catch {
      alert(errorMsg);
      return false;
    }
  };

  // Actions
  const actions: PlanManagerActions = {
    insertDay: async (date: string) => {
      if (!confirm(`Shift tasks to insert day at ${date}?`)) return;
      setLoadingAction("Inserting...");
      if (await apiCall(`/api/plans/${plan.id}/days`, "POST", { date })) {
        setCreatingTaskDate(date);
        refresh();
      }
      setLoadingAction(null);
    },
    deleteDay: async (date: string) => {
      if (!confirm(`Delete ${date}? Tasks will be lost.`)) return;
      setLoadingAction("Deleting...");
      if (await apiCall(`/api/plans/${plan.id}/days?date=${date}`, "DELETE")) refresh();
      setLoadingAction(null);
    },
    createTask: async (data: TaskFormData) => {
      if (!creatingTaskDate) return;
      if (await apiCall(`/api/tasks`, "POST", { planId: plan.id, date: creatingTaskDate, ...data })) {
        setCreatingTaskDate(null);
        refresh();
      }
    },
    updateTask: async (taskId: string, data: TaskFormData) => {
      if (await apiCall(`/api/tasks/${taskId}`, "PATCH", data)) {
        setEditingTaskId(null);
        refresh();
      }
    },
    deleteTask: async (taskId: string) => {
      if (!confirm("Delete task?")) return;
      if (await apiCall(`/api/tasks/${taskId}`, "DELETE")) refresh();
    },
    toggleSubtask: async (taskId: string, subtaskId: string, completed: boolean) => {
      // Optimistic UI Update
      setPlan(prev => ({
        ...prev,
        tasks: prev.tasks?.map(t => t.id === taskId ? {
          ...t,
          subtasks: t.subtasks?.map(s => s.id === subtaskId ? { ...s, completed } : s)
        } : t)
      }));
      // Background Sync
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed })
      });
      refresh();
    },
    deleteSubtask: async (subtaskId: string) => {
      if (!confirm("Delete subtask?")) return;
      if (await apiCall(`/api/subtasks/${subtaskId}`, "DELETE")) refresh();
    }
  };

  return { plan, loadingAction, editingTaskId, setEditingTaskId, creatingTaskDate, setCreatingTaskDate, actions };
}

// --- 4. Sub-Components ---

// A. Task Form (Create & Edit)
function TaskForm({ initialData, onSubmit, onCancel, isCreating }: { 
  initialData?: Partial<ExtendedTask>, 
  onSubmit: (data: TaskFormData) => Promise<void>, 
  onCancel: () => void, 
  isCreating?: boolean 
}) {
  const [subtasks, setSubtasks] = useState(initialData?.subtasks?.map(s => ({ title: s.title })) || []);
  const [newSubtask, setNewSubtask] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      estimatedMinutes: Number(fd.get("estimatedMinutes")),
      priority: fd.get("priority") as PriorityType,
      subtasks: subtasks.map(s => s.title)
    });
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white border-2 border-indigo-500/20 rounded-xl p-5 shadow-xl ring-4 ring-indigo-50/30 my-4 animate-in fade-in zoom-in-95 duration-200">
      <form onSubmit={handleSubmit}>
        <input name="title" defaultValue={initialData?.title} className="w-full font-bold text-xl text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-hidden pb-1 mb-4" placeholder="What needs to be done?" autoFocus required />
        
        <div className="flex items-center gap-3 mb-4">
            <select name="priority" defaultValue={initialData?.priority || "Medium"} className="bg-slate-50 border border-slate-200 text-slate-600 rounded-md px-3 py-1.5 text-xs font-bold uppercase focus:ring-2 focus:ring-indigo-500/20 outline-hidden cursor-pointer">
               {["Low", "Medium", "High", "Urgent"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md px-3 py-1.5">
                <Clock size={13} className="text-slate-400" />
                <input name="estimatedMinutes" type="number" defaultValue={initialData?.estimatedMinutes || 60} className="w-10 text-xs font-medium bg-transparent outline-hidden" />
                <span className="text-[10px] font-bold uppercase text-slate-400">min</span>
            </div>
        </div>

        <textarea name="description" defaultValue={initialData?.description || ""} className="w-full text-sm text-slate-600 bg-slate-50/50 border-0 rounded-lg p-3 resize-none outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/10 mb-4" placeholder="Add notes..." rows={3} />

        <div className="pt-3 border-t border-slate-100">
            <div className="space-y-2 mb-2">
                {subtasks.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded">
                        <span className="flex-1 text-sm text-slate-700">{st.title}</span>
                        <button type="button" onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}><X size={14} className="text-slate-400 hover:text-red-500"/></button>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <Plus size={14} className="text-slate-400" />
                <input className="flex-1 text-sm bg-transparent outline-hidden" placeholder="Add subtask item..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newSubtask.trim() && (setSubtasks([...subtasks, { title: newSubtask.trim() }]), setNewSubtask("")))} />
                <button type="button" onClick={() => { if(newSubtask.trim()) { setSubtasks([...subtasks, { title: newSubtask.trim() }]); setNewSubtask(""); }}} className="text-xs font-semibold text-indigo-600 px-2 py-1">Add</button>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="text-xs font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center gap-2 shadow-sm"><Save size={13} /> {isCreating ? "Create" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

// B. Task Card (View Only)
function TaskCard({ task, actions, onEdit }: { task: ExtendedTask, actions: PlanManagerActions, onEdit: () => void }) {
  const isCompleted = task.status === "Completed";
  return (
    <div className={`group relative bg-white border rounded-xl p-5 transition-all ${isCompleted ? "opacity-60 bg-slate-50 grayscale-[0.5]" : "shadow-sm hover:shadow-md hover:border-indigo-200"}`}>
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-white shadow-xs border border-slate-100"><Pencil size={14} /></button>
            <button onClick={() => actions.deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded bg-white shadow-xs border border-slate-100"><Trash2 size={14} /></button>
        </div>

        <div className="pr-12 mb-3">
            <h4 className={`font-bold text-lg leading-snug mb-1.5 ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</h4>
            <div className="flex items-center gap-3">
                {task.priority && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${task.priority.toLowerCase() === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</span>}
                {task.estimatedMinutes && <div className="flex items-center gap-1 text-xs text-slate-400 font-medium"><Clock size={12} /> {task.estimatedMinutes}m</div>}
            </div>
        </div>
        
        {task.description && <p className="text-sm text-slate-600 whitespace-pre-line mb-4">{task.description}</p>}
        
        {/* Read-Only Subtasks List */}
        {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-50">
                {task.subtasks.map(st => (
                    <div key={st.id} className="flex items-start gap-3 py-1 group/st">
                        <button onClick={() => actions.toggleSubtask(task.id, st.id, !st.completed)} className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${st.completed ? "bg-indigo-500 border-indigo-500" : "border-slate-300 hover:border-indigo-400"}`}>
                            {st.completed && <CheckCircle2 size={10} className="text-white" />}
                        </button>
                        <span className={`flex-1 text-sm ${st.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{st.title}</span>
                        <button onClick={() => actions.deleteSubtask(st.id)} className="opacity-0 group-hover/st:opacity-100 text-slate-300 hover:text-red-500"><X size={12}/></button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}

// C. Empty Slot
function EmptyDaySlot({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <button onClick={onClick} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"><Plus size={16} /></div>
        {label}
    </button>
  );
}

// --- 5. Main Component ---

export default function PlanDetailClient({ initialPlan }: { initialPlan: ExtendedPlan }) {
  const router = useRouter();
  const { plan, loadingAction, editingTaskId, setEditingTaskId, creatingTaskDate, setCreatingTaskDate, actions } = usePlanManager(initialPlan);

  // 1. Calculate Date Range
  const displayDates = useMemo(() => {
    const dates = [];
    let start = plan.startDate ? new Date(plan.startDate) : new Date();
    let end = plan.endDate ? new Date(plan.endDate) : new Date();
    
    // Expand range to include task dates if they fall outside
    const taskDates = (plan.tasks || []).filter(t => t.date).map(t => new Date(t.date!).getTime());
    if (taskDates.length) {
        start = new Date(Math.min(start.getTime(), ...taskDates));
        end = new Date(Math.max(end.getTime(), ...taskDates));
    }
    // Expand to include currently creating date
    if (creatingTaskDate) {
        const cDate = new Date(creatingTaskDate);
        if (cDate < start) start = cDate;
        if (cDate > end) end = cDate;
    }

    start.setHours(0,0,0,0); end.setHours(0,0,0,0);
    
    const current = new Date(start);
    while (current <= end) {
        dates.push(normalizeDate(current));
        current.setDate(current.getDate() + 1);
    }
    
    // Add unscheduled at the end if needed
    if (plan.tasks?.some(t => !t.date)) dates.push("Unscheduled");
    return dates;
  }, [plan, creatingTaskDate]);

  // 2. Group Tasks
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, ExtendedTask[]> = {};
    (plan.tasks || []).forEach(t => {
        const key = t.date ? normalizeDate(t.date) : "Unscheduled";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
    });
    return grouped;
  }, [plan.tasks]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto pb-40">
      {/* Loading Overlay */}
      {loadingAction && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white px-6 py-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
                <span className="text-sm font-medium text-slate-700">{loadingAction}</span>
            </div>
        </div>
      )}

      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 pl-0 text-slate-500">← Back</Button>
        <h1 className="text-3xl font-extrabold text-slate-900">{plan.title}</h1>
        {plan.description && <p className="text-slate-600 mt-1">{plan.description}</p>}
      </div>

      <div className="border-l-2 border-slate-200 ml-4 md:ml-6 space-y-10">
        {displayDates.map((dateKey) => {
          const isUnscheduled = dateKey === "Unscheduled";
          const displayDate = isUnscheduled ? "Unscheduled" : new Date(dateKey).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
          const isToday = normalizeDate(new Date()) === dateKey;
          const dayTasks = tasksByDate[dateKey] || [];
          const isCreating = creatingTaskDate === dateKey;

          return (
            <div key={dateKey} className="relative pl-8 md:pl-10 group/day">
              {/* Insert Day Button */}
              {!isUnscheduled && (
                  <button onClick={() => actions.insertDay(dateKey)} className="absolute -left-5 -top-7 w-10 h-10 flex items-center justify-center opacity-0 group-hover/day:opacity-100 transition-opacity z-10 bg-white border border-indigo-200 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white shadow-sm" title="Insert Day"><Plus size={14} /></button>
              )}

              {/* Timeline Dot */}
              <div className={`absolute -left-2.5 top-1.5 w-5 h-5 rounded-full border-4 shadow-sm z-10 bg-white ${isToday ? "border-indigo-500" : "border-slate-300"}`} />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isToday ? "text-indigo-700" : "text-slate-800"}`}>
                    {displayDate} {isToday && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">TODAY</span>}
                </h3>
                {!isUnscheduled && <button onClick={() => actions.deleteDay(dateKey)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/day:opacity-100 transition-opacity"><Trash2 size={16} /></button>}
              </div>

              {/* Tasks */}
              <div className="grid gap-4">
                {dayTasks.map(task => 
                  editingTaskId === task.id ? (
                    <TaskForm key={task.id} initialData={task} onSubmit={(data) => actions.updateTask(task.id, data)} onCancel={() => setEditingTaskId(null)} />
                  ) : (
                    <TaskCard key={task.id} task={task} actions={actions} onEdit={() => setEditingTaskId(task.id)} />
                  )
                )}

                {/* Create Form or Add Button */}
                {isCreating ? (
                    <TaskForm isCreating onSubmit={actions.createTask} onCancel={() => setCreatingTaskDate(null)} />
                ) : (
                    <EmptyDaySlot label={dayTasks.length === 0 ? "Empty Day - Add Task" : "Add Another Task"} onClick={() => setCreatingTaskDate(dateKey)} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}