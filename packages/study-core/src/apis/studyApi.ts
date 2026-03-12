// packages/study-core/src/apis/studyApi.ts
import { apiClient } from '../lib/apiClient';
import { DashboardData } from '../types/dashboard';
import { Track, TrackData } from '../types/track';

export const studyApi = {
  getStudyDashboard: () => 
    apiClient<DashboardData>('/api/study/dashboard'),
  
  getTracks: () => 
    apiClient<{ tracks: Track[] }>('/api/study/tracks'),
  
  getTrack: (trackId: string) => 
    apiClient<TrackData>(`/api/study/tracks/${trackId}`),
  
  getUnit: (unitId: string) => 
    apiClient<any>(`/api/study/units/${unitId}`),

  createTrack: (data: { title: string; description?: string; type: string }) =>
    apiClient<Track>('/api/study/tracks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  importPlaylist: (playlistUrl: string, targetDate?: string) => 
    apiClient<{ error?: string }>('/api/study/tracks/import-playlist', {
      method: 'POST',
      body: JSON.stringify({ playlistUrl, targetDate }),
    }),
  
  commitTrack: (trackId: string, dailyAllocationMinutes: number, targetDate?: string) => 
    apiClient(`/api/study/tracks/${trackId}/commit`, {
      method: 'POST',
      body: JSON.stringify({ dailyAllocationMinutes, targetDate }),
    }),
  
  deleteTrack: (trackId: string) => 
    apiClient(`/api/study/tracks/${trackId}`, { method: 'DELETE' }),

  updateTrack: (trackId: string, updates: any) =>
    apiClient(`/api/study/tracks/${trackId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  updateUnit: (unitId: string, updates: any) =>
    apiClient(`/api/study/units/${unitId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteUnit: (unitId: string) =>
    apiClient(`/api/study/units/${unitId}`, { method: 'DELETE' }),

  syncTrack: (trackId: string) =>
    apiClient<{ added: number }>(`/api/study/tracks/${trackId}/sync`, { method: 'POST' }),
  
  planToday: (trackId: string, energyLevel: string) => 
    apiClient('/api/study/plan-today', {
      method: 'POST',
      body: JSON.stringify({ trackId, energyLevel }),
    }),
  
  moveUnit: (unitId: string, toStatus: string, positionIndex: number) => 
    apiClient(`/api/study/units/${unitId}/move`, {
      method: 'POST',
      body: JSON.stringify({ toStatus, positionIndex }),
    }),
  
  completeUnit: (unitId: string, completionData: any) => 
    apiClient(`/api/study/units/${unitId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData),
    }),

  logProgress: (unitId: string, data: { secondsSpent: number, watchPercentage: number }) =>
    apiClient(`/api/study/units/${unitId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  saveNotes: (unitId: string, notes: any) =>
    apiClient(`/api/study/units/${unitId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  saveWeeklyReflection: (data: any) =>
    apiClient('/api/study/reflection', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addUnit: (trackId: string, unit: any) =>
    apiClient('/api/study/units', {
      method: 'POST',
      body: JSON.stringify({ trackId, ...unit }),
    }),
};
