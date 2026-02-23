// packages/study-core/src/context/StudyContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { studyApi } from '../apis/studyApi';
import { Track, TrackData, Unit, UnitStatus } from '../types/track';
import { DashboardData } from '../types/dashboard';
import { toast } from 'sonner';

interface StudyState {
  tracks: Track[];
  dashboard: DashboardData | null;
  activeTrack: TrackData | null;
  loading: boolean;
  activeModal: 'CREATE' | 'DELETE' | 'COMMIT' | 'SESSION' | 'LOGS' | 'REFLECTION' | null;
  activeUnit: Unit | null;
  sessionMode: 'STUDY' | 'TIMER' | 'COMPLETE' | 'LOGS';
  sessionData?: any;
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
  saveNotes: (unitId: string, notes: any) => Promise<void>;
  addUnit: (trackId: string, unit: any) => Promise<void>;
  
  // Modal controls
  openModal: (modal: StudyState['activeModal'], unit?: Unit | null, mode?: StudyState['sessionMode'], data?: any) => void;
  closeModal: () => void;
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}

const StudyContext = createContext<(StudyState & StudyActions) | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>({
    tracks: [],
    dashboard: null,
    activeTrack: null,
    loading: false,
    activeModal: null,
    activeUnit: null,
    sessionMode: 'STUDY'
  });

  const fetchDashboard = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
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
    } catch (err) {
      toast.error('Failed to load dashboard');
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  const fetchTrack = useCallback(async (trackId: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const result = await studyApi.getTrack(trackId);
      setState(s => ({ ...s, activeTrack: result, loading: false }));
    } catch (err) {
      toast.error('Failed to load track');
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  const syncTrack = async (trackId: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const result = await studyApi.syncTrack(trackId);
      if (result.added > 0) {
        toast.success(`Found ${result.added} new videos!`);
        await fetchTrack(trackId);
      } else {
        toast.info('Everything is up to date.');
      }
    } catch (err) {
      toast.error('Failed to update track');
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  };

  const commitTrack = async (trackId: string, minutes: number, targetDate?: string) => {
    try {
      await studyApi.commitTrack(trackId, minutes, targetDate);
      await fetchTrack(trackId);
      toast.success("Daily goal updated");
    } catch (err) {
      toast.error('Failed to save goal');
    }
  };

  const planToday = async (trackId: string, energyLevel: string) => {
    try {
      await studyApi.planToday(trackId, energyLevel);
      await fetchTrack(trackId);
      await fetchDashboard();
      toast.success("Schedule updated");
    } catch (err) {
      toast.error('Failed to update schedule');
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
      await studyApi.moveUnit(unitId, toStatus, newIndex);
      await fetchDashboard(); // Sync global timeline
    } catch (err) {
      toast.error('Failed to move item');
      if (state.activeTrack) await fetchTrack(state.activeTrack.track.id);
    }
  };

  const completeUnit = async (unitId: string, completionData: any) => {
    try {
      await studyApi.completeUnit(unitId, completionData);
      if (state.activeTrack) await fetchTrack(state.activeTrack.track.id);
      await fetchDashboard();
      toast.success("Progress saved");
    } catch (err) {
      toast.error("Failed to complete lesson");
    }
  };

  // FIXED: Changed 'minutesSpent' to 'secondsSpent' to match the interface
  const logProgress = async (unitId: string, data: { secondsSpent: number, watchPercentage: number }) => {
    try {
      await fetch(`/api/study/units/${unitId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (state.activeTrack) await fetchTrack(state.activeTrack.track.id);
      toast.success("Progress tracked");
    } catch (err) {
      toast.error("Failed to track progress");
    }
  };

  const deleteTrack = async (trackId: string) => {
    try {
      await studyApi.deleteTrack(trackId);
      setState(s => ({ ...s, tracks: s.tracks.filter(t => t.id !== trackId) }));
      toast.success("Track deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete track");
      return false;
    }
  };

  const saveNotes = async (unitId: string, notes: any) => {
    try {
      // Direct fetch for now as it's highly specific
      await fetch(`/api/study/units/${unitId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      toast.success("Notes saved");
    } catch (err) {
      toast.error("Failed to save notes");
    }
  };

  const saveWeeklyReflection = async (data: any) => {
    try {
      await fetch('/api/study/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      await fetchDashboard();
      toast.success("Reflection saved");
    } catch (err) {
      toast.error("Failed to save reflection");
    }
  };

  const addUnit = async (trackId: string, unit: any) => {
    try {
      await fetch('/api/study/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, ...unit })
      });
      await fetchTrack(trackId);
      toast.success("Lesson added");
    } catch (err) {
      toast.error("Failed to add lesson");
    }
  };

  const openModal = useCallback((modal: StudyState['activeModal'], unit: Unit | null = null, mode: StudyState['sessionMode'] = 'STUDY', data: any = null) => {
    setState(s => ({ ...s, activeModal: modal, activeUnit: unit, sessionMode: mode, sessionData: data }));
  }, []);

  const closeModal = useCallback(() => {
    setState(s => ({ ...s, activeModal: null, activeUnit: null }));
  }, []);

  const setTracks = (action: any) => {
     setState(s => {
        const nextTracks = typeof action === 'function' ? action(s.tracks) : action;
        return { ...s, tracks: nextTracks };
     });
  };

  const actions: StudyActions = {
    fetchDashboard,
    fetchTrack,
    syncTrack,
    commitTrack,
    planToday,
    moveUnit,
    completeUnit,
    logProgress,
    saveWeeklyReflection,
    deleteTrack,
    saveNotes,
    addUnit,
    openModal,
    closeModal,
    setTracks: setTracks as any
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