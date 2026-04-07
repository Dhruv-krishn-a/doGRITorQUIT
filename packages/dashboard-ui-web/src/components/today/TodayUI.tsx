// packages/dashboard-ui-web/src/components/today/TodayUI.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedToday, dashboardApi } from '@gritorquit/dashboard-core';
import { VitalityBar } from './VitalityBar';
import { PulsePanel } from './PulsePanel';
import { FocusOverlay } from './FocusOverlay';
import { QuickCapture } from './QuickCapture';
import { TodayTaskCard } from './TodayTaskCard';
import { TaskCard } from './TaskCard';
import { 
  Layout, 
  Calendar, 
  ListTodo, 
  Zap, 
  CalendarClock, 
  Briefcase, 
  BookOpen, 
  Youtube, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Bell,
  Clock3,
  PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';

type CategoryFilter = 'ALL' | 'PLANS' | 'YOUTUBE' | 'COURSES' | 'PROJECTS';

export default function TodayUI() {
  const { data, loading, error, refresh } = useUnifiedToday();
  const [activeTab, setActiveTab] = useState<'TODAY' | 'WEEK'>('TODAY');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [energyLevel, setEnergyLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [focusItem, setFocusItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekDay, setSelectedWeekDay] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskMinutes, setNewTaskMinutes] = useState('45');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [creatingTask, setCreatingTask] = useState(false);

  const ITEMS_PER_SECTION = 4;

  useEffect(() => {
    setMounted(true);
    setSelectedWeekDay(new Date().toISOString().split('T')[0]);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 't') setActiveTab('TODAY');
      if (e.key.toLowerCase() === 'w') setActiveTab('WEEK');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const weekDays = useMemo(() => {
    if (!data?.week?.bucketed) return [];
    return Object.keys(data.week.bucketed).sort();
  }, [data]);

  const selectedDayTasks = useMemo(() => {
    if (!data?.week?.bucketed || !selectedWeekDay) return [];
    return data.week.bucketed[selectedWeekDay] || [];
  }, [data, selectedWeekDay]);

  const plannerTasks = useMemo(() => {
    const raw = data?.sections?.tasks || [];
    return raw
      .filter((t: any) => t.status !== 'completed')
      .sort((a: any, b: any) => {
        const aTime = a?.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b?.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }, [data]);

  const groupedSections = useMemo(() => {
    if (!data?.sections) return [];
    
    let all = [...(data.sections.tasks || []), ...(data.sections.study || [])];
    
    if (categoryFilter !== 'ALL') {
      all = all.filter(item => {
        if (categoryFilter === 'PLANS') return item.type === 'TASK' && !item.trackId;
        if (categoryFilter === 'YOUTUBE') return item.type === 'VIDEO';
        if (categoryFilter === 'COURSES') return item.trackType === 'COURSE';
        if (categoryFilter === 'PROJECTS') return item.trackType === 'PROJECT';
        return true;
      });
    }

    const filtered = all.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.vectorName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const vectorGroups: Record<string, any[]> = {};
    filtered.forEach(item => {
        const groupKey = item.vectorName || 'General';
        if (!vectorGroups[groupKey]) vectorGroups[groupKey] = [];
        vectorGroups[groupKey].push(item);
    });

    return Object.entries(vectorGroups).map(([name, items]) => ({
        name,
        type: items[0].trackType || (items[0].type === 'TASK' ? 'PLAN' : 'STUDY'),
        items: items.sort((a, b) => {
            if (a.isOverdue && !b.isOverdue) return -1;
            if (energyLevel === 'LOW') return a.duration - b.duration;
            if (energyLevel === 'HIGH') return b.duration - a.duration;
            const priorityMap: any = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
        })
    })).sort((a, b) => {
        const order: any = { 'PROJECT': 1, 'COURSE': 2, 'VIDEO': 3, 'PLAN': 4 };
        return (order[a.type] || 5) - (order[b.type] || 5);
    });
  }, [data, searchQuery, categoryFilter, energyLevel]);

  const recommendedTask = useMemo(() => {
      if (!groupedSections.length) return null;
      const flatList = groupedSections.flatMap(g => g.items).filter(i => i.status !== 'DONE' && i.status !== 'completed');
      if (!flatList.length) return null;
      return flatList.sort((a, b) => {
          if (a.isOverdue && !b.isOverdue) return -1;
          if (energyLevel === 'LOW') return a.duration - b.duration;
          if (energyLevel === 'HIGH') return b.duration - a.duration;
          return 0;
      })[0];
  }, [groupedSections, energyLevel]);

  const toggleSection = (name: string) => {
    setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleStartSession = (id: string, type: string) => {
    const allItems = [...(data?.sections?.tasks || []), ...(data?.sections?.study || []), ...selectedDayTasks];
    const item = allItems.find((t:any) => t.id === id);
    if (item) setFocusItem(item);
  };

  const handleComplete = async (id: string, type: string, secondsSpent?: number) => {
     try {
        if (type === 'TASK') {
            await dashboardApi.completeTask(id);
        } else {
            await dashboardApi.completeStudyUnit(id, secondsSpent);
        }
        toast.success("Sync Complete");
        setFocusItem(null);
        refresh();
     } catch (err) { toast.error("Sync Error"); }
  };

  const handlePostpone = async (id: string, type: string) => {
      try {
          if (type === 'TASK') {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              await dashboardApi.postponeTask(id, tomorrow.toISOString());
          } else {
              await dashboardApi.postponeStudyUnit(id);
          }
          refresh();
      } catch (err) { toast.error("Reschedule failed"); }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
      try {
          await dashboardApi.toggleSubtask(subtaskId, completed);
          refresh();
      } catch (err) { toast.error("Update failed"); }
  };

  const handleCleanSweep = async () => {
      const overdueTasks = (data?.sections?.tasks || []).filter((t:any) => t.isOverdue);
      if (!overdueTasks.length) return;
      const promise = Promise.all(overdueTasks.map((t:any) => handlePostpone(t.id, t.type)));
      toast.promise(promise, { loading: 'Sweeping...', success: 'Cleared Overdue', error: 'Sweep error' });
  };

  const toggleHabit = async (habitId: string) => {
      try {
          await dashboardApi.toggleHabit(habitId);
          refresh();
      } catch (err) { toast.error("Habit sync error"); }
  };

  const handleQuickCapture = async (title: string, domain: string) => {
     try {
        if (domain === 'PLAN') {
            const data = await dashboardApi.getPlans();
            const plans = data.plans || [];
            if (plans && plans.length > 0) {
                await dashboardApi.quickCapturePlan(plans[0].id, title);
                toast.success(`Added to ${plans[0].title}`);
            }
        } else {
            const data = await dashboardApi.getStudyTracks();
            const tracks = data.tracks || [];
            const targetType = domain === 'PROJECT' ? 'PROJECT' : 'COURSE';
            const targetTrack = tracks.find((t: any) => t.type === targetType);
            if (targetTrack) {
                await dashboardApi.quickCaptureStudy(targetTrack.id, title, domain === 'PROJECT' ? 'FEATURE' : 'LESSON');
                toast.success(`Added to ${targetTrack.title}`);
            }
        }
        refresh();
     } catch (err) { toast.error("Capture error"); }
  };

  const handleCreateTodayTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const [hh, mm] = newTaskTime.split(':').map((v) => Number(v));
    const dueDate = new Date(`${newTaskDate}T00:00:00`);
    dueDate.setHours(Number.isFinite(hh) ? hh : 9, Number.isFinite(mm) ? mm : 0, 0, 0);
    try {
      setCreatingTask(true);
      await dashboardApi.createTask({
        title,
        date: new Date(`${newTaskDate}T00:00:00`).toISOString(),
        dueDate: dueDate.toISOString(),
        estimatedMinutes: Number.parseInt(newTaskMinutes, 10) || 45,
        priority: newTaskPriority,
        metadata: {
          todayPlanner: true,
          reminders: {
            beforeDay: true,
            onTime: true,
            repeatUntilDoneMinutes: 120,
          },
        },
      });
      setNewTaskTitle('');
      toast.success('Task scheduled');
      refresh();
    } catch (err) {
      toast.error('Failed to schedule task');
    } finally {
      setCreatingTask(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    // Tauri's permission model restricts browser Notification API on remote dev URLs.
    if ("__TAURI_INTERNALS__" in window) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if ("__TAURI_INTERNALS__" in window) return;
    if (Notification.permission !== 'granted') return;
    const timers: number[] = [];

    const now = Date.now();
    plannerTasks.slice(0, 8).forEach((task: any) => {
      if (!task?.dueDate) return;
      const target = new Date(task.dueDate).getTime();
      const leadMs = target - now;
      if (leadMs <= 0 || leadMs > 2 * 60 * 60 * 1000) return;
      timers.push(window.setTimeout(() => {
        new Notification('Upcoming task', { body: `${task.title} starts soon.` });
      }, leadMs));
    });

    const daySignals = [
      { hour: 8, minute: 0, title: 'Start strong', body: 'Set your first focus block for today.' },
      { hour: 18, minute: 0, title: 'Evening pulse', body: 'Review remaining tasks and close one more.' },
      { hour: 22, minute: 0, title: 'Night wrap', body: 'Mark done items and prep tomorrow schedule.' },
    ];
    daySignals.forEach((s) => {
      const trigger = new Date();
      trigger.setHours(s.hour, s.minute, 0, 0);
      const wait = trigger.getTime() - now;
      if (wait > 0 && wait < 12 * 60 * 60 * 1000) {
        timers.push(window.setTimeout(() => new Notification(s.title, { body: s.body }), wait));
      }
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [plannerTasks]);

  if (!mounted || (loading && !data)) return (
    <div className="transform-gpu flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="transform-gpu w-10 h-10 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
      <div className="transform-gpu text-[var(--accent-color)] font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Horizon...</div>
    </div>
  );

  if (error && !data) return (
    <div className="transform-gpu flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="transform-gpu p-6 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-full"><Layout size={40} /></div>
      <div><h3 className="transform-gpu text-xl font-bold text-[var(--text-primary)]">Neural Sync Failed</h3><p className="transform-gpu text-[var(--text-secondary)] font-bold mt-2">{error}</p></div>
      <button onClick={() => refresh()} className="transform-gpu px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-[var(--accent-color)]/20 hover:bg-[var(--accent-color)]/90 transition-all">Retry</button>
    </div>
  );

  if (!data) return null;

  return (
    <div className="transform-gpu flex flex-col w-full h-full relative text-[var(--text-primary)] font-sans selection:bg-[var(--accent-color)]/20 selection:text-[var(--text-primary)] pb-12">
      {/* Background Glow Wrapper - Prevents overflow without breaking sticky children */}
      <div className="transform-gpu absolute inset-0 overflow-hidden pointer-events-none -z-10 rounded-[3rem] transform-gpu">
        <motion.div 
          animate={{ 
              x: activeTab === 'TODAY' ? '0%' : '50%',
              backgroundColor: activeTab === 'TODAY' ? 'var(--accent-color)' : 'var(--accent-color)'
          }}
          style={{ opacity: 0.1 }}
          className="transform-gpu absolute top-0 left-1/2 w-[60rem] h-[60rem] rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 transition-colors duration-700 transform-gpu" 
        />
      </div>

      <VitalityBar stats={data.vitality} energyLevel={energyLevel} onEnergyChange={setEnergyLevel} />

      {/* Primers */}
      <div className="transform-gpu mb-10">
          <div className="transform-gpu flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 ml-4">
            <Sparkles size={14} className="transform-gpu text-[var(--accent-color)]" /> Neural Primers
          </div>
          <div className="transform-gpu flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
            {data.primers?.map((habit: any) => (
                <motion.button key={habit.id} whileTap={{ scale: 0.95 }} onClick={() => toggleHabit(habit.id)} className={`flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all duration-300 shadow-sm transform-gpu ${habit.completed ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/30'}`}>
                    <span className="transform-gpu text-lg">{habit.icon || '✨'}</span>
                    <span className="transform-gpu text-sm font-bold whitespace-nowrap">{habit.title}</span>
                    {habit.completed && <CheckCircle2 size={16} fill="currentColor" />}
                </motion.button>
            ))}
          </div>
      </div>

      <div className="transform-gpu flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="transform-gpu flex items-center gap-8">
            <button onClick={() => setActiveTab('TODAY')} className={`group relative py-2 flex items-center gap-3 transition-all ${activeTab === 'TODAY' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                <Layout size={18} /> <span className="transform-gpu text-sm font-bold uppercase tracking-[0.2em]">Today</span>
                {activeTab === 'TODAY' && <motion.div layoutId="nav-glow" className="transform-gpu absolute -bottom-1 left-0 right-0 h-1 bg-[var(--accent-color)] rounded-full shadow-[0_0_15px_rgba(var(--accent-color),0.6)] transform-gpu" />}
            </button>
            <button onClick={() => setActiveTab('WEEK')} className={`group relative py-2 flex items-center gap-3 transition-all ${activeTab === 'WEEK' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                <Calendar size={18} /> <span className="transform-gpu text-sm font-bold uppercase tracking-[0.2em]">This Week</span>
                {activeTab === 'WEEK' && <motion.div layoutId="nav-glow" className="transform-gpu absolute -bottom-1 left-0 right-0 h-1 bg-[var(--accent-color)] rounded-full shadow-[0_0_15px_rgba(var(--accent-color),0.6)] transform-gpu" />}
            </button>
        </div>

        <div className="transform-gpu flex items-center gap-2 p-1.5 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)]/50">
            {['ALL', 'PLANS', 'YOUTUBE', 'PROJECTS', 'COURSES'].map((cat) => (
                <button key={cat} onClick={() => setCategoryFilter(cat as CategoryFilter)} className={`px-4 py-2 rounded-xl text-[9px] font-semibold uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-[var(--bg-card)] text-[var(--accent-color)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{cat}</button>
            ))}
        </div>
      </div>

      <div className="transform-gpu flex flex-col xl:flex-row gap-10 xl:gap-14 items-start pb-20">
        <div className="transform-gpu flex-1 w-full space-y-12 min-w-0">
          <QuickCapture onCapture={handleQuickCapture} />

          {activeTab === 'WEEK' && (
            <div className="transform-gpu flex items-center gap-3 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
               {weekDays.map(dayStr => {
                  const date = new Date(dayStr);
                  const isSelected = selectedWeekDay === dayStr;
                  return (
                    <button key={dayStr} onClick={() => setSelectedWeekDay(dayStr)} className={`flex flex-col items-center min-w-[90px] p-5 rounded-[2rem] border transition-all duration-500 ${isSelected ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-[0_15px_30px_var(--accent-color)]/20 scale-105' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/30'}`}>
                        <span className="transform-gpu text-[10px] font-semibold uppercase tracking-widest mb-1.5 opacity-70">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="transform-gpu text-xl font-bold tracking-tighter">{date.getDate()}</span>
                    </button>
                  );
               })}
            </div>
          )}

          <div className="transform-gpu space-y-16">
            <AnimatePresence mode="popLayout">
                {activeTab === 'TODAY' ? (
                    groupedSections.length > 0 ? (
                        groupedSections.map((group, gIdx) => (
                            <motion.section key={group.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gIdx * 0.1 }} className="transform-gpu space-y-6 transform-gpu">
                                <div className="transform-gpu flex items-center justify-between px-2">
                                    <div className="transform-gpu flex items-center gap-4">
                                        <div className={`p-2.5 rounded-2xl text-[var(--bg-primary)] shadow-lg ${group.type === 'PROJECT' ? 'bg-emerald-500' : group.type === 'COURSE' ? 'bg-[var(--accent-color)]' : group.type === 'VIDEO' ? 'bg-[var(--accent-color)]' : 'bg-[var(--text-primary)]'}`}>
                                            {group.type === 'PROJECT' ? <Briefcase size={18} /> : group.type === 'COURSE' ? <BookOpen size={18} /> : group.type === 'VIDEO' ? <Youtube size={18} /> : <ListTodo size={18} />}
                                        </div>
                                        <div>
                                            <h2 className="transform-gpu text-xl font-bold text-[var(--text-primary)] tracking-tight uppercase leading-none">{group.name}</h2>
                                            <p className="transform-gpu text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest mt-1.5">{group.items.length} Vectors</p>
                                        </div>
                                    </div>
                                    <div className="transform-gpu flex items-center gap-3">
                                        <button onClick={() => handleStartSession(group.items[0].id, group.items[0].type)} className="transform-gpu flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-[var(--accent-color)] transition-all shadow-md"><Zap size={14} fill="currentColor" /> Focus Vector</button>
                                        {gIdx === 0 && (data?.sections?.tasks || []).some((t:any) => t.isOverdue) && (
                                            <button onClick={handleCleanSweep} className="transform-gpu flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"><CalendarClock size={14} /> Sweep Overdue</button>
                                        )}
                                    </div>
                                </div>
                                <div className="transform-gpu grid grid-cols-1 gap-4">
                                    {(expandedSections[group.name] ? group.items : group.items.slice(0, ITEMS_PER_SECTION)).map((item, idx) => (
                                        <TodayTaskCard key={item.id} item={item} index={idx} onStart={handleStartSession} onComplete={handleComplete} onPostpone={handlePostpone} onToggleSubtask={handleToggleSubtask} TaskCardComponent={TaskCard} />
                                    ))}
                                </div>
                                {group.items.length > ITEMS_PER_SECTION && (
                                    <div className="transform-gpu flex justify-center pt-2">
                                        <button 
                                            onClick={() => toggleSection(group.name)}
                                            className="transform-gpu px-6 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 hover:text-[var(--accent-color)] text-[var(--text-secondary)] rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            {expandedSections[group.name] ? <><ChevronUp size={12} /> Show Less</> : <><ChevronDown size={12} /> View All {group.items.length} Vectors</>}
                                        </button>
                                    </div>
                                )}
                            </motion.section>
                        ))
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="transform-gpu py-32 flex flex-col items-center justify-center text-center bg-[var(--bg-card)]/40 border-2 border-dashed border-[var(--accent-color)]/10 rounded-[4rem] shadow-inner transform-gpu">
                            <div className="transform-gpu relative mb-8">
                                <div className="transform-gpu absolute inset-0 bg-[var(--accent-color)]/20 rounded-full blur-[40px] opacity-20 animate-pulse" />
                                <div className="transform-gpu relative p-10 bg-[var(--bg-card)] rounded-full shadow-2xl shadow-[var(--accent-color)]/10"><Trophy size={64} className="transform-gpu text-[var(--accent-color)]" /></div>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="transform-gpu absolute -top-4 -right-4 p-4 bg-amber-100 text-amber-600 rounded-2xl shadow-lg border border-[var(--bg-card)] transform-gpu"><Sparkles size={24} /></motion.div>
                            </div>
                            <h3 className="transform-gpu text-3xl font-bold text-[var(--text-primary)] tracking-tighter uppercase mb-3">Neural Horizon Reached</h3>
                            <p className="transform-gpu text-[var(--text-secondary)] font-semibold max-w-sm mx-auto text-lg leading-relaxed">Daily execution cycle complete. Every objective has been synchronized.</p>
                            <button onClick={() => setActiveTab('WEEK')} className="transform-gpu mt-8 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[var(--accent-color)] transition-all shadow-xl shadow-[var(--bg-secondary)]">View Strategic Roadmap <ArrowUpRight size={16} /></button>
                        </motion.div>
                    )
                ) : (
                    selectedDayTasks.length > 0 ? (
                        <div className="transform-gpu grid grid-cols-1 gap-4">
                            {selectedDayTasks.map((item: any, idx: number) => (
                                <TodayTaskCard key={item.id} item={{ ...item, vectorName: item.plan?.title || 'Inbox' }} index={idx} onStart={handleStartSession} onComplete={handleComplete} onPostpone={handlePostpone} onToggleSubtask={handleToggleSubtask} TaskCardComponent={TaskCard} />
                            ))}
                        </div>
                    ) : (
                        <div className="transform-gpu py-24 flex flex-col items-center justify-center text-center bg-[var(--accent-color)]/5 border-2 border-dashed border-[var(--accent-color)]/10 rounded-[3rem]">
                            <div className="transform-gpu p-8 bg-[var(--accent-color)]/10 text-[var(--accent-color)]/40 rounded-full mb-6"><Calendar size={56} /></div>
                            <h3 className="transform-gpu text-xl font-bold text-[var(--text-primary)] tracking-tight">Open Horizon</h3>
                        </div>
                    )
                )}
            </AnimatePresence>
          </div>
        </div>

        <div className="transform-gpu w-full xl:w-[360px] 2xl:w-[400px] shrink-0 sticky top-10 space-y-4">
           <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 shadow-sm">
             <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Today Planner</h3>
                <Bell size={14} className="text-[var(--accent-color)]" />
             </div>
             <div className="space-y-2">
               <input
                 value={newTaskTitle}
                 onChange={(e) => setNewTaskTitle(e.target.value)}
                 placeholder="Add task (work, study, job...)"
                 className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-sm bg-transparent text-[var(--text-primary)]"
               />
               <div className="grid grid-cols-2 gap-2">
                 <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--border-color)] text-sm bg-transparent text-[var(--text-primary)]" />
                 <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--border-color)] text-sm bg-transparent text-[var(--text-primary)]" />
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <input type="number" min={5} max={480} value={newTaskMinutes} onChange={(e) => setNewTaskMinutes(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--border-color)] text-sm bg-transparent text-[var(--text-primary)]" />
                 <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} className="px-3 py-2 rounded-xl border border-[var(--border-color)] text-sm bg-transparent text-[var(--text-primary)]">
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                   <option value="urgent">Urgent</option>
                 </select>
               </div>
               <button onClick={handleCreateTodayTask} disabled={creatingTask} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-semibold uppercase tracking-wider disabled:opacity-60">
                 <PlusCircle size={14} /> {creatingTask ? 'Scheduling...' : 'Schedule Task'}
               </button>
             </div>
             <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-2">
               {plannerTasks.slice(0, 6).map((task: any) => (
                 <div key={task.id} className="flex items-center justify-between gap-2 px-2 py-2 rounded-xl bg-[var(--bg-secondary)]">
                   <div className="min-w-0">
                     <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{task.title}</p>
                     <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                       <Clock3 size={10} />
                       {task?.dueDate ? new Date(task.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No time'}
                     </p>
                   </div>
                   <button onClick={() => handleComplete(task.id, 'TASK')} className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                     Done
                   </button>
                 </div>
               ))}
               {plannerTasks.length === 0 && <p className="text-xs text-[var(--text-secondary)]">No scheduled tasks yet.</p>}
             </div>
           </section>
           <PulsePanel data={{ ...data.pulse, recommended: recommendedTask }} onStart={handleStartSession} />
        </div>
      </div>

      <AnimatePresence>
         {focusItem && <FocusOverlay item={focusItem} onClose={() => setFocusItem(null)} onComplete={handleComplete} />}
      </AnimatePresence>
    </div>
  );
}
