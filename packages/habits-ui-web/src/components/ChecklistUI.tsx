"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  ChevronLeft, ChevronRight, Quote, Plus, X, Trash2, 
  Check, Sparkles, Zap, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useHabitsContext, HabitData } from "@planner/habits-core";
import { 
  ICON_OPTIONS, ICON_MAP, COLOR_OPTIONS, DEFAULT_COLOR, QUOTES 
} from "../constants";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChecklistUIProps {
  initialData?: HabitData;
  serverDate?: string;
}

export const ChecklistUI: React.FC<ChecklistUIProps> = ({ 
  initialData,
  serverDate = new Date().toISOString()
}) => {
  const { 
    habits, logs, notes, loading, 
    refreshData, toggleHabit, saveNote, 
    createHabit, deleteHabit, setInitialData 
  } = useHabitsContext();

  const [view, setView] = useState<"week" | "month">("week");
  const [baseDate, setBaseDate] = useState<Date>(new Date(serverDate));
  const [quote, setQuote] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("zap");
  const [newHabitColor, setNewHabitColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    if (initialData) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  const getRange = useCallback(() => {
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
  }, [baseDate, view]);

  const { start, end } = getRange();

  const days: Date[] = [];
  {
    const d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  }

  useEffect(() => {
    // Only refresh if start/end actually changed or if it's not the initial load with data
    const isInitialLoad = baseDate.toISOString() === serverDate;
    if (!isInitialLoad || !initialData || habits.length === 0) {
        refreshData(start, end);
    }
  }, [start.getTime(), end.toISOString(), refreshData]); // Use primitive values for stable dependencies
  
  useEffect(() => { 
      const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)] ?? "Keep pushing.";
      setQuote(randomQuote); 
  }, []);

  const handleToggle = (habitId: string, date: Date, currentStatus: boolean) => {
    toggleHabit(habitId, date, currentStatus);
  };

  const handleNoteBlur = (date: Date, content: string) => {
    saveNote(date, content);
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle) return;
    await createHabit(newHabitTitle, newHabitIcon, newHabitColor.class);
    setIsModalOpen(false);
    setNewHabitTitle(""); 
  };

  const handleDeleteHabit = (id: string, title: string) => {
    if(!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteHabit(id);
  };

  const shiftDate = (amount: number) => {
    const newDate = new Date(baseDate);
    if (view === "week") newDate.setDate(newDate.getDate() + amount * 7);
    else newDate.setMonth(newDate.getMonth() + amount);
    setBaseDate(newDate);
  };

  if (loading && habits.length === 0) return (
    <div className="transform-gpu max-w-400 mx-auto p-8 space-y-8 min-h-screen">
        <div className="transform-gpu h-48 w-full bg-slate-200 rounded-3xl animate-pulse" />
        <div className="transform-gpu h-96 w-full bg-slate-200 rounded-4xl animate-pulse" />
    </div>
  );

  const habitCount = habits.length;

  return (
    <div className="transform-gpu max-w-400 mx-auto p-4 sm:p-8 space-y-8 font-sans text-slate-800 relative min-h-screen">
      
      {/* --- ADD HABIT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="transform-gpu fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
             <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="transform-gpu bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="transform-gpu p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="transform-gpu text-xl font-bold text-slate-800">Create New Habit</h3>
                <button onClick={() => setIsModalOpen(false)} className="transform-gpu text-slate-400 hover:text-slate-700 transition-colors bg-white p-2 rounded-full shadow-sm border border-slate-100"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleCreateHabit} className="transform-gpu flex-1 overflow-y-auto p-6 space-y-8">
                <div className="transform-gpu space-y-3">
                  <label className="transform-gpu text-xs font-bold uppercase tracking-wider text-slate-400">What do you want to achieve?</label>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="e.g. 15 mins Meditation"
                    value={newHabitTitle}
                    onChange={e => setNewHabitTitle(e.target.value)}
                    className="transform-gpu w-full text-2xl font-semibold placeholder:text-slate-300 border-b-2 border-slate-100 py-2 focus:outline-none focus:border-indigo-500 transition-colors bg-transparent"
                  />
                </div>

                <div className="transform-gpu space-y-4">
                  <label className="transform-gpu text-xs font-bold uppercase tracking-wider text-slate-400">Choose an Icon</label>
                  <div className="transform-gpu space-y-6">
                    {ICON_OPTIONS.map((cat) => (
                      <div key={cat.category}>
                        <h4 className="transform-gpu text-xs font-semibold text-slate-400 mb-3">{cat.category}</h4>
                        <div className="transform-gpu grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {cat.items.map((opt) => {
                            const IsSelected = newHabitIcon === opt.value;
                            const IconComp = opt.component;
                            return (
                              <motion.button
                                key={opt.value}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setNewHabitIcon(opt.value)}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all",
                                  IsSelected 
                                    ? `bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm ring-2 ring-indigo-500/20` 
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                                )}
                              >
                                <IconComp size={24} strokeWidth={1.5} />
                                <span className="transform-gpu text-[10px] font-medium">{opt.label}</span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="transform-gpu space-y-3">
                  <label className="transform-gpu text-xs font-bold uppercase tracking-wider text-slate-400">Color Theme</label>
                  <div className="transform-gpu flex flex-wrap gap-4">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setNewHabitColor(c)}
                        className={cn(
                          "w-10 h-10 rounded-full transition-all flex items-center justify-center",
                          c.bg,
                          (newHabitColor.name === c.name) ? "ring-4 ring-offset-2 ring-slate-200 scale-110 shadow-lg" : "opacity-70 hover:opacity-100 hover:scale-110"
                        )}
                        title={c.name}
                      >
                         {(newHabitColor.name === c.name) && <Check className="transform-gpu text-white w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="transform-gpu p-6 border-t border-slate-100 bg-slate-50">
                <button 
                  onClick={handleCreateHabit}
                  disabled={!newHabitTitle}
                  className="transform-gpu w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
                >
                  Create Habit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HERO HEADER --- */}
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="transform-gpu lg:col-span-2 relative overflow-hidden bg-linear-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200">
          <div className="transform-gpu absolute top-0 right-0 p-8 opacity-10"><Sparkles size={180} strokeWidth={1} /></div>
          <div className="transform-gpu absolute bottom-0 left-0 p-6 opacity-10"><Zap size={120} strokeWidth={1} /></div>
          <div className="transform-gpu relative z-10 h-full flex flex-col justify-between gap-6">
            <div className="transform-gpu flex items-center gap-2 text-indigo-100 font-medium text-xs uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              <Quote size={12} /><span>Daily Inspiration</span>
            </div>
            <h2 className="transform-gpu text-2xl sm:text-3xl font-bold leading-tight font-serif italic tracking-wide">&quot;{quote}&quot;</h2>
            <div className="transform-gpu flex items-center gap-2 opacity-80 text-sm">
              <div className="transform-gpu w-8 h-px bg-white/50"></div>
              <span>Keep pushing forward</span>
            </div>
          </div>
        </div>

        <div className="transform-gpu bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6">
          <div>
            <h2 className="transform-gpu text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Time Travel</h2>
            <div className="transform-gpu flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <button onClick={() => shiftDate(-1)} className="transform-gpu p-3 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all"><ChevronLeft size={20} /></button>
              <div className="transform-gpu text-center">
                <div className="transform-gpu text-sm font-bold text-slate-800">
                  {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="transform-gpu text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{baseDate.getFullYear()}</div>
              </div>
              <button onClick={() => shiftDate(1)} className="transform-gpu p-3 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>
          
          <div className="transform-gpu flex gap-2">
             {(["week", "month"] as const).map((v) => (
              <button 
                key={v} 
                onClick={() => setView(v)} 
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all border",
                  view === v ? "bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
             <button onClick={() => setBaseDate(new Date())} className="transform-gpu px-4 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors" title="Today">
               <RotateCcw size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID CONTAINER --- */}
      <div className="transform-gpu bg-white border border-slate-200 rounded-4xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
        <div className="transform-gpu overflow-x-auto custom-scrollbar">
          <div className="transform-gpu min-w-[50rem]">
            
            {/* Grid Header */}
            <div 
              className="transform-gpu grid gap-4 p-6 border-b border-slate-100 bg-white/80 sticky top-0 z-10 backdrop-blur-xl items-end"
              style={{ gridTemplateColumns: `140px repeat(${habitCount}, minmax(100px, 1fr)) 60px 250px 80px` }}
            >
              <div className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 pb-4">Timeline</div>

              <AnimatePresence mode='popLayout'>
                {habits.map((habit) => {
                  const Icon = ICON_MAP[habit.icon || "zap"] || Zap;
                  const theme = COLOR_OPTIONS.find(c => habit.color?.includes(c.name)) || DEFAULT_COLOR;

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      key={habit.id} 
                      className="transform-gpu group relative flex flex-col items-center gap-3 pb-2"
                    >
                      <div className={cn(
                        "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 shadow-sm",
                        theme.light, theme.class
                      )}>
                        <Icon size={24} />
                         <button 
                          onClick={() => handleDeleteHabit(habit.id, habit.title)}
                          className="transform-gpu absolute -top-2 -right-2 bg-white border border-rose-100 text-rose-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm scale-75 hover:scale-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <span className="transform-gpu text-xs font-bold text-slate-600 truncate max-w-22.5 text-center">{habit.title}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div className="transform-gpu flex flex-col items-center justify-end pb-4">
                 <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsModalOpen(true)}
                  className="transform-gpu w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
                >
                  <Plus size={20} />
                </motion.button>
              </div>

              <div className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-widest pb-4 pl-4">Reflection</div>
              <div className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-widest text-center pb-4">Score</div>
            </div>

            {/* Grid Rows */}
            <div className="transform-gpu divide-y divide-slate-50">
              {days.map((day) => {
                const dateKey = day.toDateString();
                const isToday = new Date().toDateString() === dateKey;
                const logsForDay = logs.filter(l => new Date(l.date).toDateString() === dateKey && l.completed);
                
                const totalPossible = habits.length;
                const completedCount = logsForDay.filter(l => habits.some(h => h.id === l.habitId)).length;
                const progress = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
                const isPerfect = progress === 100 && totalPossible > 0;

                return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={day.toISOString()} 
                    className={cn(
                      "grid gap-4 px-6 items-center transition-colors duration-200 group",
                      view === 'month' ? 'py-2' : 'py-4',
                      isToday ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                    )}
                    style={{ gridTemplateColumns: `140px repeat(${habitCount}, minmax(100px, 1fr)) 60px 250px 80px` }}
                  >
                    
                    <div className="transform-gpu flex items-center gap-4 pl-4">
                      <div className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition-colors",
                        isToday ? "bg-white border-indigo-200 shadow-md shadow-indigo-100" : "bg-transparent border-transparent group-hover:border-slate-200 group-hover:bg-white"
                      )}>
                        <span className="transform-gpu text-[10px] font-bold uppercase text-slate-400">{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                        <span className={cn("text-lg font-bold", isToday ? "text-indigo-600" : "text-slate-700")}>{day.getDate()}</span>
                      </div>
                      {isToday && <div className="transform-gpu text-[10px] font-bold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">TODAY</div>}
                    </div>

                    {habits.map((habit) => {
                      const isChecked = logsForDay.some(l => l.habitId === habit.id);
                      const theme = COLOR_OPTIONS.find(c => habit.color?.includes(c.name)) || DEFAULT_COLOR;

                      return (
                        <div key={habit.id} className="transform-gpu flex items-center justify-center relative">
                          <motion.button
                            onClick={() => handleToggle(habit.id, day, isChecked)}
                            whileTap={{ scale: 0.8 }}
                            className={cn(
                              "relative flex items-center justify-center rounded-xl transition-all duration-300 border-2 overflow-hidden",
                              view === 'month' ? 'w-10 h-10' : 'w-12 h-12',
                              isChecked ? `${theme.bg} ${theme.border} shadow-lg shadow-indigo-500/20` : "bg-slate-50 border-slate-200 hover:border-slate-300"
                            )}
                          >
                            <AnimatePresence>
                                {isChecked && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    >
                                        <Check strokeWidth={4} className="transform-gpu w-5 h-5 text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      );
                    })}

                    <div />

                    <div className="transform-gpu relative group/note">
                        <input
                            type="text"
                            defaultValue={notes.find(n => new Date(n.date).toDateString() === dateKey)?.content || ""}
                            onBlur={(e) => handleNoteBlur(day, e.target.value)}
                            placeholder="Add a daily note..."
                            className="transform-gpu w-full bg-slate-50 border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-lg px-4 py-2 text-sm text-slate-700 placeholder-slate-400 transition-all"
                        />
                    </div>

                    <div className="transform-gpu flex flex-col items-center justify-center gap-1">
                       <div className="transform-gpu relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            className={cn("h-full absolute left-0 top-0 rounded-full", isPerfect ? "bg-linear-to-r from-emerald-400 to-emerald-500" : "bg-linear-to-r from-indigo-400 to-violet-500")}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                       </div>
                       <span className={cn("text-[10px] font-bold", isPerfect ? "text-emerald-600" : "text-slate-400")}>{progress}%</span>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
