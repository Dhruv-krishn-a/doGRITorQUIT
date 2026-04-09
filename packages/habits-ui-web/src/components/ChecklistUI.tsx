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
    <div className="transform-gpu w-full p-4 sm:p-8 space-y-8 font-sans text-[var(--text-primary)] relative min-h-screen bg-[var(--bg-primary)]">
      
      {/* --- ADD HABIT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="transform-gpu fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
             <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="transform-gpu bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--border-color)]"
            >
              <div className="transform-gpu p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
                <h3 className="transform-gpu text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Initialize Vector</h3>
                <button onClick={() => setIsModalOpen(false)} className="transform-gpu text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-primary)] p-3 rounded-2xl shadow-sm border border-[var(--border-color)]"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleCreateHabit} className="transform-gpu flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar text-left">
                <div className="transform-gpu space-y-4">
                  <label className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1">Mission Objective</label>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="e.g. 15 MINS MEDITATION"
                    value={newHabitTitle}
                    onChange={e => setNewHabitTitle(e.target.value)}
                    className="transform-gpu w-full text-3xl font-black italic uppercase placeholder:text-[var(--text-secondary)]/20 border-b-2 border-[var(--border-color)] py-3 focus:outline-none focus:border-[var(--accent-color)] transition-colors bg-transparent tracking-tighter"
                  />
                </div>

                <div className="transform-gpu space-y-6">
                  <label className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1">Icon Designation</label>
                  <div className="transform-gpu space-y-8">
                    {ICON_OPTIONS.map((cat) => (
                      <div key={cat.category}>
                        <h4 className="transform-gpu text-[9px] font-black text-[var(--text-secondary)]/60 mb-4 uppercase tracking-[0.3em]">{cat.category}</h4>
                        <div className="transform-gpu grid grid-cols-4 sm:grid-cols-6 gap-4">
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
                                  "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                                  IsSelected 
                                    ? `bg-[var(--accent-color)]/10 border-[var(--accent-color)]/30 text-[var(--accent-color)] shadow-xl shadow-[var(--accent-color)]/10 ring-2 ring-[var(--accent-color)]/20` 
                                    : "bg-[var(--bg-secondary)]/50 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                )}
                              >
                                <IconComp size={24} strokeWidth={2} />
                                <span className="transform-gpu text-[8px] font-black uppercase tracking-tighter mt-1">{opt.label}</span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="transform-gpu space-y-4">
                  <label className="transform-gpu text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1">Color Frequency</label>
                  <div className="transform-gpu flex flex-wrap gap-5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setNewHabitColor(c)}
                        className={cn(
                          "w-12 h-12 rounded-2xl transition-all flex items-center justify-center border border-white/10",
                          c.bg,
                          (newHabitColor.name === c.name) ? "ring-4 ring-offset-4 ring-offset-[var(--bg-card)] ring-[var(--accent-color)] scale-110 shadow-2xl" : "opacity-60 hover:opacity-100 hover:scale-110"
                        )}
                        title={c.name}
                      >
                         {(newHabitColor.name === c.name) && <Check className="transform-gpu text-white w-6 h-6 stroke-[4]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="transform-gpu p-8 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                <button 
                  onClick={handleCreateHabit}
                  disabled={!newHabitTitle}
                  className="transform-gpu w-full py-5 bg-[var(--accent-color)] hover:opacity-90 text-[var(--bg-primary)] font-black uppercase tracking-[0.3em] rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-[var(--accent-color)]/20 italic text-xs"
                >
                  Execute Initialization
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HERO HEADER & ANALYTICS --- */}
      <div className="transform-gpu grid grid-cols-1 xl:grid-cols-12 gap-8 min-w-0 overflow-hidden">
        <div className="transform-gpu xl:col-span-4 relative overflow-hidden bg-gradient-to-br from-[var(--accent-color)] to-indigo-700 rounded-[3rem] p-8 sm:p-10 text-[var(--bg-primary)] shadow-2xl shadow-[var(--accent-color)]/20 h-full min-h-[320px]">
          <div className="transform-gpu absolute top-0 right-0 p-10 opacity-10"><Sparkles size={200} strokeWidth={1} /></div>
          <div className="transform-gpu relative z-10 h-full flex flex-col justify-between gap-8 text-left">
            <div className="transform-gpu flex items-center gap-2 text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-[0.3em] bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              <Quote size={14} /><span>Neural Directive</span>
            </div>
            <h2 className="transform-gpu text-2xl sm:text-3xl font-black leading-tight italic uppercase tracking-tighter">&quot;{quote}&quot;</h2>
            <div className="transform-gpu flex items-center gap-3 opacity-80 text-[10px] font-black uppercase tracking-[0.4em]">
              <div className="transform-gpu w-10 h-px bg-[var(--bg-primary)]/50"></div>
              <span>Keep pushing forward</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-8 shadow-xl flex flex-col min-h-[320px] min-w-0 h-full overflow-hidden text-left relative">
           {/* Animated Background Gradients */}
           <div className="transform-gpu absolute top-[-10%] left-[-10%] w-[20vw] h-[20vw] bg-[var(--accent-color)]/5 rounded-full blur-[80px] pointer-events-none" />

           <div className="flex items-center justify-between mb-8 shrink-0 relative z-10">
              <div className="flex flex-col gap-2">
                <h2 className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 italic">
                  <TrendingUp size={14} className="text-[var(--accent-color)]"/> Consistency Pulse
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={selectedHabitId} 
                    onChange={(e) => setSelectedHabitId(e.target.value)}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-[var(--text-secondary)] transition-colors italic"
                  >
                    <option value="all">All Vectors</option>
                    {habits.map(h => (
                      <option key={h.id} value={h.id}>{h.title}</option>
                    ))}
                  </select>
                  <div className="flex gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
                    {(['7d', '30d', 'view'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setAnalyticsRange(r)}
                        className={cn(
                          "px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all italic",
                          analyticsRange === r ? "bg-[var(--bg-card)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic mb-1">Avg Pulse</div>
                <div className="text-3xl font-black text-[var(--text-primary)] italic tracking-tighter">{stats.avg}%</div>
              </div>
           </div>
           
           <div className="w-full flex-1 min-h-[180px] h-[180px] relative mt-2 z-10">
              <ResponsiveContainer width="99%" height="100%" minHeight={180}>
                <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 8, fontWeight: 900, fill: 'var(--text-secondary)', textTransform: 'uppercase'}} 
                    dy={10}
                    interval={analyticsRange === '30d' ? 4 : 0}
                  />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip 
                    cursor={{ stroke: 'var(--border-color)', strokeWidth: 1 }}
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: '900', color: 'var(--accent-color)', textTransform: 'uppercase', fontStyle: 'italic' }}
                    labelStyle={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    name="Resolution"
                    stroke="var(--accent-color)" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                    animationDuration={1500}
                    baseValue={0}
                    connectNulls
                    dot={{ r: 5, fill: 'var(--accent-color)', strokeWidth: 2, stroke: 'var(--bg-card)' }}
                    activeDot={{ r: 7, fill: 'var(--accent-color)', strokeWidth: 3, stroke: 'var(--bg-card)', shadow: '0 0 10px var(--accent-color)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="transform-gpu xl:col-span-3 flex flex-col gap-6 min-w-0">
          <div className="transform-gpu grid grid-cols-2 gap-6 flex-1 text-left">
             <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                <div className="transform-gpu absolute -right-4 -bottom-4 opacity-[0.03] text-[var(--accent-color)] group-hover:scale-110 transition-transform duration-700">
                  <CheckCircle2 size={100} />
                </div>
                <div className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-2 italic">Resonance Days</div>
                <div className="transform-gpu text-4xl font-black text-[var(--accent-color)] italic tracking-tighter">{stats.perfect}</div>
             </div>
             <div className="transform-gpu bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-center overflow-hidden relative group">
                <div className="transform-gpu absolute -right-4 -bottom-4 opacity-[0.03] text-indigo-500 group-hover:scale-110 transition-transform duration-700">
                  <Zap size={100} />
                </div>
                <div className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-2 italic">Prime Vector</div>
                <div className="transform-gpu text-xs font-black text-[var(--text-primary)] truncate uppercase italic leading-tight">{stats.topHabit}</div>
             </div>
          </div>

          <div className="transform-gpu bg-[var(--text-primary)] rounded-[2.5rem] p-6 text-[var(--bg-primary)] shadow-2xl space-y-6">
            <div className="transform-gpu flex items-center justify-between">
              <button onClick={() => shiftDate(-1)} className="transform-gpu p-3 hover:bg-[var(--bg-primary)]/10 rounded-xl transition-all"><ChevronLeft size={18} strokeWidth={3} /></button>
              <div className="transform-gpu text-center flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Temporal Window</span>
                <div className="transform-gpu text-[11px] font-black uppercase italic tracking-tighter">
                  {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
              <button onClick={() => shiftDate(1)} className="transform-gpu p-3 hover:bg-[var(--bg-primary)]/10 rounded-xl transition-all"><ChevronRight size={18} strokeWidth={3} /></button>
            </div>
            <div className="transform-gpu flex gap-2">
               {(["week", "month"] as const).map((v) => (
                <button 
                  key={v} 
                  onClick={() => setView(v)} 
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2 italic",
                    view === v ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--bg-primary)]" : "bg-transparent text-[var(--bg-primary)]/60 border-[var(--bg-primary)]/20 hover:border-[var(--bg-primary)]/40"
                  )}
                >
                  {v}
                </button>
              ))}
               <button onClick={() => setBaseDate(new Date())} className="transform-gpu p-3 bg-[var(--bg-primary)]/10 text-[var(--bg-primary)] rounded-xl hover:bg-[var(--bg-primary)]/20 transition-colors border border-[var(--bg-primary)]/10">
                 <RotateCcw size={16} strokeWidth={3} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID CONTAINER --- */}
      <div className="transform-gpu bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-[3rem] sm:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col relative">
        <div className="transform-gpu absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[var(--accent-color)]/5 to-transparent pointer-events-none" />
        
        <div className="transform-gpu custom-scrollbar relative z-10">
          <div className="transform-gpu w-full">
            
            {/* Grid Header */}
            <div 
              className="transform-gpu grid gap-6 p-6 sm:p-8 border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-xl sticky top-0 z-30 items-end shadow-sm"
              style={{ gridTemplateColumns: `160px repeat(${habitCount}, 1fr) 1.8fr 100px` }}
            >
              <div className="transform-gpu flex flex-col gap-3 pl-4 pb-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
                  <span className="transform-gpu text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] italic">Pulse Line</span>
                </div>
                <button 
                  onClick={handleMarkAllDone}
                  className="transform-gpu flex items-center gap-2 text-[var(--bg-primary)] text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all bg-[var(--accent-color)] px-4 py-2.5 rounded-xl shadow-lg shadow-[var(--accent-color)]/20 w-fit italic"
                >
                  <CheckCircle2 size={12} /> Sync Today
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
                      className="transform-gpu group relative flex flex-col items-center gap-4 pb-2 w-full overflow-hidden"
                    >
                      <div className={cn(
                        "relative w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2 shadow-sm shrink-0 border border-white/5",
                        theme.light, theme.class
                      )}>
                        <Icon size={28} strokeWidth={2.5} />
                        {streak > 0 && (
                          <div className="transform-gpu absolute -bottom-2 -right-2 bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-lg border-2 border-[var(--bg-card)] shadow-xl flex items-center gap-0.5 italic">
                            <Zap size={10} fill="currentColor" />{streak}
                          </div>
                        )}
                         <button 
                          onClick={() => handleDeleteHabit(habit.id, habit.title)}
                          className="transform-gpu absolute -top-3 -right-3 bg-[var(--bg-card)] border border-[var(--border-color)] text-rose-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-xl scale-75 hover:scale-100 z-20"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                      <span className="transform-gpu text-[10px] sm:text-xs font-black text-[var(--text-primary)] line-clamp-2 text-center px-2 min-h-[2.5em] leading-snug w-full uppercase italic tracking-tighter">
                        {habit.title}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div className="transform-gpu flex flex-col items-center justify-end pb-6">
                 <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsModalOpen(true)}
                  className="transform-gpu w-14 h-14 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center shadow-xl hover:shadow-[var(--accent-color)]/20 transition-all border border-transparent hover:bg-[var(--accent-color)]"
                >
                  <Plus size={28} strokeWidth={3} />
                </motion.button>
              </div>

              <div className="transform-gpu text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] pb-6 pl-6 italic text-left">Reflection Ledger</div>
              <div className="transform-gpu text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] text-center pb-6 italic">Pulse</div>
            </div>

            {/* Grid Rows */}
            <div className="transform-gpu divide-y divide-[var(--border-color)]/30 w-full bg-[var(--bg-card)]/20">
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
                      "grid gap-6 px-6 sm:px-8 items-center transition-all duration-300 group relative w-full",
                      view === 'month' ? 'py-3' : 'py-6',
                      isToday ? 'bg-[var(--accent-color)]/5 backdrop-blur-sm' : 'hover:bg-[var(--bg-secondary)]/40'
                    )}
                    style={{ gridTemplateColumns: `160px repeat(${habitCount}, 1fr) 1.8fr 100px` }}
                  >
                    
                    <div className="transform-gpu flex items-center gap-5 pl-4 bg-transparent text-left">
                      <div className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 transition-all duration-500",
                        isToday 
                          ? "bg-[var(--accent-color)] border-[var(--accent-color)] shadow-xl shadow-[var(--accent-color)]/20 scale-105" 
                          : "bg-[var(--bg-secondary)]/50 border-[var(--border-color)] group-hover:border-[var(--text-secondary)]/30"
                      )}>
                        <span className={cn("transform-gpu text-[9px] font-black uppercase tracking-widest", isToday ? "text-[var(--bg-primary)]" : "text-[var(--text-secondary)]")}>{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                        <span className={cn("text-xl font-black italic tracking-tighter leading-none", isToday ? "text-[var(--bg-primary)]" : "text-[var(--text-primary)]")}>{day.getDate()}</span>
                      </div>
                      {isToday && <div className="transform-gpu hidden sm:block text-[9px] font-black text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-3 py-1 rounded-lg uppercase tracking-widest italic border border-[var(--accent-color)]/20 shadow-sm">Today</div>}
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
                              "relative flex items-center justify-center rounded-2xl transition-all duration-500 border-2 overflow-hidden",
                              view === 'month' ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-12 h-12 sm:w-14 sm:h-14',
                              isChecked 
                                ? `${theme.bg} ${theme.border} shadow-2xl shadow-[var(--accent-color)]/10 scale-110` 
                                : "bg-[var(--bg-secondary)]/30 border-[var(--border-color)] hover:border-[var(--text-secondary)]/50 hover:bg-[var(--bg-secondary)]/60"
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
                                        <Check strokeWidth={5} className="transform-gpu w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      );
                    })}

                    <div className="transform-gpu relative group/note w-full pl-4 text-left">
                        <input
                            type="text"
                            defaultValue={notes.find(n => new Date(n.date).toDateString() === dateKey)?.content || ""}
                            onBlur={(e) => handleNoteBlur(day, e.target.value)}
                            placeholder="DAILY REFLECTION VECTOR..."
                            className="transform-gpu w-full bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] hover:border-[var(--text-secondary)]/30 focus:border-[var(--accent-color)]/50 focus:bg-[var(--bg-card)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/5 rounded-2xl px-5 py-3 text-sm font-black text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/20 transition-all italic uppercase tracking-tight"
                        />
                    </div>

                    <div className="transform-gpu flex flex-col items-center justify-center gap-2 min-w-[80px]">
                       <div className="transform-gpu relative w-full h-2 sm:h-2.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                          <motion.div 
                            className={cn("h-full absolute left-0 top-0 rounded-full shadow-lg", isPerfect ? "bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-500/20" : "bg-gradient-to-r from-[var(--accent-color)] to-indigo-600 shadow-[var(--accent-color)]/20")}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                       </div>
                       <span className={cn("text-[9px] sm:text-[11px] font-black uppercase italic tracking-tighter", isPerfect ? "text-emerald-500 drop-shadow-sm" : "text-[var(--text-secondary)]")}>{progress}%</span>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Future Roadmap Section */}
      <section className="transform-gpu pt-16 border-t border-[var(--border-color)] text-left">
        <div className="transform-gpu flex items-center gap-4 mb-10 ml-2">
          <div className="p-3 bg-[var(--bg-secondary)] text-[var(--accent-color)] rounded-2xl border border-[var(--border-color)] shadow-sm">
            <Sparkles size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] italic">Evolution Roadmap</h2>
            <p className="text-[9px] font-bold text-[var(--text-secondary)]/40 uppercase tracking-widest mt-1">Pending System Enhancements</p>
          </div>
        </div>
        <div className="transform-gpu grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Neural Nudges", desc: "Adaptive notifications triggered by cognitive velocity patterns.", icon: Zap, color: 'text-amber-500' },
            { title: "Synapse Reports", desc: "Automated multidimensional performance synthesis delivered weekly.", icon: TrendingUp, color: 'text-[var(--accent-color)]' },
            { title: "Vector Stacking", desc: "Sequential habit chaining for maximum mission efficiency.", icon: CheckCircle2, color: 'text-emerald-500' },
            { title: "Hive Motivation", desc: "Asynchronous competitive protocols with fellow architects.", icon: Sparkles, color: 'text-fuchsia-500' }
          ].map((feat, i) => (
            <div key={i} className="transform-gpu p-8 bg-[var(--bg-card)]/40 backdrop-blur-md border border-[var(--border-color)] rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-[var(--accent-color)]/20 transition-all group relative overflow-hidden">
              <div className={cn("absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-5 transition-opacity duration-700", feat.color)}>
                <feat.icon size={120} />
              </div>
              <h3 className={cn("text-xs font-black uppercase tracking-widest mb-3 transition-colors italic", feat.color)}>{feat.title}</h3>
              <p className="transform-gpu text-[10px] font-bold text-[var(--text-secondary)] leading-relaxed uppercase tracking-tighter">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
