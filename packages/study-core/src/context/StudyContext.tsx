// packages/study-core/src/context/StudyContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { studyApi } from '../apis/studyApi';
import { Track, TrackData, Unit, UnitStatus } from '../types/track';
import { DashboardData } from '../types/dashboard';
import { toast } from 'sonner';

export interface OfflineStorage {
  getTracks: () => Promise<Track[]>;
  getTrack: (id: string) => Promise<TrackData | null>;
  saveTrack: (track: TrackData) => Promise<void>;
  saveTracks: (tracks: Track[]) => Promise<void>;
  updateUnit?: (unitId: string, updates: any) => Promise<void>;
  queueAction: (action: string, payload: any) => Promise<void>;
  isOffline: () => boolean;
}

interface StudyState {
  tracks: Track[];
  dashboard: DashboardData | null;
  activeTrack: TrackData | null;
  loading: boolean;
  activeModal: 'CREATE' | 'CREATE_PROJECT' | 'CREATE_COURSE' | 'IMPORT_YOUTUBE' | 'DELETE' | 'COMMIT' | 'SESSION' | 'LOGS' | 'REFLECTION' | null;
  activeUnit: Unit | null;
  sessionMode: 'STUDY' | 'TIMER' | 'COMPLETE' | 'LOGS';
  sessionData?: any;
  seconds: number;
  isTimerRunning: boolean;
}

interface StudyActions {
  fetchDashboard: () => Promise<void>;
  fetchTrack: (trackId: string) => Promise<void>;
  syncTrack: (trackId: string) => Promise<void>;
  commitTrack: (trackId: string, minutes: number, targetDate?: string) => Promise<void>;
  planToday: (trackId: string, energyLevel: string) => Promise<void>;
  moveUnit: (unitId: string, toStatus: UnitStatus, newIndex: number) => Promise<void>;
  completeUnit: (unitId: string, completionData: any) => Promise<void>;
  logProgress: (unitId: string, data: { secondsSpent: number, watchPercentage: number }) => Promise<void>;
  saveWeeklyReflection: (data: any) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<boolean>;
  updateTrack: (trackId: string, updates: any) => Promise<void>;
  updateUnit: (unitId: string, updates: any) => Promise<void>;
  deleteUnit: (unitId: string) => Promise<boolean>;
  saveNotes: (unitId: string, notes: any) => Promise<void>;
  addUnit: (trackId: string, unit: any) => Promise<void>;
  setSeconds: (action: number | ((s: number) => number)) => void;
  setIsTimerRunning: (isRunning: boolean) => void;
  openModal: (modal: StudyState['activeModal'], unit?: Unit | null, mode?: StudyState['sessionMode'], data?: any) => void;
  closeModal: () => void;
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}

const StudyContext = createContext<(StudyState & StudyActions) | undefined>(undefined);

export function StudyProvider({ children, offlineStorage }: { children: ReactNode, offlineStorage?: OfflineStorage }) {
  const [state, setState] = useState<StudyState>(() => {
    let initialSeconds = 0;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('study.timerSeconds');
      if (saved) initialSeconds = parseInt(saved, 10);
    }

    return {
      tracks: [],
      dashboard: null,
      activeTrack: null,
      loading: false,
      activeModal: null,
      activeUnit: null,
      sessionMode: 'STUDY',
      seconds: initialSeconds,
      isTimerRunning: false
    };
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isTimerRunning) {
      interval = setInterval(() => {
        setState(s => {
          const nextSeconds = s.seconds + 1;
          if (typeof window !== 'undefined') {
            localStorage.setItem('study.timerSeconds', nextSeconds.toString());
          }
          return { ...s, seconds: nextSeconds };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isTimerRunning]);

  const fetchDashboard = useCallback(async () => {
    let hasLocalData = false;
    // 1. Try to load from local storage first for instant UI
    if (offlineStorage) {
      try {
        const localTracks = await offlineStorage.getTracks();
        if (localTracks && localTracks.length > 0) {
          setState(s => ({ ...s, tracks: localTracks }));
          hasLocalData = true;
        }
      } catch (e) {
        console.warn("Offline cache read error:", e);
      }
    }

    // Only show loading spinner if we have NO data at all
    if (!hasLocalData) {
      setState(s => ({ ...s, loading: true }));
    }

    try {
      if (offlineStorage?.isOffline()) {
        const localTracks = await offlineStorage.getTracks();
        setState(s => ({ ...s, tracks: localTracks, loading: false }));
        return;
      }

      const [tracksRes, dashRes] = await Promise.all([
        studyApi.getTracks(),
        studyApi.getStudyDashboard()
      ]);
      
      setState(s => ({ 
        ...s, 
        tracks: tracksRes.tracks || [], 
        dashboard: dashRes,
        loading: false 
      }));

      // Cache for offline (Write-through)
      if (offlineStorage && tracksRes.tracks) {
        offlineStorage.saveTracks(tracksRes.tracks).catch(console.error);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setState(s => ({ ...s, loading: false }));
      // Only show error toast if we have NO data to show
      if (!hasLocalData) {
        toast.error('Failed to load dashboard');
      }
    }
  }, [offlineStorage]);

  const fetchTrack = useCallback(async (trackId: string) => {
    let hasLocalData = false;
    // 1. Instant load from local cache
    if (offlineStorage) {
      try {
        const local = await offlineStorage.getTrack(trackId);
        if (local) {
          setState(s => ({ ...s, activeTrack: local }));
          hasLocalData = true;
        }
      } catch (e) {
        console.warn("Offline cache track read error:", e);
      }
    }

    if (!hasLocalData) {
      setState(s => ({ ...s, loading: true }));
    }

    try {
      if (offlineStorage?.isOffline()) {
        const local = await offlineStorage.getTrack(trackId);
        if (local) {
          setState(s => ({ ...s, activeTrack: local, loading: false }));
          return;
        }
      }

      const result = await studyApi.getTrack(trackId);
      setState(s => ({ ...s, activeTrack: result, loading: false }));
      
      if (offlineStorage) {
        offlineStorage.saveTrack(result).catch(console.error);
      }
    } catch (err) {
      console.error("Track fetch error:", err);
      setState(s => ({ ...s, loading: false }));
      if (!hasLocalData) {
        toast.error('Failed to load track');
      }
    }
  }, [offlineStorage]);

  const syncTrack = async (trackId: string) => {
    if (offlineStorage?.isOffline()) {
      toast.error("Cannot sync with YouTube while offline");
      return;
    }
    setState(s => ({ ...s, loading: true }));
    try {
      const result = await studyApi.syncTrack(trackId);
      // Always re-fetch to get updated playlistIndex/orderIndex
      await fetchTrack(trackId);
      
      if (result.added > 0) {
        toast.success(`Found ${result.added} new videos!`);
      } else {
        toast.success('Playlist numbering restored');
      }
    } catch (err) {
      toast.error('Failed to update track');
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  };

  const moveUnit = async (unitId: string, toStatus: UnitStatus, newIndex: number) => {
    if (!state.activeTrack) return;
    
    // Optimistic update
    const updatedUnits = state.activeTrack.track.units.map(u => 
      u.id === unitId ? { ...u, status: toStatus } : u
    );
    
    setState(s => ({
      ...s,
      activeTrack: s.activeTrack ? {
        ...s.activeTrack,
        track: { ...s.activeTrack.track, units: updatedUnits }
      } : null
    }));

    try {
      if (offlineStorage?.isOffline()) {
        await offlineStorage.queueAction('MOVE_UNIT', { unitId, toStatus, newIndex });
        toast.success("Action queued (offline)");
        return;
      }
      await studyApi.moveUnit(unitId, toStatus, newIndex);
    } catch (err) {
      toast.error('Failed to move item');
      if (state.activeTrack) await fetchTrack(state.activeTrack.track.id);
    }
  };

  const logProgress = async (unitId: string, data: { secondsSpent: number, watchPercentage: number }) => {
    try {
      if (offlineStorage?.isOffline()) {
        await offlineStorage.queueAction('LOG_PROGRESS', { unitId, ...data });
        toast.success("Progress saved locally");
        return;
      }
      await studyApi.logProgress(unitId, data);
      if (state.activeTrack) await fetchTrack(state.activeTrack.track.id);
      toast.success("Progress tracked");
    } catch (err) {
      toast.error("Failed to track progress");
    }
  };

  // ... (Remaining methods follow same pattern: check offline -> queue -> else call api)

  const actions: StudyActions = {
    fetchDashboard, fetchTrack, syncTrack, moveUnit, logProgress,
    commitTrack: async (trackId, minutes, targetDate) => {
        if (offlineStorage?.isOffline()) {
            await offlineStorage.queueAction('COMMIT_TRACK', { trackId, minutes, targetDate });
            return;
        }
        await studyApi.commitTrack(trackId, minutes, targetDate);
        await fetchTrack(trackId);
    },
    planToday: async (trackId, energyLevel) => {
        if (offlineStorage?.isOffline()) {
            toast.error("Planning requires AI which is unavailable offline");
            return;
        }
        await studyApi.planToday(trackId, energyLevel);
        await fetchTrack(trackId);
    },
    completeUnit: async (unitId, completionData) => {
        if (offlineStorage?.isOffline()) {
            await offlineStorage.queueAction('COMPLETE_UNIT', { unitId, completionData });
            return;
        }
        await studyApi.completeUnit(unitId, completionData);
        if (state.activeTrack) await fetchTrack(state.activeTrack.track.id);
    },
    saveWeeklyReflection: async (data) => {
        if (offlineStorage?.isOffline()) {
            await offlineStorage.queueAction('SAVE_REFLECTION', data);
            return;
        }
        await studyApi.saveWeeklyReflection(data);
    },
    deleteTrack: async (trackId) => {
        if (offlineStorage?.isOffline()) {
            toast.error("Delete restricted while offline");
            return false;
        }
        await studyApi.deleteTrack(trackId);
        setState(s => ({ ...s, tracks: s.tracks.filter(t => t.id !== trackId) }));
        return true;
    },
    updateTrack: async (trackId, updates) => {
        if (offlineStorage?.isOffline()) {
            await offlineStorage.queueAction('UPDATE_TRACK', { trackId, updates });
            return;
        }
        await studyApi.updateTrack(trackId, updates);
        await fetchTrack(trackId);
    },
    updateUnit: async (unitId, updates) => {
        // 1. ALWAYS persist to local storage immediately if available
        if (offlineStorage) {
            await offlineStorage.updateUnit?.(unitId, updates).catch(console.error);
        }

        // 2. Optimistically update local UI state if activeTrack is loaded
        setState(s => {
            if (!s.activeTrack) return s;
            const updatedUnits = s.activeTrack.track.units.map(u => 
                u.id === unitId ? { ...u, ...updates } : u
            );
            return {
                ...s,
                activeTrack: {
                    ...s.activeTrack,
                    track: { ...s.activeTrack.track, units: updatedUnits }
                }
            };
        });

        if (offlineStorage?.isOffline()) {
            await offlineStorage.queueAction('UPDATE_UNIT', { unitId, updates });
            return;
        }

        // Background sync (Fire and forget)
        studyApi.updateUnit(unitId, updates).catch(err => {
            console.warn("Background updateUnit failed, will retry later:", err);
            // If background sync fails, queue it for later
            offlineStorage?.queueAction('UPDATE_UNIT', { unitId, updates }).catch(console.error);
        });
    },
    deleteUnit: async (unitId) => {
        if (offlineStorage?.isOffline()) {
            toast.error("Delete restricted while offline");
            return false;
        }
        await studyApi.deleteUnit(unitId);
        if (state.activeTrack) await fetchTrack(state.activeTrack.track.id);
        return true;
    },
    saveNotes: async (unitId, notes) => {
        // 1. ALWAYS persist to local storage immediately
        if (offlineStorage) {
            await offlineStorage.updateUnit?.(unitId, { notes }).catch(console.error);
        }

        // 2. UI is already updated via local state in component usually, but we ensure persistence
        if (offlineStorage?.isOffline()) {
            await offlineStorage.queueAction('SAVE_NOTES', { unitId, notes });
            return;
        }

        // Background sync
        studyApi.saveNotes(unitId, notes).catch(err => {
            console.warn("Background saveNotes failed, will retry later:", err);
            offlineStorage?.queueAction('SAVE_NOTES', { unitId, notes }).catch(console.error);
        });
    },
    addUnit: async (trackId, unit) => {
        if (offlineStorage?.isOffline()) {
            await offlineStorage.queueAction('ADD_UNIT', { trackId, unit });
            return;
        }
        await studyApi.addUnit(trackId, unit);
        await fetchTrack(trackId);
    },
    setSeconds: (action) => {
        setState(s => {
          const nextSeconds = typeof action === 'function' ? action(s.seconds) : action;
          if (typeof window !== 'undefined') localStorage.setItem('study.timerSeconds', nextSeconds.toString());
          return { ...s, seconds: nextSeconds };
        });
    },
    setIsTimerRunning: (isRunning) => setState(s => ({ ...s, isTimerRunning: isRunning })),
    openModal: (modal, unit = null, mode = 'STUDY', data = null) => {
        setState(s => ({ ...s, activeModal: modal, activeUnit: unit, sessionMode: mode, sessionData: data }));
    },
    closeModal: () => setState(s => ({ ...s, activeModal: null, activeUnit: null })),
    setTracks: (action: any) => {
        setState(s => {
           const nextTracks = typeof action === 'function' ? action(s.tracks) : action;
           return { ...s, tracks: nextTracks };
        });
    }
  };

  return (
    <StudyContext.Provider value={{ ...state, ...actions }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
