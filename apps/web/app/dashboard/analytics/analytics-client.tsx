"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Clock, CheckCircle2, TrendingUp, Calendar, 
  Youtube, Target, BookOpen, Brain, Activity, ArrowUpRight, Loader2, Sparkles, Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnalyticsData {
  dailyStats: any[];
  habitStats: any[];
  taskDistribution: any[];
}

const COLORS = ['var(--accent-color)', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const TIME_RANGES = [
  { label: 'This Week', value: 7 },
  { label: 'This Month', value: 30 },
  { label: 'Quarterly', value: 90 },
];

const CATEGORIES = [
  { label: 'All Growth', value: 'ALL', icon: Activity },
  { label: 'Video Learning', value: 'YOUTUBE', icon: Youtube },
  { label: 'Strategic Plans', value: 'PLAN', icon: Target },
  { label: 'Structured Courses', value: 'COURSE', icon: BookOpen },
  { label: 'Building Projects', value: 'PROJECT', icon: Github },
];

export default function AnalyticsClientPage({ initialData }: { initialData: AnalyticsData | null }) {
  const [timeRange, setTimeRange] = useState(7);
  const [category, setCategory] = useState('ALL');
  const [data, setData] = useState<AnalyticsData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (timeRange - 1));
        startDate.setHours(0, 0, 0, 0);

        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          category: category
        });

        const res = await fetch(`/api/analytics?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to sync insights");
        
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error("Analytics fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeRange, category]);

  const summary = useMemo(() => {
    if (!data?.dailyStats) return { totalTasks: 0, totalHours: 0, growthXp: 0 };
    const tasks = data.dailyStats.reduce((acc, curr) => acc + curr.completedTasks, 0);
    const hours = data.dailyStats.reduce((acc, curr) => acc + curr.focusMinutes, 0) / 60;
    return { totalTasks: tasks, totalHours: Math.round(hours), growthXp: tasks * 10 };
  }, [data]);

  if (loading && !data) {
    return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
                <Loader2 size={32} className="text-[var(--accent-color)] animate-spin" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] italic">Analyzing your progress...</p>
        </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header & Controls */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tightest uppercase italic">Your <span className="text-[var(--accent-color)]">Insights</span></h1>
          <p className="text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-[0.3em] opacity-60">Look back at how far you've come.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border-color)]">
            {TIME_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setTimeRange(r.value)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  timeRange === r.value ? "bg-[var(--bg-card)] text-[var(--accent-color)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-[1.5rem] border transition-all whitespace-nowrap",
              category === cat.value 
                ? "bg-[var(--accent-color)] text-[var(--bg-primary)] border-transparent shadow-xl shadow-[var(--accent-color)]/20" 
                : "bg-[var(--bg-card)]/40 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/30 hover:text-[var(--text-primary)]"
            )}
          >
            <cat.icon size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Actions Completed', value: summary.totalTasks, icon: CheckCircle2, sub: '+12% from last period' },
          { label: 'Focused Hours', value: summary.totalHours, icon: Clock, sub: 'High energy detected' },
          { label: 'Growth Points', value: summary.growthXp, icon: Sparkles, sub: 'Leveling up fast' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-[var(--accent-color)]/30 transition-all shadow-sm"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <stat.icon size={100} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4 flex items-center gap-2">
              <stat.icon size={12} /> {stat.label}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black italic tracking-tighter uppercase">{stat.value}</span>
              {i === 1 && <span className="text-sm font-bold opacity-40">H</span>}
            </div>
            <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] italic flex items-center gap-1">
              <TrendingUp size={10} /> {stat.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Momentum Chart */}
        <div className="bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] p-10 rounded-[3rem] space-y-8 shadow-xl">
           <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight">Your Momentum</h3>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 mt-1">Activity over {timeRange} days</p>
           </div>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.dailyStats}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-color)" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="var(--accent-color)" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-secondary)' }}
                    dy={10}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'var(--bg-secondary)', opacity: 0.5 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                              {new Date(payload[0].payload.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm font-black italic text-[var(--accent-color)]">{payload[0].value} Actions Completed</p>
                              <p className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">{payload[0].payload.focusMinutes} Minutes Focused</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="completedTasks" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Focus Distribution */}
        <div className="bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] p-10 rounded-[3rem] space-y-8 shadow-xl">
           <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight">Time Distribution</h3>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 mt-1">Where your energy goes</p>
           </div>
           <div className="h-[350px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.taskDistribution}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data?.taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                     content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                           return (
                              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl shadow-xl">
                                 <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
                                 <p className="text-lg font-black italic">{payload[0].value} Tasks</p>
                              </div>
                           )
                        }
                        return null;
                     }}
                  />
                  <Legend 
                     verticalAlign="bottom" 
                     align="center" 
                     iconType="circle" 
                     formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* Habit Consistency */}
      <section className="bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] p-10 rounded-[3rem] shadow-xl">
        <div className="mb-10">
          <h3 className="text-2xl font-black italic uppercase tracking-tight">Your Consistency</h3>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 mt-1">Habit streaks and sticking power</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.habitStats?.map((habit: any, i: number) => (
            <div key={i} className="p-6 rounded-[2rem] bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] group hover:border-[var(--accent-color)]/30 transition-all">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl">{habit.icon || '🔥'}</span>
                  <div className="flex items-center gap-1 text-[var(--accent-color)]">
                     <TrendingUp size={12} />
                     <span className="text-[10px] font-black">{habit.streak} DAY STREAK</span>
                  </div>
               </div>
               <h4 className="text-sm font-black uppercase tracking-tight mb-2 truncate">{habit.title}</h4>
               <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div className="h-full bg-[var(--accent-color)]" style={{ width: `${(habit.completedCount / timeRange) * 100}%` }} />
               </div>
               <p className="mt-3 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Consistency: {Math.round((habit.completedCount / timeRange) * 100)}%</p>
            </div>
          ))}
          {(!data?.habitStats || data.habitStats.length === 0) && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-[var(--border-color)] rounded-3xl opacity-30">
               <Activity size={32} className="mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">No habits tracked in this period</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
