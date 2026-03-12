import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, Plus, Trash2, Pencil, X, Save, Calendar, ChevronRight, Layout, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { usePlanDetail } from "../hooks/usePlanDetail";

// --- Types ---
type PriorityType = "Low" | "Medium" | "High" | "Urgent" | "low" | "medium" | "high" | "urgent";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  priority?: PriorityType;
  status?: string;
  date?: string;
  subtasks?: Subtask[];
  timeSpentMinutes?: number;
}

export interface Plan {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  tasks?: Task[];
}

interface TaskFormData {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: PriorityType;
  subtasks?: string[];
}

// --- Utilities ---
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

// --- Sub-Components ---

function TaskForm({ initialData, onSubmit, onCancel, isCreating }: { 
  initialData?: Partial<Task>, 
  onSubmit: (data: TaskFormData) => Promise<void>, 
  onCancel: () => void, 
  isCreating?: boolean 
}) {
  const [subtasks, setSubtasks] = useState<{title: string}[]>(initialData?.subtasks?.map(s => ({ title: s.title })) || []);
  const [newSubtask, setNewSubtask] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
        await onSubmit({
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        estimatedMinutes: Number(fd.get("estimatedMinutes")),
        priority: fd.get("priority") as PriorityType,
        subtasks: subtasks.map(s => s.title)
        });
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="transform-gpu bg-white border border-purple-200 rounded-2xl p-6 shadow-xl ring-4 ring-purple-50/50 my-4 animate-in fade-in zoom-in-95 duration-200">
      <form onSubmit={handleSubmit}>
        <div className="transform-gpu flex items-start gap-4 mb-4">
             <div className="transform-gpu p-2 bg-purple-100 rounded-lg text-purple-600"><Layout size={20}/></div>
             <div className="transform-gpu flex-1">
                <input name="title" defaultValue={initialData?.title} className="transform-gpu w-full font-bold text-xl text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-purple-500 focus:outline-hidden pb-1" placeholder="Task Title..." autoFocus required />
             </div>
        </div>
        
        <div className="transform-gpu flex items-center gap-3 mb-6 pl-14">
            <select name="priority" defaultValue={initialData?.priority || "Medium"} className="transform-gpu bg-slate-50 border border-slate-200 text-slate-600 rounded-full px-3 py-1 text-xs font-bold uppercase focus:ring-2 focus:ring-purple-500/20 outline-hidden cursor-pointer hover:bg-white">
               {["Low", "Medium", "High", "Urgent"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="transform-gpu flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full px-3 py-1">
                <Clock size={12} className="transform-gpu text-slate-400" />
                <input name="estimatedMinutes" type="number" defaultValue={initialData?.estimatedMinutes || 60} className="transform-gpu w-10 text-xs font-medium bg-transparent outline-hidden" />
                <span className="transform-gpu text-[10px] font-bold uppercase text-slate-400">min</span>
            </div>
        </div>

        <div className="transform-gpu pl-14">
            <label className="transform-gpu block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea name="description" defaultValue={initialData?.description || ""} className="transform-gpu w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 mb-6" placeholder="What is this task about?" rows={2} />

            <label className="transform-gpu block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subtasks</label>
            <div className="transform-gpu space-y-2 mb-3">
                {subtasks.map((st, i) => (
                    <div key={i} className="transform-gpu flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-lg group shadow-sm">
                        <div className="transform-gpu w-4 h-4 rounded-full border-2 border-slate-200"></div>
                        <span className="transform-gpu flex-1 text-sm text-slate-700">{st.title}</span>
                        <button type="button" onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}><X size={14} className="transform-gpu text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"/></button>
                    </div>
                ))}
            </div>
            <div className="transform-gpu flex items-center gap-3 p-2 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-300 transition-colors bg-slate-50/50">
                <Plus size={16} className="transform-gpu text-purple-400" />
                <input className="transform-gpu flex-1 text-sm bg-transparent outline-hidden placeholder:text-slate-400" placeholder="Add a new subtask..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newSubtask.trim() && (setSubtasks([...subtasks, { title: newSubtask.trim() }]), setNewSubtask("")))} />
                <button type="button" onClick={() => { if(newSubtask.trim()) { setSubtasks([...subtasks, { title: newSubtask.trim() }]); setNewSubtask(""); }}} className="transform-gpu text-xs font-bold text-purple-600 uppercase tracking-wide px-2">Add</button>
            </div>
        </div>

        <div className="transform-gpu flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="transform-gpu px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="transform-gpu px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform active:scale-95"><Save size={16} /> {isCreating ? "Create Task" : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}

function TaskCard({ task, actions, onEdit }: { task: Task, actions: any, onEdit: () => void }) {
  const isCompleted = task.status === "Completed"; // Or check boolean
  
  return (
    <div className={`group relative bg-white border rounded-2xl p-6 transition-all duration-300 ${isCompleted ? "opacity-75 bg-slate-50/50 grayscale-[0.3]" : "shadow-sm border-slate-100 hover:shadow-lg hover:border-purple-200"}`}>
        <div className="transform-gpu absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <button onClick={onEdit} className="transform-gpu p-2 text-slate-400 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors" title="Edit"><Pencil size={15} /></button>
            <button onClick={() => actions.deleteTask(task.id)} className="transform-gpu p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={15} /></button>
        </div>

        <div className="transform-gpu flex items-start gap-4 mb-4">
             <button className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted ? "bg-purple-600 border-purple-600" : "border-slate-300 hover:border-purple-400"}`}>
                {isCompleted && <CheckCircle2 size={14} className="transform-gpu text-white" />}
             </button>

             <div className="transform-gpu flex-1 pr-16">
                 <h4 className={`font-bold text-lg leading-snug mb-2 ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</h4>
                 <div className="transform-gpu flex flex-wrap items-center gap-3">
                     {task.priority && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            task.priority.toLowerCase() === 'high' || task.priority.toLowerCase() === 'urgent' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}>
                            {task.priority} Priority
                        </span>
                     )}
                     <span className="transform-gpu flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Clock size={12} /> {task.estimatedMinutes}m est.
                     </span>
                 </div>
             </div>
        </div>
        
        {task.description && <p className="transform-gpu text-sm text-slate-500 whitespace-pre-line mb-6 pl-10 border-l-2 border-slate-100 ml-3">{task.description}</p>}
        
        {task.subtasks && task.subtasks.length > 0 && (
            <div className="transform-gpu pl-10 space-y-3">
                {task.subtasks.map(st => (
                    <div key={st.id} className="transform-gpu flex items-center gap-3 group/st">
                        <button onClick={() => actions.toggleSubtask(st.id, !st.completed)} className={`w-5 h-5 rounded border flex items-center justify-center transition-all shadow-sm ${st.completed ? "bg-purple-500 border-purple-500" : "bg-white border-slate-300 hover:border-purple-400"}`}>
                            {st.completed && <CheckCircle2 size={12} className="transform-gpu text-white" />}
                        </button>
                        <span className={`flex-1 text-sm font-medium transition-colors ${st.completed ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700"}`}>{st.title}</span>
                        <button onClick={() => actions.deleteSubtask(st.id)} className="transform-gpu opacity-0 group-hover/st:opacity-100 text-slate-300 hover:text-red-500 p-1"><X size={12}/></button>
                    </div>
                ))}
            </div>
        )}

        {!isCompleted && (
            <div className="transform-gpu pl-10 mt-6">
                <button className="transform-gpu flex items-center gap-2 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-md hover:bg-purple-700 hover:shadow-lg transition-all active:scale-95">
                   Start Task <ChevronRight size={12} />
                </button>
            </div>
        )}
    </div>
  );
}

// --- Main Component ---

export default function PlanDetail({ planId }: { planId: string }) {
  const navigate = useNavigate();
  const { plan, loading, error, actions } = usePlanDetail(planId);
  const [selectedDate, setSelectedDate] = useState<string>(normalizeDate(new Date()));
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [creatingTaskDate, setCreatingTaskDate] = useState<string | null>(null);

  const displayDates = useMemo(() => {
    if (!plan) return [];
    const dates = [];
    let start = plan.startDate ? new Date(plan.startDate) : new Date();
    let end = plan.endDate ? new Date(plan.endDate) : new Date();
    const taskDates = (plan.tasks || []).filter((t: any) => t.date).map((t: any) => new Date(t.date!).getTime());
    if (taskDates.length) {
        start = new Date(Math.min(start.getTime(), ...taskDates));
        end = new Date(Math.max(end.getTime(), ...taskDates));
    }
    start.setHours(0,0,0,0); end.setHours(0,0,0,0);
    const current = new Date(start);
    while (current <= end) {
        dates.push(normalizeDate(current));
        current.setDate(current.getDate() + 1);
    }
    if (plan.tasks?.some((t: any) => !t.date)) dates.push("Unscheduled");
    return dates;
  }, [plan]);

  const tasksByDate = useMemo(() => {
    if (!plan) return {};
    const grouped: Record<string, Task[]> = {};
    (plan.tasks || []).forEach((t: any) => {
        const key = t.date ? normalizeDate(t.date) : "Unscheduled";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
    });
    return grouped;
  }, [plan]);

  useEffect(() => {
      if (displayDates.length > 0 && !displayDates.includes(selectedDate)) {
           const today = normalizeDate(new Date());
           if(displayDates.includes(today)) setSelectedDate(today);
           else setSelectedDate(displayDates[0]);
      }
  }, [displayDates, selectedDate]);

  const progressStats = useMemo(() => {
      if (!plan) return { percent: 0, totalTasks: 0, completedCount: 0, daysLeft: 0 };
      const totalTasks = plan.tasks?.length || 0;
      let completedCount = 0;
      plan.tasks?.forEach((t: any) => {
         if (t.subtasks && t.subtasks.length > 0) {
             if(t.subtasks.every((s: any) => s.completed)) completedCount++;
         } else if (t.status === 'Completed' || t.completed) {
             completedCount++;
         }
      });
      const percent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
      const daysLeft = Math.ceil((new Date(plan.endDate || new Date()).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return { percent, totalTasks, completedCount, daysLeft };
  }, [plan]);

  const currentDayTasks = tasksByDate[selectedDate] || [];

  if (loading) return <div className="transform-gpu p-8">Loading Plan...</div>;
  if (error || !plan) return <div className="transform-gpu p-8 text-red-500">Error loading plan: {error}</div>;

  return (
    <div className="transform-gpu bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      
      <header className="transform-gpu bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="transform-gpu max-w-7xl mx-auto px-4 md:px-8 py-5">
            <div className="transform-gpu flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                     <div className="transform-gpu flex items-center gap-3 mb-2">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="transform-gpu text-slate-400 hover:text-slate-600 p-0 h-auto">←</Button>
                        <h1 className="transform-gpu text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{plan.title}</h1>
                        <span className="transform-gpu bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">AI Plan</span>
                     </div>
                     <div className="transform-gpu flex items-center gap-8 text-sm text-slate-500 font-medium">
                         <div className="transform-gpu w-64">
                             <div className="transform-gpu flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                 <span>Overall Progress</span>
                                 <span className="transform-gpu text-purple-600">{progressStats.percent}%</span>
                             </div>
                             <div className="transform-gpu h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="transform-gpu h-full bg-purple-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressStats.percent}%` }}></div>
                             </div>
                         </div>
                     </div>
                </div>

                <div className="transform-gpu flex items-center gap-6 divide-x divide-slate-100">
                    <div className="transform-gpu flex flex-col items-center px-4">
                        <span className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
                        <span className="transform-gpu text-lg font-bold text-slate-800">{progressStats.totalTasks}</span>
                    </div>
                    <div className="transform-gpu flex flex-col items-center px-4">
                        <span className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-wider">Days Left</span>
                        <span className="transform-gpu text-lg font-bold text-slate-800">{progressStats.daysLeft > 0 ? progressStats.daysLeft : 0}</span>
                    </div>
                     <div className="transform-gpu flex flex-col items-center px-4">
                        <span className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-wider">Done</span>
                        <span className="transform-gpu text-lg font-bold text-slate-800">{progressStats.completedCount}</span>
                    </div>
                </div>
                
                <div className="transform-gpu ml-auto">
                     <button className="transform-gpu flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                        <Pencil size={14} /> Edit Plan
                     </button>
                </div>
            </div>
        </div>
      </header>

      <main className="transform-gpu max-w-7xl mx-auto px-4 md:px-8 py-8">
         <div className="transform-gpu grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             
             <div className="transform-gpu lg:col-span-4 space-y-4">
                <div className="transform-gpu flex items-center justify-between mb-2">
                    <h2 className="transform-gpu text-lg font-bold text-slate-900">Timeline</h2>
                    <button className="transform-gpu text-xs font-medium text-purple-600 hover:text-purple-700">Collapse All</button>
                </div>

                <div className="transform-gpu bg-white rounded-2xl shadow-sm border border-slate-200 p-2 overflow-hidden">
                    {displayDates.map((dateKey, index) => {
                        const isSelected = selectedDate === dateKey;
                        const isToday = normalizeDate(new Date()) === dateKey;
                        const isPast = new Date(dateKey) < new Date(new Date().setHours(0,0,0,0));
                        const tasksCount = (tasksByDate[dateKey] || []).length;
                        const isUnscheduled = dateKey === "Unscheduled";

                        return (
                            <div key={dateKey} className="transform-gpu relative">
                                {index !== displayDates.length - 1 && (
                                    <div className="transform-gpu absolute left-6 top-10 bottom-0 w-[2px] bg-slate-100 z-0"></div>
                                )}
                                
                                <button 
                                    onClick={() => setSelectedDate(dateKey)}
                                    className={`relative z-10 w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group ${isSelected ? "bg-purple-50 ring-1 ring-purple-200" : "hover:bg-slate-50"}`}
                                >
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                        isSelected ? "border-purple-600 bg-white" : 
                                        isPast ? "border-purple-400 bg-purple-400" :
                                        isToday ? "border-purple-600 animate-pulse" :
                                        "border-slate-300"
                                    }`}>
                                        {isPast && <CheckCircle2 size={12} className="transform-gpu text-white" />}
                                        {isSelected && !isPast && <div className="transform-gpu w-2 h-2 rounded-full bg-purple-600" />}
                                    </div>

                                    <div className="transform-gpu flex-1">
                                        <div className="transform-gpu flex items-center justify-between">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-purple-600" : "text-slate-400"}`}>
                                                {isUnscheduled ? "Backlog" : `Day ${index + 1}`}
                                                {isToday && <span className="transform-gpu ml-2 bg-purple-600 text-white px-1.5 py-[1px] rounded text-[9px]">TODAY</span>}
                                            </span>
                                            {!isUnscheduled && (
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); actions.insertDay(dateKey); }} 
                                                    className="transform-gpu opacity-0 group-hover:opacity-100 p-1 hover:bg-purple-100 text-purple-600 rounded transition-all"
                                                    title="Insert Day After"
                                                >
                                                    <Plus size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`font-semibold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                            {formatDateReadable(dateKey)}
                                        </div>
                                        <div className="transform-gpu text-xs text-slate-400 mt-0.5">
                                            {tasksCount} tasks
                                        </div>
                                    </div>

                                    {isSelected && <ChevronRight size={16} className="transform-gpu text-purple-600" />}
                                </button>
                            </div>
                        )
                    })}
                </div>
             </div>

             <div className="transform-gpu lg:col-span-8">
                 <div className="transform-gpu bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
                     <div className="transform-gpu flex items-start justify-between">
                        <div>
                            <h2 className="transform-gpu text-2xl font-extrabold text-slate-900 mb-2">
                                {selectedDate === "Unscheduled" ? "Unscheduled Tasks" : formatDateReadable(selectedDate)}
                            </h2>
                            <p className="transform-gpu text-slate-500 leading-relaxed">
                                {currentDayTasks.length > 0 
                                    ? "Focus on completing the modules below. Mark them as done to track progress." 
                                    : "No tasks scheduled for this day yet."}
                            </p>
                        </div>
                        {selectedDate !== "Unscheduled" && (
                            <button onClick={() => actions.deleteDay(selectedDate)} className="transform-gpu text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete Entire Day">
                                <Trash2 size={20} />
                            </button>
                        )}
                     </div>
                 </div>

                 <div className="transform-gpu flex items-center gap-2 mb-4">
                    <CheckCircle2 size={18} className="transform-gpu text-purple-600" />
                    <h3 className="transform-gpu text-lg font-bold text-slate-800">Tasks</h3>
                    <span className="transform-gpu text-xs font-medium text-slate-400 ml-auto">{currentDayTasks.filter(t => t.status === "Completed" || t.status === "completed" || t.status === "Completed" ).length}/{currentDayTasks.length} Completed</span>
                 </div>

                 <div className="transform-gpu space-y-4">
                     {currentDayTasks.map(task => 
                        editingTaskId === task.id ? (
                            <TaskForm key={task.id} initialData={task} onSubmit={async (data) => {
                                await actions.updateTask(task.id, data);
                                setEditingTaskId(null);
                            }} onCancel={() => setEditingTaskId(null)} />
                        ) : (
                            <TaskCard key={task.id} task={task} actions={actions} onEdit={() => setEditingTaskId(task.id)} />
                        )
                     )}

                     {creatingTaskDate === selectedDate ? (
                        <TaskForm isCreating onSubmit={async (data) => {
                            await actions.createTask({ ...data, date: selectedDate });
                            setCreatingTaskDate(null);
                        }} onCancel={() => setCreatingTaskDate(null)} />
                     ) : (
                        <button 
                            onClick={() => setCreatingTaskDate(selectedDate)}
                            className="transform-gpu w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-center gap-2 group"
                        >
                            <div className="transform-gpu w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-purple-300 text-slate-300 group-hover:text-purple-500 transition-colors shadow-sm">
                                <Plus size={16} />
                            </div>
                            <span>Add New Task</span>
                        </button>
                     )}
                 </div>
             </div>
         </div>
      </main>
    </div>
  );
}
