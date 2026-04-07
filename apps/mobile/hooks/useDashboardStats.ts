import { useState, useEffect, useCallback } from 'react';
import { database } from '../db';
import HabitLog from '../db/models/HabitLog';
import StudyUnit from '../db/models/StudyUnit';
import { Q } from '@nozbe/watermelondb';

export function useDashboardStats() {
  const [streak, setStreak] = useState(0);
  const [focusTime, setFocusTime] = useState(0); // in minutes
  const [loading, setLoading] = useState(true);

  const calculateStats = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Calculate Streak
      const logs = await database.get<HabitLog>('habit_logs')
        .query(Q.sortBy('date', Q.desc))
        .fetch();
      
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      let checkDate = today;

      // Simple streak logic: check consecutive days with at least one habit logged
      const logDates = new Set(logs.map(l => new Date(l.date).toDateString()));
      
      while (logDates.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate = new Date(checkDate.setDate(checkDate.getDate() - 1));
      }
      setStreak(currentStreak);

      // 2. Calculate Focus Time (Done units * 25 mins)
      const doneUnits = await database.get<StudyUnit>('study_units')
        .query(Q.where('status', 'DONE'))
        .fetch();
      
      setFocusTime(doneUnits.length * 25);

    } catch (error) {
      console.error("Failed to calculate dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateStats();
    const habitSub = database.get('habit_logs').changes.subscribe(calculateStats);
    const unitSub = database.get('study_units').changes.subscribe(calculateStats);
    return () => {
      habitSub.unsubscribe();
      unitSub.unsubscribe();
    };
  }, [calculateStats]);

  return { streak, focusTime, loading };
}
