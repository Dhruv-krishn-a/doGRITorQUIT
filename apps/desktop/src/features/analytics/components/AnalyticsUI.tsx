import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Clock, CheckCircle2, TrendingUp, Calendar, 
  Youtube, Target, BookOpen, Brain, Activity, ArrowUpRight, Loader2, Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useAnalyticsData, AnalyticsOptions } from '../hooks/useAnalyticsData';

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
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center animate-pulse">
                <Activity size={32} className="text-[var(--accent-color)]" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)]">Analyzing your progress...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center mx-4 my-10">
        <p className="text-rose-500 font-bold uppercase tracking-widest text-xs italic">Sync Failure</p>
        <p className="text-sm text-[var(--text-secondary)] mt-2 opacity-60 uppercase font-bold">{error}</p>
      </div>
    );
  }

  const totalFocus = data?.dailyStats?.reduce((acc: number, d: any) => acc + (d.focusMinutes || 0), 0) || 0;
  const totalTasks = data?.dailyStats?.reduce((acc: number, d: any) => acc + (d.completed || 0), 0) || 0;
  const avgHabitRate = data?.habitStats?.length > 0 
    ? Math.round(data.habitStats.reduce((acc: number, h: any) => acc + (h.rate || 0), 0) / data.habitStats.length) 
    : 0;

  return (
    <div className="space-y-8 md:space-y-10 pb-16 animate-in fade-in duration-700">
      {/* Personalized Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-card)]/50 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-[var(--border-color)] backdrop-blur-3xl shadow-2xl relative z-20">
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value as any)}
              disabled={loading}
              className={cn(
                "flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-transparent",
                category === cat.value
                  ? "bg-[var(--accent-color)] text-white shadow-xl shadow-[var(--accent-color)]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <cat.icon size={14} className="md:w-4 md:h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] p-1 rounded-lg md:rounded-xl border border-[var(--border-color)] shadow-inner">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              disabled={loading}
              className={cn(
                "px-4 md:px-5 py-1.5 md:py-2 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-tighter transition-all",
                timeRange === range.value
                  ? "bg-[var(--bg-card)] text-[var(--accent-color)] shadow-md border border-[var(--border-color)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={`${category}-${timeRange}-${loading}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: loading ? 0.5 : 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 md:space-y-10"
        >
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            <KPICard 
              title="Time Well Spent" 
              value={`${Math.floor(totalFocus / 60)}h ${totalFocus % 60}m`}
              subValue="Your focused dedication"
              icon={<Clock size={20} className="md:w-6 md:h-6" />}
              color="indigo"
            />
            <KPICard 
              title="Actions Finished" 
              value={totalTasks}
              subValue="Milestones reached"
              icon={<CheckCircle2 size={20} className="md:w-6 md:h-6" />}
              color="emerald"
            />
            <KPICard 
              title="Your Sticking Power" 
              value={`${avgHabitRate}%`}
              subValue="Consistency rate"
              icon={<TrendingUp size={20} className="md:w-6 md:h-6" />}
              color="amber"
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
            {/* Charts */}
            <ChartContainer title="Your Momentum" subTitle="Activity over time">
              <ResponsiveContainer width="99%" height="100%" minHeight={1}>
                <BarChart data={data?.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 800}} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 800}} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '1.5rem', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} cursor={{ fill: 'var(--hover-bg)', opacity: 0.3 }} />
                  <Bar dataKey="focusMinutes" name="Minutes" fill="var(--accent-color)" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Progress Flow" subTitle="Goals vs targets">
              <ResponsiveContainer width="99%" height="100%" minHeight={1}>
                <LineChart data={data?.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 800}} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 800}} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '1.5rem', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.6 }} />
                  <Line type="monotone" dataKey="completed" name="Done" stroke="#10b981" strokeWidth={5} dot={{r: 6, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 8, stroke: 'var(--bg-primary)', strokeWidth: 3}} />
                  <Line type="monotone" dataKey="total" name="Plan" stroke="var(--text-secondary)" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Distribution */}
            <ChartContainer title="Where Energy Goes" subTitle="Distribution of actions" className="min-h-[450px] h-auto">
              <div className="flex flex-col md:flex-row h-full items-center">
                <div className="w-full md:w-1/2 h-64 md:h-full relative">
                   <ResponsiveContainer width="99%" height="100%" minHeight={1}>
                    <PieChart>
                      <Pie data={data?.taskDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="value" stroke="none">
                        {data?.taskDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="text-center">
                       <span className="block text-3xl md:text-4xl font-black text-[var(--text-primary)] italic">
                         {data?.taskDistribution?.find((x: any) => x.name === 'completed')?.value || 0}
                       </span>
                       <span className="text-[10px] uppercase text-[var(--text-secondary)] font-black tracking-widest opacity-50">Finished</span>
                     </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 pl-0 md:pl-8 space-y-4 md:space-y-6 mt-6 md:mt-0">
                   {data?.taskDistribution?.map((entry: any, index: number) => (
                     <div key={index} className="flex items-center justify-between group cursor-default px-4 md:px-0 text-left">
                       <div className="flex items-center gap-4">
                         <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                         <span className="text-[10px] md:text-[11px] text-[var(--text-secondary)] font-black uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">{entry.name}</span>
                       </div>
                       <span className="text-xs md:text-sm font-black text-[var(--text-primary)] italic">{entry.value}</span>
                     </div>
                   ))}
                </div>
              </div>
            </ChartContainer>

            {/* Consistency */}
            <ChartContainer title="Consistency Streak" subTitle="Success over time" className="min-h-[450px] h-auto">
              <div className="flex-1 overflow-y-auto pr-2 md:pr-4 space-y-6 md:space-y-8 custom-scrollbar">
                {data?.habitStats?.map((h: any) => (
                  <div key={h.name} className="group px-2 md:px-0">
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                      <span className="text-[10px] md:text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">{h.name}</span>
                      <span className={cn("text-[9px] md:text-[10px] font-black italic px-3 py-0.5 md:py-1 rounded-xl", h.rate >= 80 ? 'text-emerald-500 bg-emerald-500/10' : h.rate >= 50 ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10')}>{h.rate}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-secondary)] h-1.5 md:h-2 rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${h.rate}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className={cn("h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", h.rate >= 80 ? 'bg-emerald-500' : h.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500')} />
                    </div>
                  </div>
                ))}
                {(!data?.habitStats || data.habitStats.length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-20 italic py-20">
                    <Activity size={48} className="mb-6" />
                    <p className="text-[11px] font-black uppercase tracking-[0.3em]">No streaks yet</p>
                  </div>
                )}
              </div>
            </ChartContainer>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function KPICard({ title, value, subValue, icon, color, className }: { title: string, value: string | number, subValue: string, icon: React.ReactNode, color: string, className?: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  };

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }} 
      className={cn(
        "bg-[var(--bg-card)]/40 p-8 md:p-10 rounded-2xl md:rounded-[3rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden group transition-all text-left",
        className
      )}
    >
      <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-[1.5rem] border flex items-center justify-center mb-6 md:mb-8 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg", colorMap[color])}>
        {icon}
      </div>
      <p className="text-[10px] md:text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-1.5 md:mb-2 opacity-60">{title}</p>
      <h4 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] italic tracking-tighter uppercase leading-none">{value}</h4>
      <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)]/40 uppercase tracking-widest mt-3 md:mt-4 flex items-center gap-2">{subValue}</p>
      <div className="absolute top-4 md:top-6 right-6 md:right-8 opacity-0 group-hover:opacity-40 transition-opacity">
         <ArrowUpRight size={18} className="md:w-5 md:h-5 text-[var(--text-secondary)]" />
      </div>
    </motion.div>
  );
}

function ChartContainer({ title, subTitle, children, className }: { title: string, subTitle: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-[var(--bg-card)]/30 p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-[var(--border-color)] shadow-[0_30px_60px_rgba(0,0,0,0.2)] h-[400px] md:h-[450px] flex flex-col relative overflow-hidden", className)}>
      <div className="mb-6 md:mb-10 text-left">
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none">{title}</h3>
        <p className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-2 md:mt-3 opacity-50">{subTitle}</p>
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}
