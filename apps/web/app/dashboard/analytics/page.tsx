"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Loader2, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

// --- Types ---

// ✅ FIX: Added [key: string]: string | number to satisfy Recharts 'ChartDataInput' requirements

interface DailyStat {
  day: string;
  focusMinutes: number;
  completed: number;
  total: number;
  [key: string]: string | number; 
}

interface HabitStat {
  name: string;
  completed: number;
  total: number;
  rate: number;
  [key: string]: string | number;
}

interface TaskDistribution {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AnalyticsData {
  dailyStats: DailyStat[];
  habitStats: HabitStat[];
  taskDistribution: TaskDistribution[];
}

// Type for the Tooltip Payload Item (Recharts internal shape)
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload?: unknown;
  dataKey?: string | number;
}

// Explicit interface for CustomTooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']; 

// --- Components ---

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((entry: TooltipPayloadItem, index: number) => (
          <div key={index} className="flex items-center gap-2 text-slate-600">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-mono font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse h-32" />
);

const SkeletonChart = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse h-96" />
);

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonChart /><SkeletonChart />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-96 items-center justify-center text-slate-500">
        <AlertCircle size={48} className="mb-4 text-rose-400" />
        <p className="text-lg font-medium">Could not load analytics data.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalFocus = data.dailyStats.reduce((acc, d) => acc + d.focusMinutes, 0);
  const totalTasksDone = data.dailyStats.reduce((acc, d) => acc + d.completed, 0);
  const avgHabitRate = data.habitStats.length > 0 
    ? Math.round(data.habitStats.reduce((acc, h) => acc + h.rate, 0) / data.habitStats.length) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Insights for the last 7 days</p>
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 self-start md:self-auto">
          Last Updated: Just now
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
              <Clock size={22} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Focus Time</p>
            <p className="text-3xl font-bold text-slate-900">
              {Math.floor(totalFocus / 60)}<span className="text-lg text-slate-400 font-normal">h</span> {totalFocus % 60}<span className="text-lg text-slate-400 font-normal">m</span>
            </p>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Tasks Completed</p>
            <p className="text-3xl font-bold text-slate-900">{totalTasksDone}</p>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600 group-hover:scale-110 transition-transform">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Habit Consistency</p>
            <p className="text-3xl font-bold text-slate-900">
              {avgHabitRate}<span className="text-xl text-slate-400">%</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Focus Time Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Daily Focus</h3>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">Minutes / Day</span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Bar 
                  dataKey="focusMinutes" 
                  name="Focus Minutes" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800">Task Velocity</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  name="Completed" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#10b981', strokeWidth: 0}} 
                  activeDot={{r: 6}}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Planned" 
                  stroke="#cbd5e1" 
                  strokeWidth={2} 
                  dot={{r: 3, fill: '#cbd5e1', strokeWidth: 0}} 
                  strokeDasharray="4 4" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-2">Completion Rate</h3>
          <div className="flex h-full items-center">
            <div className="w-1/2 h-full relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.taskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                   <span className="block text-2xl font-bold text-slate-700">
                     {data.taskDistribution.find(x => x.name === 'Completed')?.value || 0}
                   </span>
                   <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Done</span>
                 </div>
              </div>
            </div>
            
            <div className="w-1/2 pl-4 space-y-3">
               {data.taskDistribution.map((entry, index) => (
                 <div key={index} className="flex items-center justify-between group">
                   <div className="flex items-center gap-2.5">
                     <div 
                       className="w-2.5 h-2.5 rounded-full ring-2 ring-transparent group-hover:ring-slate-100 transition-all" 
                       style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                     />
                     <span className="text-sm text-slate-600 font-medium">{entry.name}</span>
                   </div>
                   <span className="text-sm font-bold text-slate-800">{entry.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Habit Performance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Habit Adherence</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
            {data.habitStats.map((h) => (
              <div key={h.name}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-slate-700">{h.name}</span>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                       h.rate >= 80 ? 'text-emerald-700 bg-emerald-50' : 
                       h.rate >= 50 ? 'text-amber-700 bg-amber-50' : 
                       'text-rose-700 bg-rose-50'
                    }`}>
                      {h.rate}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      h.rate >= 80 ? 'bg-emerald-500' : h.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} 
                    style={{ width: `${h.rate}%` }} 
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{h.completed} of {h.total} days completed</p>
              </div>
            ))}
            {data.habitStats.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                <Loader2 className="mb-2 opacity-20" size={24} />
                No active habits found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}