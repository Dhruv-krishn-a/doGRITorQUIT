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
    setLoading(true);
    let hasData = habits.length > 0;
    try {
      // 1. Always load local data first
      let localData: HabitData | null = null;
      if (offlineStorage) {
        localData = await offlineStorage.getHabitData(start.toISOString(), end.toISOString());
        if (localData && localData.habits.length > 0) {
          setHabits(localData.habits);
          setLogs(localData.logs);
          setNotes(localData.notes);
          hasData = true;
        }
      }

      // 2. Fetch from server if online
      if (!isOffline) {
        const serverData = await habitsApi.getHabitData(start.toISOString(), end.toISOString());
        
        // 3. Smart Merge: Keep temp local logs that haven't synced yet
        setHabits(serverData.habits);
        setLogs(prev => {
          const tempLogs = prev.filter(l => l.id.startsWith('temp-'));
          // Filter out server logs that match temp logs by habitId and date
          const filteredServerLogs = serverData.logs.filter(sl => 
            !tempLogs.some(tl => tl.habitId === sl.habitId && new Date(tl.date).toDateString() === new Date(sl.date).toDateString())
          );
          const merged = [...filteredServerLogs, ...tempLogs];
          
          if (offlineStorage) {
            offlineStorage.saveHabitData({ ...serverData, logs: merged }).catch(console.error);
          }
          return merged;
        });
        
        setNotes(prev => {
          const tempNotes = prev.filter(n => n.id.startsWith('temp-'));
          const filteredServerNotes = serverData.notes.filter(sn =>
            !tempNotes.some(tn => new Date(tn.date).toDateString() === new Date(sn.date).toDateString())
          );
          return [...filteredServerNotes, ...tempNotes];
        });
        hasData = true;
      }
    } catch (err) {
      console.error('Failed to load habits:', err);
      if (!hasData) toast.error('Failed to load checklist data');
    } finally {
      setLoading(false);
    }
  }, [isOffline, offlineStorage, habits.length]);

  const toggleHabit = useCallback(async (habitId: string, date: Date, currentStatus: boolean) => {
    const dateStr = date.toISOString();
    const completed = !currentStatus;
    const tempId = `temp-${Date.now()}`;
    
    // 1. Optimistic Update
    setLogs(prev => {
      if (currentStatus) {
        return prev.filter(l => !(l.habitId === habitId && new Date(l.date).toDateString() === date.toDateString()));
      } else {
        return [...prev, { id: tempId, habitId, date: dateStr, completed: true }];
      }
    });

    try {
      // 2. Immediate Local Persistence
      if (offlineStorage) {
        if (!completed) {
          await offlineStorage.deleteHabitLog(habitId, dateStr);
        } else {
          await offlineStorage.saveHabitLog({ id: tempId, habitId, date: dateStr, completed: true });
        }
      }

      // 3. Background Server Sync
      if (!isOffline) {
        try {
          await habitsApi.toggleHabitLog(habitId, dateStr, completed);
          return; // Success
        } catch (err) {
          console.warn('Direct habit sync failed, falling back to queue', err);
        }
      }
      
      if (offlineStorage) {
        await offlineStorage.queueAction('TOGGLE_HABIT', { habitId, date: dateStr, completed });
        if (isOffline) toast.success("Action queued (offline)");
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      toast.error('Failed to update habit');
    }
  }, [isOffline, offlineStorage]);

  const saveNote = useCallback(async (date: Date, content: string) => {
    const dateStr = date.toISOString();
    // Update local state immediately
    let newNote: DailyNote = { id: 'temp-' + Date.now(), date: dateStr, content };
    
    setNotes(prev => {
        const existing = prev.find(n => new Date(n.date).toDateString() === date.toDateString());
        if (existing) {
          newNote = { ...existing, content };
          return prev.map(n => new Date(n.date).toDateString() === date.toDateString() ? newNote : n);
        } else {
          return [...prev, newNote];
        }
    });

    try {
      if (offlineStorage) {
        await offlineStorage.saveDailyNote(newNote);
      }

      if (!isOffline) {
        try {
          await habitsApi.saveDailyNote(dateStr, content);
          return; // Success
        } catch (err) {
          console.warn('Direct note sync failed, falling back to queue', err);
        }
      }

      if (offlineStorage) {
        await offlineStorage.queueAction('SAVE_NOTE', { date: dateStr, content });
        if (isOffline) toast.success("Note saved locally");
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
