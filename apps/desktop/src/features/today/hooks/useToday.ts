import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStudy } from '@gritorquit/study-core';
import { useHabitsContext } from '@gritorquit/habits-core';
import { dashboardApi } from '@gritorquit/dashboard-core';
import { TodayActionItem, TodayStats } from '../types';
import { getDb } from '../../../lib/db';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useToday() {
  const navigate = useNavigate();
  const { 
    activeTrack, fetchTrack, completeUnit, moveUnit, 
    tracks: studyTracks, fetchDashboard 
  } = useStudy();
  
  const { habits, logs, toggleHabit, refreshData: refreshHabits } = useHabitsContext();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [energy, setEnergy] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  // Mission State
  const [missionActive, setMissionActive] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Refresh Habits
      const start = new Date();
      start.setHours(0,0,0,0);
      const end = new Date();
      end.setHours(23,59,59,999);
      
      await Promise.all([
        refreshHabits(start, end),
        fetchDashboard(),
        (async () => {
          const [plansRes, tasksRes] = await Promise.all([
            dashboardApi.getPlans(),
            dashboardApi.getTasks().catch(() => []),
          ]);
          const plansWithInbox = [...(plansRes.plans || [])];
          plansWithInbox.push({ id: 'inbox', title: 'Today GritOrQuit', tasks: tasksRes.filter((t: any) => !t.planId) });
          setPlans(plansWithInbox);
        })()
      ]);
    } catch (error) {
      console.error("Today data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshHabits, fetchDashboard]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if ("__TAURI_INTERNALS__" in window) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    refreshAll();
    
    async function loadSettings() {
      const db = await getDb();
      if (!db) return;
      const rows = await db.select<any[]>("SELECT * FROM today_settings WHERE id = 1");
      if (rows.length > 0) {
        setFocusMode(!!rows[0].focusMode);
        setMissionActive(!!rows[0].missionActive);
        setCurrentItemId(rows[0].currentItemId);
      }
    }
    loadSettings();
  }, [refreshAll]);

  const saveSettings = async (updates: any) => {
    const db = await getDb();
    if (!db) return;
    
    const rows = await db.select<any[]>("SELECT * FROM today_settings WHERE id = 1");
    const current = rows[0] || { focusMode: 0, missionActive: 0, currentItemId: null, currentItemType: null };
    
    const next = { ...current, ...updates, lastUpdated: new Date().toISOString() };
    
    await db.execute(
      `INSERT OR REPLACE INTO today_settings 
      (id, focusMode, missionActive, currentItemId, currentItemType, lastUpdated) 
      VALUES (1, ?, ?, ?, ?, ?)`,
      [next.focusMode, next.missionActive, next.currentItemId, next.currentItemType, next.lastUpdated]
    );
  };

  const toggleFocusMode = async () => {
    const newVal = !focusMode;
    setFocusMode(newVal);
    await saveSettings({ focusMode: newVal ? 1 : 0 });
    if (newVal) toast.success("Focus Mode Active");
  };

  const actionStream = useMemo(() => {
    const items: TodayActionItem[] = [];
    const todayStr = new Date().toDateString();

    habits.forEach(h => {
      const isDone = logs.some(l => l.habitId === h.id && new Date(l.date).toDateString() === todayStr && l.completed);
      items.push({
        id: h.id,
        type: 'HABIT',
        title: h.title,
        status: isDone ? 'DONE' : 'PENDING',
        priority: 'MEDIUM',
        energy: 'LOW',
        metadata: { icon: h.icon, color: h.color },
        order: h.order
      });
    });

    studyTracks.forEach(track => {
      track.units?.filter(u => u.status === 'TODAY' || u.status === 'IN_PROGRESS').forEach(unit => {
        items.push({
          id: unit.id,
          type: track.type === 'PLAYLIST' ? 'YOUTUBE' : 'COURSE',
          title: unit.title,
          status: unit.status === 'DONE' || unit.status === 'COMPLETED' ? 'DONE' : 'PENDING',
          priority: 'HIGH',
          energy: 'MEDIUM',
          metadata: { ...unit, trackId: track.id, trackTitle: track.title },
          order: unit.orderIndex || 0
        });
      });
    });

    plans.forEach(plan => {
      plan.tasks?.filter((t: any) => new Date(t.date).toDateString() === todayStr).forEach((task: any) => {
        items.push({
          id: task.id,
          type: 'PROJECT',
          title: task.title,
          status: task.status === 'completed' ? 'DONE' : 'PENDING',
          priority: task.priority?.toUpperCase() || 'MEDIUM',
          energy: 'HIGH',
          metadata: { ...task, planId: plan.id, planTitle: plan.title },
          order: 0
        });
      });
    });

    return items.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'PENDING' ? -1 : 1;
      const energyMap = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
      const aE = energyMap[a.energy];
      const bE = energyMap[b.energy];
      if (energy === 'LOW') return aE - bE;
      return bE - aE;
    });
  }, [habits, logs, studyTracks, plans, energy]);

  const currentItem = useMemo(() => {
    if (!missionActive || !currentItemId) return null;
    return actionStream.find(i => i.id === currentItemId) || null;
  }, [actionStream, missionActive, currentItemId]);

  const startMission = async () => {
    const firstPending = actionStream.find(i => i.status === 'PENDING');
    if (!firstPending) {
      toast.info("No pending tasks to start mission");
      return;
    }
    setMissionActive(true);
    setCurrentItemId(firstPending.id);
    await saveSettings({ missionActive: 1, currentItemId: firstPending.id, currentItemType: firstPending.type });
    
    // Auto-navigate if it's a study task
    if (firstPending.type === 'YOUTUBE') {
      navigate(`/study/youtube/${firstPending.metadata.trackId}/unit/${firstPending.id}`);
    } else if (firstPending.type === 'COURSE') {
      navigate(`/study/course/${firstPending.metadata.trackId}/unit/${firstPending.id}`);
    }
    
    toast.success("Mission Autopilot Engaged");
  };

  const abortMission = async () => {
    setMissionActive(false);
    setCurrentItemId(null);
    await saveSettings({ missionActive: 0, currentItemId: null, currentItemType: null });
    toast.info("Mission Aborted");
  };

  const completeAndNext = async () => {
    if (!currentItem) return;

    // 1. Mark current as done
    if (currentItem.type === 'HABIT') {
      await toggleHabit(currentItem.id, new Date(), false);
    } else if (currentItem.type === 'YOUTUBE' || currentItem.type === 'COURSE') {
      await dashboardApi.completeStudyUnit(currentItem.id);
    } else if (currentItem.type === 'PROJECT') {
      await dashboardApi.completeTask(currentItem.id);
    }

    // 2. Transition
    setIsTransitioning(true);
    
    // Find next
    const nextItem = actionStream.find(i => i.status === 'PENDING' && i.id !== currentItem.id);
    
    if (!nextItem) {
      setMissionActive(false);
      setCurrentItemId(null);
      await saveSettings({ missionActive: 0, currentItemId: null });
      toast.success("All daily vectors executed. Mission Complete.");
      setIsTransitioning(false);
      navigate('/study');
    } else {
      setTimeout(async () => {
        setCurrentItemId(nextItem.id);
        await saveSettings({ currentItemId: nextItem.id, currentItemType: nextItem.type });
        setIsTransitioning(false);
        
        // Auto-navigate to next
        if (nextItem.type === 'YOUTUBE') {
          navigate(`/study/youtube/${nextItem.metadata.trackId}/unit/${nextItem.id}`);
        } else if (nextItem.type === 'COURSE') {
          navigate(`/study/course/${nextItem.metadata.trackId}/unit/${nextItem.id}`);
        }
      }, 5000);
    }
  };

  const stats = useMemo<TodayStats>(() => {
    const total = actionStream.length;
    const done = actionStream.filter(i => i.status === 'DONE').length;
    const pending = total - done;
    const avgMinsPerTask = 25;
    const finishDate = new Date();
    finishDate.setMinutes(finishDate.getMinutes() + (pending * avgMinsPerTask));

    return {
      momentum: total > 0 ? Math.round((done / total) * 100) : 0,
      completedCount: done,
      totalCount: total,
      estimatedFinishTime: finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }, [actionStream]);

  const plannerTasks = useMemo(() => {
    return actionStream
      .filter((i) => i.type === 'PROJECT' && i.status === 'PENDING')
      .sort((a, b) => {
        const aTime = a.metadata?.dueDate ? new Date(a.metadata.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.metadata?.dueDate ? new Date(b.metadata.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }, [actionStream]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const now = Date.now();
    const timers: number[] = [];

    plannerTasks.slice(0, 6).forEach((task) => {
      const target = task.metadata?.dueDate ? new Date(task.metadata.dueDate).getTime() : null;
      if (!target) return;
      const wait = target - now;
      if (wait > 0 && wait <= 2 * 60 * 60 * 1000) {
        timers.push(window.setTimeout(() => {
          new Notification('Upcoming task', { body: `${task.title} starts soon.` });
        }, wait));
      }
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [plannerTasks]);

  const createScheduledTask = async (input: {
    title: string;
    date: string;
    time: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedMinutes: number;
  }) => {
    const [hh, mm] = input.time.split(':').map((v) => Number(v));
    const dueDate = new Date(`${input.date}T00:00:00`);
    dueDate.setHours(Number.isFinite(hh) ? hh : 9, Number.isFinite(mm) ? mm : 0, 0, 0);

    try {
      setCreatingTask(true);
      await dashboardApi.createTask({
        title: input.title,
        date: new Date(`${input.date}T00:00:00`).toISOString(),
        dueDate: dueDate.toISOString(),
        priority: input.priority,
        estimatedMinutes: input.estimatedMinutes,
        metadata: {
          todayPlanner: true,
          reminders: {
            beforeDay: true,
            onTime: true,
            repeatUntilDoneMinutes: 120,
          },
        },
      });
      toast.success('Task scheduled');
      await refreshAll();
    } catch (error) {
      toast.error('Could not schedule task');
    } finally {
      setCreatingTask(false);
    }
  };

  return {
    actionStream,
    currentItem,
    missionActive,
    isTransitioning,
    startMission,
    abortMission,
    completeAndNext,
    stats,
    loading,
    focusMode,
    toggleFocusMode,
    energy,
    setEnergy,
    refreshAll,
    toggleHabit,
    plannerTasks,
    createScheduledTask,
    creatingTask
  };
}
