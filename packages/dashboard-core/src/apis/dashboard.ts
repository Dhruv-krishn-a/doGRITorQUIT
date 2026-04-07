// packages/dashboard-core/src/apis/dashboard.ts
import { apiClient } from '../lib/apiClient';

export const dashboardApi = {
  completeTask: async (id: string) => {
    return apiClient(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' })
    });
  },

  completeStudyUnit: async (id: string, secondsSpent?: number) => {
    return apiClient(`/api/study/units/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ 
        watchPercentage: 100,
        minutesSpent: Math.ceil((secondsSpent || 0) / 60),
        confidence: 5,
        difficulty: 3,
        takeaways: []
      })
    });
  },

  postponeTask: async (id: string, date: string) => {
    return apiClient(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ date })
    });
  },

  updateTask: async (id: string, updates: Record<string, unknown>) => {
    return apiClient(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  createTask: async (payload: {
    title: string;
    date: string;
    dueDate?: string | null;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedMinutes?: number;
    metadata?: Record<string, unknown>;
    planId?: string | null;
  }) => {
    return apiClient('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteTask: async (id: string) => {
    return apiClient(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  postponeStudyUnit: async (id: string) => {
    return apiClient(`/api/study/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'THIS_WEEK' })
    });
  },

  toggleSubtask: async (subtaskId: string, completed: boolean) => {
    return apiClient(`/api/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed })
    });
  },

  toggleHabit: async (habitId: string) => {
    return apiClient(`/api/habits/logs`, {
      method: 'POST',
      body: JSON.stringify({ habitId, date: new Date().toISOString() })
    });
  },

  quickCapturePlan: async (planId: string, title: string) => {
    return apiClient('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ 
        planId, 
        title, 
        date: new Date().toISOString(), 
        priority: 'medium', 
        estimatedMinutes: 30 
      })
    });
  },

  quickCaptureStudy: async (trackId: string, title: string, type: 'LESSON' | 'FEATURE') => {
    return apiClient('/api/study/units', {
      method: 'POST',
      body: JSON.stringify({ 
        trackId, 
        title, 
        type, 
        status: 'TODAY' 
      })
    });
  },

  getPlans: async () => {
    return apiClient<any>('/api/plans');
  },

  getStudyTracks: async () => {
    return apiClient<any>('/api/study/tracks');
  },

  getTasks: async () => {
    return apiClient<any[]>('/api/tasks');
  },
};
