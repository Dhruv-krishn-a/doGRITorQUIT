import { useState, useEffect, useCallback } from 'react';
import { database } from '../db';
import Habit from '../db/models/Habit';
import HabitLog from '../db/models/HabitLog';
import { Q } from '@nozbe/watermelondb';
import { useAuth } from '../context/AuthContext';
import { performSyncOnce } from '../services/SyncServices';

export function useChecklist() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const syncInBackground = useCallback(() => {
    performSyncOnce().catch((error) => {
      console.warn('Checklist sync failed:', error);
    });
  }, []);

  const fetchChecklist = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      const endOfDayTime = todayTime + 24 * 60 * 60 * 1000 - 1;

      const activeHabits = await database.get<Habit>('habits')
        .query(Q.where('active', true), Q.where('user_id', user.id), Q.sortBy('order', Q.asc))
        .fetch();
      setHabits(activeHabits);

      const todayLogs = await database.get<HabitLog>('habit_logs')
        .query(Q.where('date', Q.between(todayTime, endOfDayTime)), Q.where('user_id', user.id))
        .fetch();
      setLogs(todayLogs);
    } catch (error) {
      console.error("Failed to fetch checklist:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchChecklist();
    const habitSub = database.get('habits').changes.subscribe(fetchChecklist);
    const logSub = database.get('habit_logs').changes.subscribe(fetchChecklist);
    return () => {
      habitSub.unsubscribe();
      logSub.unsubscribe();
    };
  }, [fetchChecklist]);

  const toggleHabit = async (habitId: string) => {
    if (!user?.id) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    await database.write(async () => {
      const existing = await database.get<HabitLog>('habit_logs')
        .query(Q.where('habit_id', habitId), Q.where('date', todayTime))
        .fetch();

      if (existing.length > 0) {
        for (const log of existing) {
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

    syncInBackground();
  };

  const createHabit = async (title: string, icon: string = 'ellipse-outline', color: string = '#6366f1') => {
    if (!user?.id) return;
    const createdHabit = await database.write(async () => {
      return await database.get<Habit>('habits').create(h => {
        h.title = title;
        h.icon = icon;
        h.color = color;
        h.active = true;
        h.order = habits.length;
        h.userId = user.id;
      });
    });

    syncInBackground();
    return createdHabit;
  };

  return {
    habits,
    logs,
    loading,
    toggleHabit,
    createHabit,
    refresh: fetchChecklist
  };
}
