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
};
