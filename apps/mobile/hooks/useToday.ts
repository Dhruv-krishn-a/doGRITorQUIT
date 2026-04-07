import { useState, useEffect, useCallback, useMemo } from 'react';
import { database } from '../db';
import Task from '../db/models/Task';
import Habit from '../db/models/Habit';
import HabitLog from '../db/models/HabitLog';
import StudyTrack from '../db/models/StudyTrack';
import StudyUnit from '../db/models/StudyUnit';
import { TodayActionItem, TodayStats, EnergyLevel } from '../types/today';
import { Q } from '@nozbe/watermelondb';
import { useAuth } from '../context/AuthContext';
import { scheduleTaskReminderSeries, cancelTaskReminderSeries, scheduleTodayMotivationalReminders } from '../lib/notifications';

export function useToday() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [studyTracks, setStudyTracks] = useState<StudyTrack[]>([]);
  const [studyUnits, setStudyUnits] = useState<StudyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [energy, setEnergy] = useState<EnergyLevel>('MEDIUM');

  const refreshAll = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      const endOfDayTime = todayTime + 24 * 60 * 60 * 1000 - 1;

      // 1. Fetch Habits
      const activeHabits = await database.get<Habit>('habits')
        .query(Q.where('active', true), Q.where('user_id', user.id))
        .fetch();
      setHabits(activeHabits);

      // 2. Fetch Habit Logs for Today
      const logs = await database.get<HabitLog>('habit_logs')
        .query(Q.where('date', Q.between(todayTime, endOfDayTime)), Q.where('user_id', user.id))
        .fetch();
      setHabitLogs(logs);

      // 3. Fetch Tasks for Today
      const todayTasks = await database.get<Task>('tasks')
        .query(Q.where('date', Q.between(todayTime, endOfDayTime)), Q.where('user_id', user.id))
        .fetch();
      setTasks(todayTasks);

      // 4. Fetch Active Study Tracks
      const activeTracks = await database.get<StudyTrack>('study_tracks')
        .query(Q.where('status', 'ACTIVE'), Q.where('user_id', user.id))
        .fetch();
      setStudyTracks(activeTracks);

      // 5. Fetch Study Units
      const units = await database.get<StudyUnit>('study_units')
        .query(Q.where('status', Q.oneOf(['TODAY', 'IN_PROGRESS'])))
        .fetch();
      setStudyUnits(units);

    } catch (error) {
      console.error("Failed to fetch today's data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshAll();
    const taskSub = database.get('tasks').changes.subscribe(refreshAll);
    const habitSub = database.get('habits').changes.subscribe(refreshAll);
    const logSub = database.get('habit_logs').changes.subscribe(refreshAll);
    return () => {
      taskSub.unsubscribe();
      habitSub.unsubscribe();
      logSub.unsubscribe();
    };
  }, [refreshAll]);

  useEffect(() => {
    scheduleTodayMotivationalReminders().catch(() => {});
  }, []);

  const actionStream = useMemo(() => {
    const items: TodayActionItem[] = [];

    habits.forEach(h => {
      const isDone = habitLogs.some(l => l.habitId === h.id && l.completed);
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

    studyUnits.forEach(unit => {
      const parentTrack = studyTracks.find(t => t.id === unit.trackId);
      const trackType = parentTrack?.type === 'PLAYLIST' ? 'YOUTUBE' : 'COURSE';

      items.push({
        id: unit.id,
        type: trackType as any,
        title: unit.title,
        status: unit.status === 'DONE' ? 'DONE' : 'PENDING',
        priority: 'HIGH',
        energy: 'MEDIUM',
        metadata: { trackId: unit.trackId },
        order: unit.orderIndex
      });
    });

    tasks.forEach(task => {
      items.push({
        id: task.id,
        type: 'PROJECT',
        title: task.title,
        status: task.completed ? 'DONE' : 'PENDING',
        priority: (task.priority?.toUpperCase() as any) || 'MEDIUM',
        energy: 'HIGH',
        metadata: { planId: task.planId },
        order: 0
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
  }, [habits, habitLogs, tasks, studyUnits, energy]);

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

  const toggleHabit = async (habitId: string, completed: boolean) => {
    if (!user?.id) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    await database.write(async () => {
      if (completed) {
        const logs = await database.get<HabitLog>('habit_logs')
          .query(Q.where('habit_id', habitId), Q.where('date', todayTime))
          .fetch();
        for (const log of logs) {
          await log.destroyPermanently();
        }
      } else {
        await database.get<HabitLog>('habit_logs').create(log => {
          log.habitId = habitId;
          log.userId = user.id;
          log.date = todayTime;
          log.completed = true;
        });
      }
    });
  };

  const toggleTaskComplete = async (taskId: string, currentlyDone: boolean) => {
    const task = await database.get<Task>('tasks').find(taskId);
    await database.write(async () => {
      await task.update((t) => {
        t.completed = !currentlyDone;
        t.status = !currentlyDone ? 'completed' : 'pending';
      });
    });
    if (!currentlyDone) {
      await cancelTaskReminderSeries(taskId);
    }
  };

  const toggleUnitComplete = async (unitId: string, currentlyDone: boolean) => {
    const unit = await database.get<StudyUnit>('study_units').find(unitId);
    await database.write(async () => {
      await unit.update((u) => {
        u.status = currentlyDone ? 'TODAY' : 'DONE';
      });

      // Recalculate track progress
      const track = await database.get<StudyTrack>('study_tracks').find(unit.trackId);
      const allUnits = await database.get<StudyUnit>('study_units')
        .query(Q.where('track_id', track.id))
        .fetch();
      const doneUnits = allUnits.filter(u => u.status === 'DONE').length;
      await track.update(t => {
        t.progressPercentage = Math.round((doneUnits / allUnits.length) * 100);
      });
    });
  };

  const createScheduledTask = async (input: {
    title: string;
    date: string;
    time: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedMinutes: number;
  }) => {
    if (!user?.id) return null;
    const dayDate = new Date(`${input.date}T00:00:00`);
    const [hh, mm] = input.time.split(':').map((v) => Number(v));
    const dueDate = new Date(dayDate);
    dueDate.setHours(Number.isFinite(hh) ? hh : 9, Number.isFinite(mm) ? mm : 0, 0, 0);

    let created: Task | null = null;
    let createdId = '';
    let createdTitle = input.title;
    await database.write(async () => {
      created = await database.get<Task>('tasks').create((t: any) => {
        t.title = input.title;
        t.description = '';
        t.completed = false;
        t.status = 'pending';
        t.priority = input.priority;
        t.date = dayDate.getTime();
        t.dueDate = dueDate.getTime();
        t.planId = null;
        t.userId = user.id;
      });
      createdId = created.id;
      createdTitle = created.title;
    });

    if (createdId) {
      await scheduleTaskReminderSeries({
        id: createdId,
        title: createdTitle,
        dueDate,
        repeatUntilDoneMinutes: 120,
      });
    }

    await refreshAll();
    return created;
  };

  const plannerTasks = useMemo(() => {
    return tasks
      .filter((task) => !task.completed)
      .sort((a, b) => {
        const aDue = (a.dueDate as unknown as number) || Number.MAX_SAFE_INTEGER;
        const bDue = (b.dueDate as unknown as number) || Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      });
  }, [tasks]);

  return {
    actionStream,
    stats,
    loading,
    energy,
    setEnergy,
    refreshAll,
    toggleHabit,
    toggleTaskComplete,
    toggleUnitComplete,
    createScheduledTask,
    plannerTasks
  };
}
