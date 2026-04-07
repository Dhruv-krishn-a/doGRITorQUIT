// packages/habits-core/src/apis/habitsApi.ts
import { apiClient } from '../lib/apiClient';
import { Habit, HabitLog, DailyNote, HabitData } from '../types';

export const habitsApi = {
  getHabitData: (start: string, end: string) => 
    apiClient<HabitData>(`/api/habits?start=${start}&end=${end}`),
  
  createHabit: (data: { title: string; icon: string; color: string }) =>
    apiClient<Habit>('/api/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deleteHabit: (habitId: string) => 
    apiClient(`/api/habits/${habitId}`, { method: 'DELETE' }),

  toggleHabitLog: (habitId: string, date: string, completed: boolean) =>
    apiClient(`/api/habits/${habitId}/log`, {
      method: 'POST',
      body: JSON.stringify({ date, completed }),
    }),

  saveDailyNote: (date: string, content: string) =>
    apiClient('/api/daily-notes', {
      method: 'POST',
      body: JSON.stringify({ date, content }),
    }),
};
