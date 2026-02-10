// apps/web/app/dashboard/plans/[planId]/plan-detail-client.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plan as BasePlan, Task as BaseTask, Subtask as BaseSubtask } from "@/types/plan";
import Button from "../../../../shared/components/ui/Button"; 
import { Clock, CheckCircle2, Plus, Trash2, Pencil, X, Save, Calendar, ChevronRight, Layout, BarChart3, AlertCircle } from "lucide-react";

// --- 1. Types (Unchanged) ---
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

const formatDateReadable = (dateStr: string) => {
    if (dateStr === "Unscheduled") return "Unscheduled";
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
};

// --- 3. Custom Hook (Logic Unchanged) ---
function usePlanManager(initialPlan: ExtendedPlan) {
  const router = useRouter();
  const [plan, setPlan] = useState<ExtendedPlan>(initialPlan);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // UI State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [creatingTaskDate, setCreatingTaskDate] = useState<string | null>(null);

  useEffect(() => { setPlan(initialPlan); }, [initialPlan]);

  const refresh = () => router.refresh();

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
      setPlan(prev => ({
        ...prev,
        tasks: prev.tasks?.map(t => t.id === taskId ? {
          ...t,
          subtasks: t.subtasks?.map(s => s.id === subtaskId ? { ...s, completed } : s)
        } : t)
      }));
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

// --- 4. Sub-Components (Restyled for Screenshot Vibe) ---

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
    <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-xl ring-4 ring-purple-50/50 my-4 animate-in fade-in zoom-in-95 duration-200">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-4 mb-4">
             <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Layout size={20}/></div>
             <div className="flex-1">
                <input name="title" defaultValue={initialData?.title} className="w-full font-bold text-xl text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-purple-500 focus:outline-hidden pb-1" placeholder="Task Title..." autoFocus required />
             </div>
        </div>
        
        <div className="flex items-center gap-3 mb-6 pl-14">
            <select name="priority" defaultValue={initialData?.priority || "Medium"} className="bg-slate-50 border border-slate-200 text-slate-600 rounded-full px-3 py-1 text-xs font-bold uppercase focus:ring-2 focus:ring-purple-500/20 outline-hidden cursor-pointer hover:bg-white">
               {["Low", "Medium", "High", "Urgent"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full px-3 py-1">
                <Clock size={12} className="text-slate-400" />
                <input name="estimatedMinutes" type="number" defaultValue={initialData?.estimatedMinutes || 60} className="w-10 text-xs font-medium bg-transparent outline-hidden" />
                <span className="text-[10px] font-bold uppercase text-slate-400">min</span>
            </div>
        </div>

        <div className="pl-14">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea name="description" defaultValue={initialData?.description || ""} className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 mb-6" placeholder="What is this task about?" rows={2} />

            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subtasks</label>
            <div className="space-y-2 mb-3">
                {subtasks.map((st, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-lg group shadow-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-200"></div>
                        <span className="flex-1 text-sm text-slate-700">{st.title}</span>
                        <button type="button" onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}><X size={14} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"/></button>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-3 p-2 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-300 transition-colors bg-slate-50/50">
                <Plus size={16} className="text-purple-400" />
                <input className="flex-1 text-sm bg-transparent outline-hidden placeholder:text-slate-400" placeholder="Add a new subtask..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newSubtask.trim() && (setSubtasks([...subtasks, { title: newSubtask.trim() }]), setNewSubtask("")))} />
                <button type="button" onClick={() => { if(newSubtask.trim()) { setSubtasks([...subtasks, { title: newSubtask.trim() }]); setNewSubtask(""); }}} className="text-xs font-bold text-purple-600 uppercase tracking-wide px-2">Add</button>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform active:scale-95"><Save size={16} /> {isCreating ? "Create Task" : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}

// Visual Task Card - Matching the "Tasks" list in screenshot
function TaskCard({ task, actions, onEdit }: { task: ExtendedTask, actions: PlanManagerActions, onEdit: () => void }) {
  const isCompleted = task.status === "Completed";
  
  return (
    <div className={`group relative bg-white border rounded-2xl p-6 transition-all duration-300 ${isCompleted ? "opacity-75 bg-slate-50/50 grayscale-[0.3]" : "shadow-sm border-slate-100 hover:shadow-lg hover:border-purple-200"}`}>
        {/* Hover Actions */}
        <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <button onClick={onEdit} className="p-2 text-slate-400 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors" title="Edit"><Pencil size={15} /></button>
            <button onClick={() => actions.deleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={15} /></button>
        </div>

        {/* Task Header */}
        <div className="flex items-start gap-4 mb-4">
             {/* Checkbox (Visual only for parent task in this view, could trigger status) */}
             <button className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted ? "bg-purple-600 border-purple-600" : "border-slate-300 hover:border-purple-400"}`}>
                {isCompleted && <CheckCircle2 size={14} className="text-white" />}
             </button>

             <div className="flex-1 pr-16">
                 <h4 className={`font-bold text-lg leading-snug mb-2 ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</h4>
                 <div className="flex flex-wrap items-center gap-3">
                     {task.priority && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            task.priority.toLowerCase() === 'high' || task.priority.toLowerCase() === 'urgent' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}>
                            {task.priority} Priority
                        </span>
                     )}
                     <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Clock size={12} /> {task.estimatedMinutes}m est.
                     </span>
                 </div>
             </div>
        </div>
        
        {task.description && <p className="text-sm text-slate-500 whitespace-pre-line mb-6 pl-10 border-l-2 border-slate-100 ml-3">{task.description}</p>}
        
        {/* Subtasks - Styled to look like the checklist in screenshot */}
        {task.subtasks && task.subtasks.length > 0 && (
            <div className="pl-10 space-y-3">
                {task.subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-3 group/st">
                        <button onClick={() => actions.toggleSubtask(task.id, st.id, !st.completed)} className={`w-5 h-5 rounded border flex items-center justify-center transition-all shadow-sm ${st.completed ? "bg-purple-500 border-purple-500" : "bg-white border-slate-300 hover:border-purple-400"}`}>
                            {st.completed && <CheckCircle2 size={12} className="text-white" />}
                        </button>
                        <span className={`flex-1 text-sm font-medium transition-colors ${st.completed ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700"}`}>{st.title}</span>
                        <button onClick={() => actions.deleteSubtask(st.id)} className="opacity-0 group-hover/st:opacity-100 text-slate-300 hover:text-red-500 p-1"><X size={12}/></button>
                    </div>
                ))}
            </div>
        )}

        {/* Start Button Simulation */}
        {!isCompleted && (
            <div className="pl-10 mt-6">
                <button className="flex items-center gap-2 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-md hover:bg-purple-700 hover:shadow-lg transition-all active:scale-95">
                   Start Task <ChevronRight size={12} />
                </button>
            </div>
        )}
    </div>
  );
}

// --- 5. Main Component (Refactored Layout) ---

export default function PlanDetailClient({ initialPlan }: { initialPlan: ExtendedPlan }) {
  const router = useRouter();
  const { plan, loadingAction, editingTaskId, setEditingTaskId, creatingTaskDate, setCreatingTaskDate, actions } = usePlanManager(initialPlan);

  // 1. Logic for Date Ranges (Unchanged)
  const displayDates = useMemo(() => {
    const dates = [];
    let start = plan.startDate ? new Date(plan.startDate) : new Date();
    let end = plan.endDate ? new Date(plan.endDate) : new Date();
    const taskDates = (plan.tasks || []).filter(t => t.date).map(t => new Date(t.date!).getTime());
    if (taskDates.length) {
        start = new Date(Math.min(start.getTime(), ...taskDates));
        end = new Date(Math.max(end.getTime(), ...taskDates));
    }
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
    if (plan.tasks?.some(t => !t.date)) dates.push("Unscheduled");
    return dates;
  }, [plan, creatingTaskDate]);

  // 2. Data Grouping (Unchanged)
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, ExtendedTask[]> = {};
    (plan.tasks || []).forEach(t => {
        const key = t.date ? normalizeDate(t.date) : "Unscheduled";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
    });
    return grouped;
  }, [plan.tasks]);

  // 3. New State for UI Logic
  const [selectedDate, setSelectedDate] = useState<string>(normalizeDate(new Date())); // Default to today

  // Ensure selectedDate is valid, otherwise fallback to first available
  useEffect(() => {
      if (!displayDates.includes(selectedDate) && displayDates.length > 0) {
          // If today isn't in range, pick the first day
           const today = normalizeDate(new Date());
           if(displayDates.includes(today)) setSelectedDate(today);
           else setSelectedDate(displayDates[0]);
      }
  }, [displayDates]);

  // 4. Derived Progress for Header (New Visual, derived from existing data)
  const progressStats = useMemo(() => {
      const totalTasks = plan.tasks?.length || 0;
      // Heuristic: If subtasks exist, check them. If not, check parent status.
      // Since `completed` is on ExtendedSubtask, and ExtendedTask has `status`.
      // We'll roughly count completion based on subtasks or task completion status.
      let completedCount = 0;
      plan.tasks?.forEach(t => {
         if (t.subtasks && t.subtasks.length > 0) {
             if(t.subtasks.every(s => s.completed)) completedCount++;
         } else if (t.status === 'Completed') {
             completedCount++;
         }
      });
      const percent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
      const daysLeft = Math.ceil((new Date(plan.endDate || new Date()).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return { percent, totalTasks, completedCount, daysLeft };
  }, [plan]);

  const currentDayTasks = tasksByDate[selectedDate] || [];

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      
      {/* Loading Overlay */}
      {loadingAction && (
        <div className="fixed inset-0 bg-white/60 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white px-8 py-4 rounded-full shadow-2xl border border-purple-100 flex items-center gap-4 animate-in zoom-in-95">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"/>
                <span className="text-sm font-bold text-purple-900">{loadingAction}</span>
            </div>
        </div>
      )}

      {/* --- Header Section (Matching Screenshot) --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                     <div className="flex items-center gap-3 mb-2">
                        <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 p-0 h-auto">←</Button>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{plan.title}</h1>
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">AI Plan</span>
                     </div>
                     <div className="flex items-center gap-8 text-sm text-slate-500 font-medium">
                         <div className="w-64">
                             <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                 <span>Overall Progress</span>
                                 <span className="text-purple-600">{progressStats.percent}%</span>
                             </div>
                             <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-purple-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressStats.percent}%` }}></div>
                             </div>
                         </div>
                     </div>
                </div>

                <div className="flex items-center gap-6 divide-x divide-slate-100">
                    <div className="flex flex-col items-center px-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
                        <span className="text-lg font-bold text-slate-800">{progressStats.totalTasks}</span>
                    </div>
                    <div className="flex flex-col items-center px-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Left</span>
                        <span className="text-lg font-bold text-slate-800">{progressStats.daysLeft > 0 ? progressStats.daysLeft : 0}</span>
                    </div>
                     <div className="flex flex-col items-center px-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Done</span>
                        <span className="text-lg font-bold text-slate-800">{progressStats.completedCount}</span>
                    </div>
                </div>
                
                <div className="ml-auto">
                     <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                        <Pencil size={14} /> Edit Plan
                     </button>
                </div>
            </div>
        </div>
      </header>

      {/* --- Main Content Grid --- */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             
             {/* --- Left Column: Timeline Sidebar --- */}
             <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-900">Timeline</h2>
                    <button onClick={() => { /* Expand/Collapse logic could go here */ }} className="text-xs font-medium text-purple-600 hover:text-purple-700">Collapse All</button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 overflow-hidden">
                    {displayDates.map((dateKey, index) => {
                        const isSelected = selectedDate === dateKey;
                        const isToday = normalizeDate(new Date()) === dateKey;
                        const isPast = new Date(dateKey) < new Date(new Date().setHours(0,0,0,0));
                        const tasksCount = (tasksByDate[dateKey] || []).length;
                        const hasTasks = tasksCount > 0;
                        const isUnscheduled = dateKey === "Unscheduled";

                        return (
                            <div key={dateKey} className="relative">
                                {/* Connector Line */}
                                {index !== displayDates.length - 1 && (
                                    <div className="absolute left-6 top-10 bottom-0 w-[2px] bg-slate-100 z-0"></div>
                                )}
                                
                                <button 
                                    onClick={() => setSelectedDate(dateKey)}
                                    className={`relative z-10 w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group ${isSelected ? "bg-purple-50 ring-1 ring-purple-200" : "hover:bg-slate-50"}`}
                                >
                                    {/* Status Icon */}
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                        isSelected ? "border-purple-600 bg-white" : 
                                        isPast ? "border-purple-400 bg-purple-400" :
                                        isToday ? "border-purple-600 animate-pulse" :
                                        "border-slate-300"
                                    }`}>
                                        {isPast && <CheckCircle2 size={12} className="text-white" />}
                                        {isSelected && !isPast && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-purple-600" : "text-slate-400"}`}>
                                                {isUnscheduled ? "Backlog" : `Day ${index + 1}`}
                                                {isToday && <span className="ml-2 bg-purple-600 text-white px-1.5 py-[1px] rounded text-[9px]">TODAY</span>}
                                            </span>
                                            {/* Insert Day Hover Action */}
                                            {!isUnscheduled && (
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); actions.insertDay(dateKey); }} 
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-purple-100 text-purple-600 rounded transition-all"
                                                    title="Insert Day After"
                                                >
                                                    <Plus size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`font-semibold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                            {formatDateReadable(dateKey)}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {tasksCount} tasks
                                        </div>
                                    </div>

                                    {/* Active Arrow */}
                                    {isSelected && <ChevronRight size={16} className="text-purple-600" />}
                                </button>
                            </div>
                        )
                    })}
                </div>
             </div>

             {/* --- Right Column: Day Detail View --- */}
             <div className="lg:col-span-8">
                 {/* Day Header */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
                     <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                                {selectedDate === "Unscheduled" ? "Unscheduled Tasks" : formatDateReadable(selectedDate)}
                            </h2>
                            <p className="text-slate-500 leading-relaxed">
                                {currentDayTasks.length > 0 
                                    ? "Focus on completing the modules below. Mark them as done to track progress." 
                                    : "No tasks scheduled for this day yet."}
                            </p>
                        </div>
                        {selectedDate !== "Unscheduled" && (
                            <button onClick={() => actions.deleteDay(selectedDate)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete Entire Day">
                                <Trash2 size={20} />
                            </button>
                        )}
                     </div>
                 </div>

                 {/* Tasks List */}
                 <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={18} className="text-purple-600" />
                    <h3 className="text-lg font-bold text-slate-800">Tasks</h3>
                    <span className="text-xs font-medium text-slate-400 ml-auto">{currentDayTasks.filter(t => t.status === "Completed").length}/{currentDayTasks.length} Completed</span>
                 </div>

                 <div className="space-y-4">
                     {currentDayTasks.map(task => 
                        editingTaskId === task.id ? (
                            <TaskForm key={task.id} initialData={task} onSubmit={(data) => actions.updateTask(task.id, data)} onCancel={() => setEditingTaskId(null)} />
                        ) : (
                            <TaskCard key={task.id} task={task} actions={actions} onEdit={() => setEditingTaskId(task.id)} />
                        )
                     )}

                     {/* Add Task Area */}
                     {creatingTaskDate === selectedDate ? (
                        <TaskForm isCreating onSubmit={actions.createTask} onCancel={() => setCreatingTaskDate(null)} />
                     ) : (
                        <button 
                            onClick={() => setCreatingTaskDate(selectedDate)}
                            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-center gap-2 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-purple-300 text-slate-300 group-hover:text-purple-500 transition-colors shadow-sm">
                                <Plus size={16} />
                            </div>
                            <span>Add New Task</span>
                        </button>
                     )}
                 </div>

                 {/* Simulated Resources Section (Visual only, to match screenshot layout feel, purely static) */}
                 <div className="mt-10 pt-8 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-4 opacity-50">
                        <BarChart3 size={18} className="text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-800">Resources (Placeholder)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none grayscale">
                        <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"><Layout size={20}/></div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">Documentation</div>
                                <div className="text-xs text-slate-400">Official Guide</div>
                            </div>
                        </div>
                         <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center"><AlertCircle size={20}/></div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">Video Tutorial</div>
                                <div className="text-xs text-slate-400">15 min watch</div>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
         </div>
      </main>
    </div>
  );
}