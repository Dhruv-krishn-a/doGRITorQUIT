// packages/study-core/src/hooks/useStudyDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { studyApi } from '../apis/studyApi';
import { DashboardData } from '../types/dashboard';
import { Track } from '../types/track';
import { toast } from 'sonner';

export function useStudyDashboard() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tracksRes, dashRes] = await Promise.all([
        studyApi.getTracks(),
        studyApi.getStudyDashboard()
      ]);
      setTracks(tracksRes.tracks || []);
      setDashboard(dashRes);
    } catch (err) {
      toast.error('Failed to load study data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    tracks,
    dashboard,
    loading,
    refresh: fetchData,
    setTracks,
  };
}
