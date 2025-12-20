// apps/web/app/dashboard/daily-checklist/page.tsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  ChevronLeft, ChevronRight, Calendar, RotateCcw,
  Dumbbell, BookOpen, Zap, Brain, Droplet, Check, Sparkles, Quote,
  Plus, X, Trash2, Code, Heart, Sun, Moon, Coffee, Music, Briefcase
} from "lucide-react";
import { 
  getChecklistData, 
  toggleHabit, 
  saveDailyNote, 
  createHabit, 
  deleteHabit 
} from "@/app/actions/checklist";

// --- Configuration ---

// Available Icons for Selection
const ICON_OPTIONS = [
  { value: "dumbbell", label: "Workout", component: Dumbbell },
  { value: "bookopen", label: "Reading", component: BookOpen },
  { value: "zap", label: "Focus", component: Zap },
  { value: "brain", label: "Learn", component: Brain },
  { value: "droplet", label: "Water", component: Droplet },
  { value: "code", label: "Code", component: Code },
  { value: "heart", label: "Health", component: Heart },
  { value: "sun", label: "Morning", component: Sun },
  { value: "moon", label: "Sleep", component: Moon },
  { value: "coffee", label: "Break", component: Coffee },
  { value: "music", label: "Hobby", component: Music },
  { value: "briefcase", label: "Work", component: Briefcase },
];

// Available Colors
const COLOR_OPTIONS = [
  { name: "Blue", class: "text-blue-500", bg: "bg-blue-500" },
  { name: "Indigo", class: "text-indigo-500", bg: "bg-indigo-500" },
  { name: "Purple", class: "text-purple-500", bg: "bg-purple-500" },
  { name: "Rose", class: "text-rose-500", bg: "bg-rose-500" },
  { name: "Amber", class: "text-amber-500", bg: "bg-amber-500" },
  { name: "Emerald", class: "text-emerald-500", bg: "bg-emerald-500" },
  { name: "Cyan", class: "text-cyan-500", bg: "bg-cyan-500" },
];

const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The only bad workout is the one that didn't happen.",
  "Your future is created by what you do today, not tomorrow.",
  "Discipline is choosing between what you want now and what you want most.",
];

// Map string keys to components for rendering
const ICON_MAP = ICON_OPTIONS.reduce((acc, curr) => ({ ...acc, [curr.value]: curr.component }), {});

type HabitType = {
  id: string;
  title: string;
  icon?: string | null;
  color?: string | null;
};

type LogType = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
};

type NoteType = {
  id: string;
  date: string;
  content: string;
};

export default function DailyChecklistPage() {
  const [view, setView] = useState<"week" | "month">("week");
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [data, setData] = useState<{ habits: HabitType[]; logs: LogType[]; notes: NoteType[] } | null>(null);
  const [quote, setQuote] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("zap");
  const [newHabitColor, setNewHabitColor] = useState("text-indigo-500");

  // --- Helpers ---
  const getRange = () => {
    const start = new Date(baseDate);
    if (view === "week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  };

  const { start, end } = getRange();

  const days: Date[] = [];
  {
    const d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  }

  // --- Actions ---
  const refreshData = async () => {
    try {
      const res = await getChecklistData(start, end);
      setData(res ?? { habits: [], logs: [], notes: [] });
    } catch (err) {
      console.error("Failed to load checklist data", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [baseDate, view]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const handleToggle = (habitId: string, date: Date, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleHabit(habitId, date, !currentStatus);
      await refreshData();
    });
  };

  const handleNoteBlur = async (date: Date, content: string) => {
    await saveDailyNote(date, content);
    await refreshData();
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle) return;
    
    startTransition(async () => {
      await createHabit({ 
        title: newHabitTitle, 
        icon: newHabitIcon, 
        color: newHabitColor 
      });
      setIsModalOpen(false);
      setNewHabitTitle(""); 
      await refreshData();
    });
  };

  const handleDeleteHabit = async (id: string, title: string) => {
    if(!confirm(`Are you sure you want to delete the habit "${title}"? This will remove all history for it.`)) return;
    
    startTransition(async () => {
      await deleteHabit(id);
      await refreshData();
    });
  };

  const shiftDate = (amount: number) => {
    const newDate = new Date(baseDate);
    if (view === "week") newDate.setDate(newDate.getDate() + amount * 7);
    else newDate.setMonth(newDate.getMonth() + amount);
    setBaseDate(newDate);
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  // Render Logic
  const habitCount = data.habits.length;
  // We add +1 to grid columns if we want the "Add" button to be inline, 
  // but simpler to put "Add" button at the end of the header row manually.

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-8 font-sans text-slate-800 relative">
      
      {/* --- ADD HABIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Add New Habit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateHabit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Habit Name</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Meditate, Drink Water..."
                  value={newHabitTitle}
                  onChange={e => setNewHabitTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const IsSelected = newHabitIcon === opt.value;
                    const IconComp = opt.component;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewHabitIcon(opt.value)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${IsSelected ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        title={opt.label}
                      >
                        <IconComp size={20} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Color Theme</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setNewHabitColor(c.class)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${c.bg} ${newHabitColor === c.class ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!newHabitTitle}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                Create Habit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg shadow-indigo-200">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={120} /></div>
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-100 font-medium text-sm uppercase tracking-wider">
            <Quote size={14} /><span>Daily Inspiration</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight max-w-3xl">"{quote}"</h2>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            {view === "week" ? "Weekly Focus" : "Monthly Focus"}
            <span className="text-sm font-normal text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{baseDate.getFullYear()}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
            <div className="px-4 font-semibold text-slate-700 text-sm min-w-[140px] text-center">
              {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <button onClick={() => shiftDate(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600"><ChevronRight className="w-5 h-5" /></button>
            <div className="h-5 w-[1px] bg-slate-200 mx-2" />
            <button onClick={() => setBaseDate(new Date())} className="px-3 text-xs font-bold text-indigo-600 uppercase">Today</button>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(["week", "month"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${view === v ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Grid Header */}
          <div className="grid gap-6 p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md items-end"
               style={{ gridTemplateColumns: `120px repeat(${habitCount}, 1fr) 60px 250px 80px` }}>
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 pb-2">Date</div>

            {/* Habit Headers */}
            {data.habits.map((habit) => {
              // @ts-ignore
              const Icon = ICON_MAP[habit.icon] || Zap;
              return (
                <div key={habit.id} className="group relative flex flex-col items-center justify-center gap-3 pb-2">
                  <div className={`p-3 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-md ${habit.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{habit.title}</span>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteHabit(habit.id, habit.title)}
                    className="absolute -top-1 -right-1 bg-white border border-slate-200 rounded-full p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-200 transition-all shadow-sm z-20"
                    title="Delete Habit"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}

            {/* Add New Button (Column Header) */}
            <div className="flex flex-col items-center justify-end pb-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                title="Add New Habit"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 pl-2">Daily Note</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center pb-2">Score</div>
          </div>

          {/* Grid Rows */}
          <div className="divide-y divide-slate-100">
            {days.map((day) => {
              const isToday = new Date().toDateString() === day.toDateString();
              const logsForDay = data.logs.filter(l => new Date(l.date).toDateString() === day.toDateString() && l.completed);
              
              // Calculate Score
              const totalPossible = data.habits.length;
              const completedCount = logsForDay.filter(l => data.habits.some(h => h.id === l.habitId)).length;
              const progress = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
              const isPerfect = progress === 100 && totalPossible > 0;

              return (
                <div key={day.toISOString()} 
                     className={`grid gap-6 px-6 items-center transition-all duration-300 ${view === 'month' ? 'py-3' : 'py-5'} ${isToday ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                     style={{ gridTemplateColumns: `120px repeat(${habitCount}, 1fr) 60px 250px 80px` }}>
                  
                  {/* Date */}
                  <div className="flex flex-col pl-2">
                    <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{day.getDate()}</span>
                      {isToday && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                    </div>
                  </div>

                  {/* Habit Checkboxes */}
                  {data.habits.map((habit) => {
                    const isChecked = logsForDay.some(l => l.habitId === habit.id);
                    const activeColor = habit.color?.replace('text-', 'bg-') || 'bg-indigo-500';

                    return (
                      <div key={habit.id} className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggle(habit.id, day, isChecked)}
                          className={`
                            relative flex items-center justify-center transition-all duration-300
                            ${view === 'month' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'}
                            ${isChecked ? `${activeColor} shadow-md shadow-indigo-100 scale-100` : `bg-slate-100 hover:bg-slate-200 scale-90`}
                          `}
                        >
                          <Check strokeWidth={4} className={`w-4 h-4 text-white transition-transform duration-200 ${isChecked ? 'scale-100' : 'scale-0'}`} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Empty Spacer for "Add Button" column */}
                  <div />

                  {/* Note Input */}
                  <input
                    type="text"
                    defaultValue={data.notes.find(n => new Date(n.date).toDateString() === day.toDateString())?.content || ""}
                    onBlur={(e) => handleNoteBlur(day, e.target.value)}
                    placeholder="Reflect..."
                    className="w-full bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none text-sm text-slate-600 placeholder-slate-300 transition-colors py-1"
                  />

                  {/* Progress Bar */}
                  <div className="flex flex-col items-end justify-center gap-1 w-full">
                    <span className={`text-xs font-bold ${isPerfect ? 'text-emerald-500' : 'text-slate-300'}`}>{progress}%</span>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${isPerfect ? 'bg-emerald-400' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}