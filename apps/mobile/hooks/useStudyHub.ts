import { useState, useEffect, useCallback, useMemo } from 'react';
import { database } from '../db';
import StudyTrack from '../db/models/StudyTrack';
import { Q } from '@nozbe/watermelondb';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { getStoredSession } from '../lib/nativeAuth';

type RemotePlan = {
  id: string;
  title?: string;
  progress?: number;
};

export function useStudyHub() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [plans, setPlans] = useState<RemotePlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async (): Promise<RemotePlan[]> => {
    const session = await getStoredSession();
    if (!session?.access_token) return [];

    try {
      const response = await fetch(`${config.apiUrl}/api/plans`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.plans)) return data.plans;
      if (Array.isArray(data?.data?.plans)) return data.data.plans;
      return [];
    } catch (error) {
      console.warn("Failed to fetch remote plans:", error);
      return [];
    }
  }, []);

  const fetchLocalTracks = useCallback(async () => {
    if (!user?.id) return;
    try {
      const allTracks = await database.get<StudyTrack>('study_tracks')
        .query(Q.where('status', Q.notEq('ARCHIVED')), Q.where('user_id', user.id))
        .fetch();

      setTracks(allTracks);
    } catch (error) {
      console.error("Failed to fetch study tracks:", error);
    }
  }, [user?.id]);

  const fetchTracks = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [_, remotePlans] = await Promise.all([
        fetchLocalTracks(),
        fetchPlans(),
      ]);
      setPlans(remotePlans);
    } catch (error) {
      console.error("Failed to load study hub data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchLocalTracks, fetchPlans]);

  useEffect(() => {
    fetchTracks();
    const subscription = database.get('study_tracks').changes.subscribe(fetchLocalTracks);
    return () => subscription.unsubscribe();
  }, [fetchTracks, fetchLocalTracks]);

  const categorizedTracks = useMemo(() => {
    const localPlanTracks = tracks.filter(t => t.type === 'PLAN');
    const remotePlanTracks = plans
      .filter((p) => p?.id && p?.title)
      .map((p) => ({
        id: p.id,
        title: p.title!,
        type: 'PLAN',
        progressPercentage: Number(p.progress ?? 0),
        isRemotePlan: true,
      }));

    const mergedPlanTracks = [
      ...localPlanTracks,
      ...remotePlanTracks.filter((remote) => !localPlanTracks.some((local) => local.id === remote.id)),
    ];

    return {
      youtube: tracks.filter(t => t.type === 'PLAYLIST'),
      course: tracks.filter(t => t.type === 'COURSE'),
      project: tracks.filter(t => t.type === 'PROJECT'),
      plan: mergedPlanTracks,
    };
  }, [tracks, plans]);

  return {
    tracks,
    plans,
    categorizedTracks,
    loading,
    refreshTracks: fetchTracks,
  };
}
