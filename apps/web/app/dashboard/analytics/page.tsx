"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from "recharts";
import { Loader2, TrendingUp, CheckCircle2, Clock } from "lucide-react";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2"/> Loading Analytics...</div>;
  if (!data) return <div className="p-8">Failed to load data</div>;

  const totalFocus = data.dailyStats.reduce((acc: number, d: any) => acc + d.focusMinutes, 0);
  const totalTasksDone = data.dailyStats.reduce((acc: number, d: any) => acc + d.completed, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
        <p className="text-slate-500">Your productivity metrics for the last 7 days</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock size={20} /></div>
            <span className="text-sm font-bold text-slate-500 uppercase">Focus Time (7d)</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {Math.floor(totalFocus / 60)}h {totalFocus % 60}m
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 size={20} /></div>
            <span className="text-sm font-bold text-slate-500 uppercase">Tasks Completed</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalTasksDone}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><TrendingUp size={20} /></div>
            <span className="text-sm font-bold text-slate-500 uppercase">Habit Consistency</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {data.habitStats.length > 0 
              ? Math.round(data.habitStats.reduce((acc:number, h:any) => acc + h.rate, 0) / data.habitStats.length) + "%"
              : "0%"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Focus Time Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6">Daily Focus (Minutes)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
              <Tooltip 
                cursor={{fill: '#F1F5F9'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="focusMinutes" name="Minutes" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Completion Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6">Task Throughput</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" name="Completed" stroke="#10B981" strokeWidth={3} dot={{r: 4}} />
              <Line type="monotone" dataKey="total" name="Total Scheduled" stroke="#94A3B8" strokeWidth={2} dot={{r: 4}} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px]">
          <h3 className="font-bold text-slate-800 mb-4">Overall Task Status</h3>
          <div className="flex h-full">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={data.taskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.taskDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[40%] flex flex-col justify-center gap-3">
               {data.taskDistribution.map((entry: any, index: number) => (
                 <div key={index} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                   <span className="text-sm text-slate-600 font-medium">{entry.name}</span>
                   <span className="text-sm text-slate-400">({entry.value})</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Habit Performance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px] overflow-y-auto">
          <h3 className="font-bold text-slate-800 mb-6">Habit Adherence (7d)</h3>
          <div className="space-y-4">
            {data.habitStats.map((h: any) => (
              <div key={h.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{h.name}</span>
                  <span className="text-slate-500">{h.completed}/{h.total} days</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      h.rate >= 80 ? 'bg-emerald-500' : h.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} 
                    style={{ width: `${h.rate}%` }} 
                  />
                </div>
              </div>
            ))}
            {data.habitStats.length === 0 && <p className="text-slate-400 text-sm">No active habits found.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}