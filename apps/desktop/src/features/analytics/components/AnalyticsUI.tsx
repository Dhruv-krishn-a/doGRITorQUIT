import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Clock, CheckCircle2, TrendingUp, Calendar, 
  Filter, Youtube, Target, BookOpen, Brain, 
  ChevronDown, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useAnalyticsData, AnalyticsOptions } from '../hooks/useAnalyticsData';

const COLORS = ['var(--accent-color)', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const TIME_RANGES = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

const CATEGORIES = [
  { label: 'All', value: 'ALL', icon: Activity },
  { label: 'YouTube', value: 'YOUTUBE', icon: Youtube },
  { label: 'Plans', value: 'PLAN', icon: Target },
  { label: 'Courses', value: 'COURSE', icon: BookOpen },
  { label: 'Paths', value: 'PROJECT', icon: Brain },
];

export default function AnalyticsUI() {
  const [timeRange, setTimeRange] = useState(7);
  const [category, setCategory] = useState<AnalyticsOptions['category']>('ALL');

  const options = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (timeRange - 1));
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate, category };
  }, [timeRange, category]);

  const { data, loading, error } = useAnalyticsData(options);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-[var(--border-color)] mb-4" />
        <div className="h-4 w-48 bg-[var(--border-color)] rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center">
        <p className="text-rose-500 font-bold">Failed to load analytics</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{error}</p>
      </div>
    );
  }

  const totalFocus = data?.dailyStats?.reduce((acc: number, d: any) => acc + (d.focusMinutes || 0), 0) || 0;
  const totalTasks = data?.dailyStats?.reduce((acc: number, d: any) => acc + (d.completed || 0), 0) || 0;
  const avgHabitRate = data?.habitStats?.length > 0 
    ? Math.round(data.habitStats.reduce((acc: number, h: any) => acc + (h.rate || 0), 0) / data.habitStats.length) 
    : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--bg-card)]/50 p-4 rounded-[2rem] border border-[var(--border-color)] backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                category === cat.value
                  ? "bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              )}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] shadow-inner">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                timeRange === range.value
                  ? "bg-[var(--bg-card)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Focus Depth" 
          value={`${Math.floor(totalFocus / 60)}h ${totalFocus % 60}m`}
          subValue="Total Time Invested"
          icon={<Clock size={20} />}
          color="indigo"
        />
        <KPICard 
          title="Smart Output" 
          value={totalTasks}
          subValue="Completed Vectors"
          icon={<CheckCircle2 size={20} />}
          color="emerald"
        />
        <KPICard 
          title="System Sync" 
          value={`${avgHabitRate}%`}
          subValue="Habit Adherence"
          icon={<TrendingUp size={20} />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts */}
        <ChartContainer title="Pulse Velocity" subTitle="Daily Focus Minutes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700}} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--border-color)',
                  borderRadius: '1rem',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}
                cursor={{ fill: 'var(--hover-bg)', opacity: 0.4 }}
              />
              <Bar 
                dataKey="focusMinutes" 
                name="Focus" 
                fill="var(--accent-color)" 
                radius={[6, 6, 0, 0]} 
                barSize={24} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Task Momentum" subTitle="Completed vs Planned">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700}} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--border-color)',
                  borderRadius: '1rem',
                  fontSize: '12px',
                  color: 'var(--text-primary)'
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }} />
              <Line 
                type="monotone" 
                dataKey="completed" 
                name="Done" 
                stroke="#10b981" 
                strokeWidth={4} 
                dot={{r: 4, fill: '#10b981', strokeWidth: 0}} 
                activeDot={{r: 6, stroke: 'var(--bg-primary)', strokeWidth: 2}}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Target" 
                stroke="var(--text-secondary)" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Status Distribution */}
        <ChartContainer title="Vector State" subTitle="Task Status Distribution" className="h-80">
          <div className="flex h-full items-center">
            <div className="w-1/2 h-full relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.taskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {data?.taskDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                   <span className="block text-2xl font-black text-[var(--text-primary)] italic">
                     {data?.taskDistribution?.find((x: any) => x.name === 'completed')?.value || 0}
                   </span>
                   <span className="text-[8px] uppercase text-[var(--text-secondary)] font-black tracking-widest">Synced</span>
                 </div>
              </div>
            </div>
            
            <div className="w-1/2 pl-8 space-y-4">
               {data?.taskDistribution?.map((entry: any, index: number) => (
                 <div key={index} className="flex items-center justify-between group cursor-default">
                   <div className="flex items-center gap-3">
                     <div 
                       className="w-2.5 h-2.5 rounded-full shadow-sm" 
                       style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                     />
                     <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">{entry.name}</span>
                   </div>
                   <span className="text-xs font-black text-[var(--text-primary)] italic">{entry.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </ChartContainer>

        {/* Habit Adherence */}
        <ChartContainer title="Core Consistency" subTitle="Habit Array Adherence" className="h-80">
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            {data?.habitStats?.map((h: any) => (
              <div key={h.name} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">{h.name}</span>
                  <span className={cn(
                    "text-[10px] font-black italic px-2 py-0.5 rounded-lg",
                    h.rate >= 80 ? 'text-emerald-500 bg-emerald-500/10' : 
                    h.rate >= 50 ? 'text-amber-500 bg-amber-500/10' : 
                    'text-rose-500 bg-rose-500/10'
                  )}>
                    {h.rate}%
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] h-1.5 rounded-full overflow-hidden border border-[var(--border-color)]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${h.rate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full shadow-sm",
                      h.rate >= 80 ? 'bg-emerald-500' : h.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    )}
                  />
                </div>
              </div>
            ))}
            {(!data?.habitStats || data.habitStats.length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-30 italic py-10">
                <Activity size={32} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Array Empty</p>
              </div>
            )}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}

function KPICard({ title, value, subValue, icon, color }: { title: string, value: string | number, subValue: string, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-500 bg-indigo-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10'
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-[var(--bg-card)]/40 p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group"
    >
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", colorMap[color])}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-1">{title}</p>
      <h4 className="text-3xl font-black text-[var(--text-primary)] italic tracking-tighter uppercase">{value}</h4>
      <p className="text-[9px] font-bold text-[var(--text-secondary)]/50 uppercase tracking-widest mt-2 flex items-center gap-1">
        {subValue}
      </p>
      
      <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
         <ArrowUpRight size={16} className="text-[var(--text-secondary)]" />
      </div>
    </motion.div>
  );
}

function ChartContainer({ title, subTitle, children, className }: { title: string, subTitle: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-[var(--bg-card)]/30 p-8 rounded-[3rem] border border-[var(--border-color)] shadow-2xl h-[400px] flex flex-col relative overflow-hidden", className)}>
      <div className="mb-8">
        <h3 className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">{title}</h3>
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">{subTitle}</p>
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}
