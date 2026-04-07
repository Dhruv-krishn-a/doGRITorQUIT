"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Quote, Plus, X, Trash2, 
  Check, Sparkles, Zap, RotateCcw, TrendingUp, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useHabitsContext, HabitData } from "@gritorquit/habits-core";
import { 
  ICON_OPTIONS, ICON_MAP, COLOR_OPTIONS, DEFAULT_COLOR, QUOTES 
} from "../constants";

import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

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

  // Filters State
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d" | "view">("7d");

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

  // Analytics Data Calculation
  const analyticsData = useMemo(() => {
    let rangeDays = days;
    
    if (analyticsRange === "7d") {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);
      d7.setHours(0,0,0,0);
      rangeDays = [];
      for(let i=0; i<7; i++) {
        const d = new Date(d7);
        d.setDate(d.getDate() + i);
        rangeDays.push(d);
      }
    } else if (analyticsRange === "30d") {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 29);
      d30.setHours(0,0,0,0);
      rangeDays = [];
      for(let i=0; i<30; i++) {
        const d = new Date(d30);
        d.setDate(d.getDate() + i);
        rangeDays.push(d);
      }
    }

    return rangeDays.map(day => {
      const dateKey = day.toDateString();
      const dayLogs = logs.filter(l => {
        try {
          return new Date(l.date).toDateString() === dateKey && l.completed;
        } catch { return false; }
      });
      
      let rate = 0;
      if (selectedHabitId === "all") {
        rate = habits.length > 0 ? Math.round((dayLogs.length / habits.length) * 100) : 0;
      } else {
        const habitLog = dayLogs.find(l => l.habitId === selectedHabitId);
        rate = habitLog ? 100 : 0;
      }

      return {
        name: day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
        fullDate: dateKey,
        rate: rate,
        count: dayLogs.length
      };
    });
  }, [days, logs, habits, selectedHabitId, analyticsRange]);

  const stats = useMemo(() => {
    if (habits.length === 0) return { avg: 0, perfect: 0, topHabit: "None" };
    const rates = analyticsData.map(d => d.rate);
    const avg = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
    const perfect = analyticsData.filter(d => d.rate === 100).length;
    
    const habitCounts = habits.map(h => ({
      title: h.title,
      count: logs.filter(l => l.habitId === h.id && l.completed).length
    }));
    const topHabit = habitCounts.sort((a, b) => b.count - a.count)[0]?.title || "None";

    return { avg, perfect, topHabit };
  }, [analyticsData, habits, logs]);

  // Streak Calculation
  const getStreak = useCallback((habitId: string) => {
    let streak = 0;
    const habitLogs = logs
      .filter(l => l.habitId === habitId && l.completed)
      .map(l => {
        const d = new Date(l.date);
        d.setHours(0,0,0,0);
        return d.getTime();
      });

    if (habitLogs.length === 0) return 0;

    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    if (!habitLogs.includes(checkDate.getTime())) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      if (habitLogs.includes(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [logs]);

  useEffect(() => {
    const isInitialLoad = baseDate.toISOString() === serverDate;
    if (!isInitialLoad || !initialData || habits.length === 0) {
        refreshData(start, end);
    }
  }, [start.getTime(), end.toISOString(), refreshData]);
  
  useEffect(() => { 
      const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)] ?? "Keep pushing forward.";
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

  const handleMarkAllDone = async () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateKey = today.toDateString();
    
    const logsForToday = logs.filter(l => new Date(l.date).toDateString() === dateKey && l.completed);
    
    for (const habit of habits) {
      const isDone = logsForToday.some(l => l.habitId === habit.id);
      if (!isDone) {
        await toggleHabit(habit.id, today, false);
      }
    }
  };

  const shiftDate = (amount: number) => {
    const newDate = new Date(baseDate);
    if (view === "week") newDate.setDate(newDate.getDate() + amount * 7);
    else newDate.setMonth(newDate.getMonth() + amount);
    setBaseDate(newDate);
  };

  if (loading && habits.length === 0) return (
    <div className="transform-gpu w-full p-4 sm:p-8 space-y-8 min-h-screen">
        <div className="transform-gpu h-48 w-full bg-slate-200 rounded-3xl animate-pulse" />
        <div className="transform-gpu h-96 w-full bg-slate-200 rounded-4xl animate-pulse" />
    </div>
  );

  const habitCount = habits.length;

  return (
    <div className="transform-gpu w-full p-4 sm:p-8 space-y-8 font-sans text-slate-800 relative min-h-screen">
      
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

      {/* --- HERO HEADER & ANALYTICS --- */}
      <div className="transform-gpu grid grid-cols-1 xl:grid-cols-12 gap-6 min-w-0 overflow-hidden">
        <div className="transform-gpu xl:col-span-4 relative overflow-hidden bg-linear-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-indigo-200 h-full min-h-[300px]">
          <div className="transform-gpu absolute top-0 right-0 p-8 opacity-10"><Sparkles size={180} strokeWidth={1} /></div>
          <div className="transform-gpu relative z-10 h-full flex flex-col justify-between gap-6">
            <div className="transform-gpu flex items-center gap-2 text-indigo-100 font-medium text-xs uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              <Quote size={12} /><span>Daily Inspiration</span>
            </div>
            <h2 className="transform-gpu text-xl sm:text-2xl font-bold leading-tight font-serif italic tracking-wide">&quot;{quote}&quot;</h2>
            <div className="transform-gpu flex items-center gap-2 opacity-80 text-sm">
              <div className="transform-gpu w-8 h-px bg-white/50"></div>
              <span>Keep pushing forward</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col min-h-[300px] min-w-0 h-full overflow-hidden">
           <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex flex-col gap-1">
                <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-indigo-50"/> Consistency Pulse
                </h2>
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedHabitId} 
                    onChange={(e) => setSelectedHabitId(e.target.value)}
                    className="bg-slate-50 border-none text-[10px] font-bold uppercase tracking-wider text-slate-600 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <option value="all">All Vectors</option>
                    {habits.map(h => (
                      <option key={h.id} value={h.id}>{h.title}</option>
                    ))}
                  </select>
                  <div className="flex gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                    {(['7d', '30d', 'view'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setAnalyticsRange(r)}
                        className={cn(
                          "px-2 py-0.5 text-[8px] font-black uppercase rounded-md transition-all",
                          analyticsRange === r ? "bg-white text-indigo-600 shadow-xs" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Avg Pulse</div>
                <div className="text-xl font-bold text-slate-800">{stats.avg}%</div>
              </div>
           </div>
           
           <div className="w-full flex-1 min-h-[180px] h-[180px] relative mt-2">
              <ResponsiveContainer width="99%" height="100%" minHeight={180}>
                <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 8, fontWeight: 700, fill: '#94a3b8'}} 
                    dy={10}
                    interval={analyticsRange === '30d' ? 4 : 0}
                  />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip 
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#6366f1' }}
                    labelStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    name="Completion"
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                    animationDuration={1500}
                    baseValue={0}
                    connectNulls
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="transform-gpu xl:col-span-3 flex flex-col gap-4 min-w-0">
          <div className="transform-gpu grid grid-cols-2 gap-4 flex-1">
             <div className="transform-gpu bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                <div className="transform-gpu text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Perfect Days</div>
                <div className="transform-gpu text-2xl font-bold text-indigo-600">{stats.perfect}</div>
             </div>
             <div className="transform-gpu bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center overflow-hidden">
                <div className="transform-gpu text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Vector</div>
                <div className="transform-gpu text-[10px] font-bold text-slate-800 truncate">{stats.topHabit}</div>
             </div>
          </div>

          <div className="transform-gpu bg-slate-900 rounded-2xl p-4 text-white shadow-lg space-y-4">
            <div className="transform-gpu flex items-center justify-between">
              <button onClick={() => shiftDate(-1)} className="transform-gpu p-2 hover:bg-white/10 rounded-lg transition-all"><ChevronLeft size={16} /></button>
              <div className="transform-gpu text-center">
                <div className="transform-gpu text-[10px] font-bold">
                  {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
              <button onClick={() => shiftDate(1)} className="transform-gpu p-2 hover:bg-white/10 rounded-lg transition-all"><ChevronRight size={16} /></button>
            </div>
            <div className="transform-gpu flex gap-2">
               {(["week", "month"] as const).map((v) => (
                <button 
                  key={v} 
                  onClick={() => setView(v)} 
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all border",
                    view === v ? "bg-white text-slate-900 border-white" : "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                  )}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
               <button onClick={() => setBaseDate(new Date())} className="transform-gpu p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                 <RotateCcw size={14} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID CONTAINER --- */}
      <div className="transform-gpu bg-white border border-slate-200 rounded-3xl sm:rounded-4xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
        <div className="transform-gpu custom-scrollbar">
          <div className="transform-gpu w-full">
            
            {/* Grid Header */}
            <div 
              className="transform-gpu grid gap-4 p-4 sm:p-6 border-b border-slate-100 bg-white sticky top-0 z-30 items-end shadow-sm"
              style={{ gridTemplateColumns: `140px repeat(${habitCount}, 1fr) 1.5fr 80px` }}
            >
              <div className="transform-gpu flex flex-col gap-2 pl-4 pb-4">
                <span className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Timeline</span>
                <button 
                  onClick={handleMarkAllDone}
                  className="transform-gpu flex items-center gap-1.5 text-indigo-600 text-[8px] font-black uppercase tracking-wider hover:text-indigo-700 transition-colors bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 w-fit"
                >
                  <CheckCircle2 size={10} /> Mark Today
                </button>
              </div>

              <AnimatePresence mode='popLayout'>
                {habits.map((habit) => {
                  const Icon = ICON_MAP[habit.icon || "zap"] || Zap;
                  const theme = COLOR_OPTIONS.find(c => habit.color?.includes(c.name)) || DEFAULT_COLOR;
                  const streak = getStreak(habit.id);

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      key={habit.id} 
                      className="transform-gpu group relative flex flex-col items-center gap-3 pb-2 w-full overflow-hidden"
                    >
                      <div className={cn(
                        "relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 shadow-sm shrink-0",
                        theme.light, theme.class
                      )}>
                        <Icon size={24} />
                        {streak > 0 && (
                          <div className="transform-gpu absolute -bottom-1 -right-1 bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-0.5">
                            <Zap size={8} fill="currentColor" />{streak}
                          </div>
                        )}
                         <button 
                          onClick={() => handleDeleteHabit(habit.id, habit.title)}
                          className="transform-gpu absolute -top-2 -right-2 bg-white border border-rose-100 text-rose-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm scale-75 hover:scale-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <span className="transform-gpu text-[10px] sm:text-xs font-bold text-slate-600 line-clamp-2 text-center px-2 min-h-[2.5em] leading-snug w-full">
                        {habit.title}
                      </span>
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

              <div className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pb-4 pl-4">Reflection</div>
              <div className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center pb-4">Score</div>
            </div>

            {/* Grid Rows */}
            <div className="transform-gpu divide-y divide-slate-50 w-full">
              {days.map((day) => {
                const dateKey = day.toDateString();
                const isToday = new Date().toDateString() === dateKey;
                const logsForDay = logs.filter(l => {
                  try {
                    return new Date(l.date).toDateString() === dateKey && l.completed;
                  } catch { return false; }
                });
                
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
                      "grid gap-4 px-4 sm:px-6 items-center transition-colors duration-200 group relative w-full",
                      view === 'month' ? 'py-2' : 'py-4',
                      isToday ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                    )}
                    style={{ gridTemplateColumns: `140px repeat(${habitCount}, 1fr) 1.5fr 80px` }}
                  >
                    
                    <div className="transform-gpu flex items-center gap-4 pl-4 bg-transparent">
                      <div className={cn(
                        "flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border transition-colors",
                        isToday ? "bg-white border-indigo-200 shadow-md shadow-indigo-100" : "bg-white/50 border-transparent group-hover:border-slate-200"
                      )}>
                        <span className="transform-gpu text-[8px] sm:text-[10px] font-bold uppercase text-slate-400">{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                        <span className={cn("text-base sm:text-lg font-bold", isToday ? "text-indigo-600" : "text-slate-700")}>{day.getDate()}</span>
                      </div>
                      {isToday && <div className="transform-gpu hidden sm:block text-[8px] font-bold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full uppercase">Today</div>}
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
                              view === 'month' ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12',
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
                                        <Check strokeWidth={4} className="transform-gpu w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      );
                    })}

                    <div className="transform-gpu relative group/note w-full">
                        <input
                            type="text"
                            defaultValue={notes.find(n => new Date(n.date).toDateString() === dateKey)?.content || ""}
                            onBlur={(e) => handleNoteBlur(day, e.target.value)}
                            placeholder="Daily reflection..."
                            className="transform-gpu w-full bg-slate-50/50 border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-lg px-4 py-2 text-sm text-slate-700 placeholder-slate-400 transition-all"
                        />
                    </div>

                    <div className="transform-gpu flex flex-col items-center justify-center gap-1 min-w-[60px]">
                       <div className="transform-gpu relative w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            className={cn("h-full absolute left-0 top-0 rounded-full", isPerfect ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-indigo-400 to-violet-500")}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                       </div>
                       <span className={cn("text-[8px] sm:text-[10px] font-bold", isPerfect ? "text-emerald-600" : "text-slate-400")}>{progress}%</span>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Future Roadmap Section */}
      <section className="transform-gpu pt-12 border-t border-slate-100">
        <div className="transform-gpu flex items-center gap-3 mb-6">
          <Sparkles className="transform-gpu text-indigo-500" size={20} />
          <h2 className="transform-gpu text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Habit Evolution Roadmap</h2>
        </div>
        <div className="transform-gpu grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Smart Reminders", desc: "Get personalized notifications to stay on track." },
            { title: "Weekly Reports", desc: "Deep dive into your performance with automated emails." },
            { title: "Habit Stacking", desc: "Link multiple habits together for higher efficiency." },
            { title: "Peer Motivation", desc: "Join focus groups and compete with fellow builders." }
          ].map((feat, i) => (
            <div key={i} className="transform-gpu p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
              <h3 className="transform-gpu text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 group-hover:text-indigo-600 transition-colors">{feat.title}</h3>
              <p className="transform-gpu text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
