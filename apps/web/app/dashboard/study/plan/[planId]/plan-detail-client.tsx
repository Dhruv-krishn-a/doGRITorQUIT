// apps/web/app/dashboard/plans/[planId]/plan-detail-client.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plan as BasePlan, Task as BaseTask, Subtask as BaseSubtask } from "@/types/plan";
import Button from "@/shared/components/ui/Button"; 
import { Clock, CheckCircle2, Plus, Trash2, Pencil, X, Save, ChevronRight, Layout, BarChart3, AlertCircle } from "lucide-react";

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
  description?: string | null;
  estimatedMinutes?: number | null;
  priority?: PriorityType | string | null;
  subtasks?: string[];
  status?: string;
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
    const d = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
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
    <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-2xl my-6 animate-in fade-in zoom-in-95 duration-200">
      <form onSubmit={handleSubmit} className="text-left">
        <div className="transform-gpu flex items-start gap-5 mb-6">
             <div className="transform-gpu p-3 bg-[var(--accent-color)]/10 rounded-xl text-[var(--accent-color)] shadow-sm"><Layout size={22}/></div>
             <div className="transform-gpu flex-1">
                <input name="title" defaultValue={initialData?.title} className="transform-gpu w-full font-black text-2xl text-[var(--text-primary)] bg-transparent border-b border-[var(--border-color)] hover:border-[var(--text-secondary)] focus:border-[var(--accent-color)] focus:outline-none pb-2 italic uppercase tracking-tighter transition-colors" placeholder="Archive Title..." autoFocus required />
             </div>
        </div>
        
        <div className="transform-gpu flex flex-wrap items-center gap-4 mb-8 pl-[60px]">
            <select name="priority" defaultValue={initialData?.priority || "Medium"} className="transform-gpu bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-[var(--accent-color)]/10 outline-none cursor-pointer hover:border-[var(--text-secondary)] transition-all italic">
               {["Low", "Medium", "High", "Urgent"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="transform-gpu flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2">
                <Clock size={14} className="transform-gpu text-[var(--accent-color)]" />
                <input name="estimatedMinutes" type="number" defaultValue={initialData?.estimatedMinutes || 60} className="transform-gpu w-12 text-[10px] font-black bg-transparent outline-none italic" />
                <span className="transform-gpu text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-widest">MIN</span>
            </div>
        </div>

        <div className="transform-gpu pl-[60px] space-y-8">
            <div>
              <label className="transform-gpu block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 ml-1 italic opacity-60">Objective Scope</label>
              <textarea name="description" defaultValue={initialData?.description || ""} className="transform-gpu w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 resize-none outline-none focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-[var(--accent-color)]/5 focus:border-[var(--accent-color)] transition-all mb-2 italic uppercase tracking-tight" placeholder="Define the mission parameters..." rows={3} />
            </div>

            <div>
              <label className="transform-gpu block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic opacity-60">Sub-Vectors</label>
              <div className="transform-gpu space-y-3 mb-4">
                  {subtasks.map((st, i) => (
                      <div key={i} className="transform-gpu flex items-center gap-4 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl group shadow-sm">
                          <div className="transform-gpu w-5 h-5 rounded-full border-2 border-[var(--border-color)] group-hover:border-[var(--accent-color)]/50 transition-colors flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] opacity-0 group-hover:opacity-20" />
                          </div>
                          <span className="transform-gpu flex-1 text-[11px] font-black text-[var(--text-primary)] uppercase italic tracking-tight">{st.title}</span>
                          <button type="button" onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"><X size={14} className="transform-gpu text-[var(--text-secondary)] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"/></button>
                      </div>
                  ))}
              </div>
              <div className="transform-gpu flex items-center gap-4 p-3 border-2 border-dashed border-[var(--border-color)] rounded-xl hover:border-[var(--accent-color)]/50 transition-all bg-[var(--bg-secondary)]/30 group">
                  <Plus size={18} className="transform-gpu text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors" />
                  <input className="transform-gpu flex-1 text-[11px] font-black bg-transparent outline-none placeholder:text-[var(--text-secondary)]/20 uppercase italic tracking-tight" placeholder="Initialize sub-vector..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newSubtask.trim() && (setSubtasks([...subtasks, { title: newSubtask.trim() }]), setNewSubtask("")))} />
                  <button type="button" onClick={() => { if(newSubtask.trim()) { setSubtasks([...subtasks, { title: newSubtask.trim() }]); setNewSubtask(""); }}} className="transform-gpu text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest px-3 py-1 hover:underline">Add</button>
              </div>
            </div>
        </div>

        <div className="transform-gpu flex justify-end gap-4 pt-8 mt-10 border-t border-[var(--border-color)]">
            <button type="button" onClick={onCancel} className="transform-gpu px-6 py-3 text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all uppercase tracking-widest italic">Standby</button>
            <button type="submit" disabled={isSubmitting} className="transform-gpu px-8 py-3 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 flex items-center gap-3 shadow-xl shadow-[var(--accent-color)]/20 transition-all transform active:scale-95 italic"><Save size={16} /> {isCreating ? "Deploy Objective" : "Update Core"}</button>
        </div>
      </form>
    </div>
  );
}

import { TaskCard } from "@gritorquit/dashboard-ui-web";

// Visual Task Card removed as it's now shared

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
  }, [displayDates, selectedDate]);

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
         } else if (t.status === 'completed' || t.status === 'Completed') {
             completedCount++;
         }
      });
      const percent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
      const daysLeft = Math.ceil((new Date(plan.endDate || new Date()).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return { percent, totalTasks, completedCount, daysLeft };
  }, [plan]);

  const currentDayTasks = tasksByDate[selectedDate] || [];

  return (
    <div className="transform-gpu bg-[var(--bg-primary)] min-h-screen pb-20 font-sans text-[var(--text-primary)]">
      
      {/* Loading Overlay */}
      {loadingAction && (
        <div className="transform-gpu fixed inset-0 bg-black/40 z-modal flex items-center justify-center backdrop-blur-sm">
            <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-in zoom-in-95">
                <div className="transform-gpu w-5 h-5 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"/>
                <span className="transform-gpu text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] italic">{loadingAction}</span>
            </div>
        </div>
      )}

      {/* --- Header Section (Matching Screenshot) --- */}
      <header className="transform-gpu bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-color)] sticky top-0 z-30 shadow-sm">
        <div className="transform-gpu max-w-7xl mx-auto px-4 md:px-8 py-5">
            <div className="transform-gpu flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                <div>
                     <div className="transform-gpu flex items-center gap-3 mb-2">
                        <Button variant="ghost" onClick={() => router.back()} className="transform-gpu text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-0 h-auto">←</Button>
                        <h1 className="transform-gpu text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">{plan.title}</h1>
                        <span className="transform-gpu bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest italic shadow-sm">AI Plan</span>
                     </div>
                     <div className="transform-gpu flex items-center gap-8 text-sm text-[var(--text-secondary)] font-black">
                         <div className="transform-gpu w-64">
                             <div className="transform-gpu flex justify-between text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1 italic opacity-60">
                                 <span>Overall Progress</span>
                                 <span className="transform-gpu text-[var(--accent-color)]">{progressStats.percent}%</span>
                             </div>
                             <div className="transform-gpu h-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full overflow-hidden p-0.5">
                                 <div className="transform-gpu h-full bg-gradient-to-r from-[var(--accent-color)] to-sky-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_var(--accent-color)]" style={{ width: `${progressStats.percent}%` }}></div>
                             </div>
                         </div>
                     </div>
                </div>

                <div className="transform-gpu flex items-center gap-6 divide-x divide-[var(--border-color)]">
                    <div className="transform-gpu flex flex-col items-center px-4">
                        <span className="transform-gpu text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest italic opacity-60">Total Tasks</span>
                        <span className="transform-gpu text-lg font-black text-[var(--text-primary)] italic">{progressStats.totalTasks}</span>
                    </div>
                    <div className="transform-gpu flex flex-col items-center px-4">
                        <span className="transform-gpu text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest italic opacity-60">Days Left</span>
                        <span className="transform-gpu text-lg font-black text-[var(--text-primary)] italic">{progressStats.daysLeft > 0 ? progressStats.daysLeft : 0}</span>
                    </div>
                     <div className="transform-gpu flex flex-col items-center px-4">
                        <span className="transform-gpu text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest italic opacity-60">Done</span>
                        <span className="transform-gpu text-lg font-black text-[var(--text-primary)] italic">{progressStats.completedCount}</span>
                    </div>
                </div>
                
                <div className="transform-gpu ml-auto">
                     <button className="transform-gpu flex items-center gap-2 px-6 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 italic">
                        <Pencil size={14} /> Edit Plan
                     </button>
                </div>
            </div>
        </div>
      </header>

      {/* --- Main Content Grid --- */}
      <main className="transform-gpu max-w-7xl mx-auto px-4 md:px-8 py-8">
         <div className="transform-gpu grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
             
             {/* --- Left Column: Timeline Sidebar --- */}
             <div className="transform-gpu lg:col-span-4 space-y-4">
                <div className="transform-gpu flex items-center justify-between mb-2">
                    <h2 className="transform-gpu text-lg font-black text-[var(--text-primary)] uppercase tracking-tight italic">Timeline</h2>
                    <button onClick={() => { /* Expand/Collapse logic could go here */ }} className="transform-gpu text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest hover:underline italic">Collapse All</button>
                </div>

                <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] shadow-xl p-3 overflow-hidden relative">
                    <div className="transform-gpu absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none" />
                    {displayDates.map((dateKey, index) => {
                        const isSelected = selectedDate === dateKey;
                        const isToday = normalizeDate(new Date()) === dateKey;
                        const isPast = new Date(dateKey) < new Date(new Date().setHours(0,0,0,0));
                        const tasksCount = (tasksByDate[dateKey] || []).length;
                        const isUnscheduled = dateKey === "Unscheduled";

                        return (
                            <div key={dateKey} className="transform-gpu relative">
                                {/* Connector Line */}
                                {index !== displayDates.length - 1 && (
                                    <div className="transform-gpu absolute left-6 top-10 bottom-0 w-[2px] bg-[var(--border-color)]/30 z-0"></div>
                                )}
                                
                                <button 
                                    onClick={() => setSelectedDate(dateKey)}
                                    className={`relative z-10 w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group ${isSelected ? "bg-[var(--accent-color)]/10 ring-1 ring-[var(--accent-color)]/30 shadow-sm" : "hover:bg-[var(--bg-secondary)]/50"}`}
                                >
                                    {/* Status Icon */}
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                                        isSelected ? "border-[var(--accent-color)] bg-[var(--bg-card)] shadow-[0_0_10px_var(--accent-color)]" : 
                                        isPast ? "border-emerald-500/50 bg-emerald-500/20" :
                                        isToday ? "border-[var(--accent-color)]/50 animate-pulse" :
                                        "border-[var(--border-color)]"
                                    }`}>
                                        {isPast && <CheckCircle2 size={12} className="transform-gpu text-emerald-500" />}
                                        {isSelected && !isPast && <div className="transform-gpu w-2 h-2 rounded-full bg-[var(--accent-color)]" />}
                                    </div>

                                    {/* Text Content */}
                                    <div className="transform-gpu flex-1">
                                        <div className="transform-gpu flex items-center justify-between">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${isSelected ? "text-[var(--accent-color)]" : "text-[var(--text-secondary)] opacity-60"}`}>
                                                {isUnscheduled ? "Backlog" : `Day ${index + 1}`}
                                                {isToday && <span className="transform-gpu ml-2 bg-[var(--accent-color)] text-[var(--bg-primary)] px-2 py-0.5 rounded-md text-[8px] tracking-widest shadow-sm">TODAY</span>}
                                            </span>
                                            {/* Insert Day Hover Action */}
                                            {!isUnscheduled && (
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); actions.insertDay(dateKey); }} 
                                                    className="transform-gpu opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-lg transition-all"
                                                    title="Insert Day After"
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`font-black uppercase tracking-tight italic ${isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                                            {formatDateReadable(dateKey)}
                                        </div>
                                        <div className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 opacity-40 italic">
                                            {tasksCount} vectors
                                        </div>
                                    </div>

                                    {/* Active Arrow */}
                                    {isSelected && <ChevronRight size={18} className="transform-gpu text-[var(--accent-color)]" strokeWidth={3} />}
                                </button>
                            </div>
                        )
                    })}
                </div>
             </div>

             {/* --- Right Column: Day Detail View --- */}
             <div className="transform-gpu lg:col-span-8">
                 {/* Day Header */}
                 <div className="transform-gpu bg-[var(--bg-card)] rounded-[3rem] shadow-2xl border border-[var(--border-color)] p-8 mb-6 relative overflow-hidden group">
                     <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--accent-color)]/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                     <div className="transform-gpu flex items-start justify-between relative z-10">
                        <div>
                            <h2 className="transform-gpu text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-2 italic">
                                {selectedDate === "Unscheduled" ? "Unscheduled Vectors" : formatDateReadable(selectedDate)}
                            </h2>
                            <p className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed opacity-60 italic">
                                {currentDayTasks.length > 0 
                                    ? "Focus on completing the modules below. Mark them as done to track progress." 
                                    : "No tasks scheduled for this day yet."}
                            </p>
                        </div>
                        {selectedDate !== "Unscheduled" && (
                            <button onClick={() => actions.deleteDay(selectedDate)} className="transform-gpu text-[var(--text-secondary)] hover:text-rose-500 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-rose-500/30 rounded-2xl transition-all shadow-sm active:scale-95" title="Delete Entire Day">
                                <Trash2 size={20} />
                            </button>
                        )}
                     </div>
                 </div>

                 {/* Tasks List */}
                 <div className="transform-gpu flex items-center gap-3 mb-6 ml-2">
                    <div className="w-1.5 h-5 bg-[var(--accent-color)] rounded-full shadow-[0_0_10px_var(--accent-color)]" />
                    <h3 className="transform-gpu text-xl font-black text-[var(--text-primary)] uppercase tracking-tight italic">Mission Vectors</h3>
                    <span className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] px-3 py-1.5 rounded-full uppercase tracking-widest ml-auto italic shadow-sm">{currentDayTasks.filter(t => t.status === "completed" || t.status === "Completed").length}/{currentDayTasks.length} Resolved</span>
                 </div>

                 <div className="transform-gpu space-y-6">
                     {currentDayTasks.map(task => 
                        editingTaskId === task.id ? (
                            <TaskForm key={task.id} initialData={task} onSubmit={(data) => actions.updateTask(task.id, data)} onCancel={() => setEditingTaskId(null)} />
                        ) : (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                onEdit={() => setEditingTaskId(task.id)} 
                                onDelete={() => actions.deleteTask(task.id)}
                                onComplete={() => actions.updateTask(task.id, { ...task, status: 'completed' } as any)}
                                onToggleSubtask={(subtaskId, completed) => actions.toggleSubtask(task.id, subtaskId, completed)}
                            />
                        )
                     )}

                     {/* Add Task Area */}
                     {creatingTaskDate === selectedDate ? (
                        <TaskForm isCreating onSubmit={actions.createTask} onCancel={() => setCreatingTaskDate(null)} />
                     ) : (
                        <button 
                            onClick={() => setCreatingTaskDate(selectedDate)}
                            className="transform-gpu w-full py-10 border-2 border-dashed border-[var(--border-color)] rounded-[3rem] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/50 hover:text-[var(--accent-color)] hover:bg-[var(--bg-secondary)]/30 transition-all flex flex-col items-center justify-center gap-4 group shadow-sm hover:shadow-xl active:scale-[0.99]"
                        >
                            <div className="transform-gpu w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center group-hover:border-[var(--accent-color)] text-[var(--text-secondary)] group-hover:text-[var(--bg-primary)] group-hover:bg-[var(--accent-color)] transition-all shadow-sm group-hover:shadow-[0_0_15px_var(--accent-color)] group-hover:rotate-90 duration-500">
                                <Plus size={24} strokeWidth={3} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">Initialize New Vector</span>
                        </button>
                     )}
                 </div>

                 {/* Simulated Resources Section (Visual only, to match screenshot layout feel, purely static) */}
                 <div className="transform-gpu mt-16 pt-10 border-t border-[var(--border-color)]">
                    <div className="transform-gpu flex items-center gap-3 mb-6 ml-2 opacity-40">
                        <div className="p-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl border border-[var(--border-color)] shadow-sm"><BarChart3 size={18} /></div>
                        <h3 className="transform-gpu text-xl font-black text-[var(--text-primary)] uppercase tracking-tight italic">Mission Intelligence</h3>
                    </div>
                    <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 gap-6 opacity-30 pointer-events-none grayscale">
                        <div className="transform-gpu border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm rounded-[2.5rem] p-6 flex items-center gap-5">
                            <div className="transform-gpu w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20"><Layout size={20}/></div>
                            <div>
                                <div className="transform-gpu text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">Documentation</div>
                                <div className="transform-gpu text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1">Official Guide</div>
                            </div>
                        </div>
                         <div className="transform-gpu border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm rounded-[2.5rem] p-6 flex items-center gap-5">
                            <div className="transform-gpu w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20"><AlertCircle size={20}/></div>
                            <div>
                                <div className="transform-gpu text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">Video Tutorial</div>
                                <div className="transform-gpu text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1">15 min watch</div>
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