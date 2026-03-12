// packages/habits-core/src/context/HabitsContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Habit, HabitLog, DailyNote, HabitData, HabitsOfflineStorage } from '../types';
import { habitsApi } from '../apis/habitsApi';
import { toast } from 'sonner';

interface HabitsContextType {
  habits: Habit[];
  logs: HabitLog[];
  notes: DailyNote[];
  loading: boolean;
  refreshData: (start: Date, end: Date) => Promise<void>;
  toggleHabit: (habitId: string, date: Date, currentStatus: boolean) => Promise<void>;
  saveNote: (date: Date, content: string) => Promise<void>;
  createHabit: (title: string, icon: string, color: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  setInitialData: (data: HabitData) => void;
  isOffline: boolean;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider: React.FC<{ children: React.ReactNode, offlineStorage?: HabitsOfflineStorage }> = ({ children, offlineStorage }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(false);

  const isOffline = useMemo(() => offlineStorage?.isOffline() ?? false, [offlineStorage]);

  const setInitialData = useCallback((data: HabitData) => {
    setHabits(data.habits);
    setLogs(data.logs);
    setNotes(data.notes);
    
    // If we have initial data (from server), sync it to local storage if available
    if (offlineStorage && !isOffline) {
        offlineStorage.saveHabitData(data).catch(console.error);
    }
  }, [offlineStorage, isOffline]);

  const refreshData = useCallback(async (start: Date, end: Date) => {
    // 1. Try local cache first for instant load
    if (offlineStorage) {
      try {
        const local = await offlineStorage.getHabitData(start.toISOString(), end.toISOString());
        if (local && local.habits.length > 0) {
          setHabits(local.habits);
          setLogs(local.logs);
          setNotes(local.notes);
        }
      } catch (e) {
        console.warn("Habits cache read error:", e);
      }
    }

    setLoading(true);
    try {
      if (isOffline && offlineStorage) {
        const data = await offlineStorage.getHabitData(start.toISOString(), end.toISOString());
        setHabits(data.habits);
        setLogs(data.logs);
        setNotes(data.notes);
      } else {
        const data = await habitsApi.getHabitData(start.toISOString(), end.toISOString());
        setHabits(data.habits);
        setLogs(data.logs);
        setNotes(data.notes);
        
        if (offlineStorage) {
            offlineStorage.saveHabitData(data).catch(console.error);
        }
      }
    } catch (err) {
      console.error('Failed to load habits:', err);
      // Only error toast if we have no data at all
      setHabits(prev => {
        if (prev.length === 0) toast.error('Failed to load checklist data');
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }, [isOffline, offlineStorage]);

  const toggleHabit = useCallback(async (habitId: string, date: Date, currentStatus: boolean) => {
    const dateStr = date.toISOString();
    
    // Optimistic Update
    setLogs(prev => {
      if (currentStatus) {
        return prev.filter(l => !(l.habitId === habitId && new Date(l.date).toDateString() === date.toDateString()));
      } else {
        return [...prev, { id: 'temp-' + Date.now(), habitId, date: dateStr, completed: true }];
      }
    });

    try {
      if (isOffline && offlineStorage) {
        await offlineStorage.queueAction('TOGGLE_HABIT', { habitId, date: dateStr, completed: !currentStatus });
      } else {
        await habitsApi.toggleHabitLog(habitId, dateStr, !currentStatus);
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      toast.error('Failed to update habit');
    }
  }, [isOffline, offlineStorage]);

  const saveNote = useCallback(async (date: Date, content: string) => {
    const dateStr = date.toISOString();
    // Update local state immediately
    setNotes(prev => {
        const existing = prev.find(n => new Date(n.date).toDateString() === date.toDateString());
        if (existing) {
          return prev.map(n => new Date(n.date).toDateString() === date.toDateString() ? { ...n, content } : n);
        } else {
          return [...prev, { id: 'temp-' + Date.now(), date: dateStr, content }];
        }
    });

    try {
      if (isOffline && offlineStorage) {
        await offlineStorage.queueAction('SAVE_NOTE', { date: dateStr, content });
      } else {
        await habitsApi.saveDailyNote(dateStr, content);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      toast.error('Failed to save note');
    }
  }, [isOffline, offlineStorage]);

  const handleCreateHabit = useCallback(async (title: string, icon: string, color: string) => {
    try {
      if (isOffline && offlineStorage) {
         // Create habits is trickier offline if they need server IDs
         // For now let's say they're not supported or queue them
         await offlineStorage.queueAction('CREATE_HABIT', { title, icon, color });
         toast.info('Habit creation queued for sync');
      } else {
        const newHabit = await habitsApi.createHabit({ title, icon, color });
        setHabits(prev => [...prev, newHabit]);
        toast.success('Habit created!');
      }
    } catch (err) {
      console.error('Failed to create habit:', err);
      toast.error('Failed to create habit');
    }
  }, [isOffline, offlineStorage]);

  const handleDeleteHabit = useCallback(async (habitId: string) => {
    try {
      if (isOffline && offlineStorage) {
        await offlineStorage.queueAction('DELETE_HABIT', { habitId });
        setHabits(prev => prev.filter(h => h.id !== habitId));
        toast.info('Habit deletion queued for sync');
      } else {
        await habitsApi.deleteHabit(habitId);
        setHabits(prev => prev.filter(h => h.id !== habitId));
        toast.success('Habit deleted');
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
      toast.error('Failed to delete habit');
    }
  }, [isOffline, offlineStorage]);

  const value = useMemo(() => ({
    habits,
    logs,
    notes,
    loading,
    refreshData,
    toggleHabit,
    saveNote,
    createHabit: handleCreateHabit,
    deleteHabit: handleDeleteHabit,
    setInitialData,
    isOffline
  }), [habits, logs, notes, loading, refreshData, toggleHabit, saveNote, handleCreateHabit, handleDeleteHabit, setInitialData, isOffline]);

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
};

export const useHabitsContext = () => {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabitsContext must be used within a HabitsProvider');
  }
  return context;
};
