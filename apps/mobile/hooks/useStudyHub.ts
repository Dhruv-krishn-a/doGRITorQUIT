import { useState, useEffect, useCallback, useMemo } from 'react';
import { database } from '../db';
import StudyTrack from '../db/models/StudyTrack';
import { Q } from '@nozbe/watermelondb';
import { useAuth } from '../context/AuthContext';

export function useStudyHub() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<StudyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const allTracks = await database.get<StudyTrack>('study_tracks')
        .query(Q.where('status', Q.notEq('ARCHIVED')), Q.where('user_id', user.id))
        .fetch();
      setTracks(allTracks);
    } catch (error) {
      console.error("Failed to fetch study tracks:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTracks();
    const subscription = database.get('study_tracks').changes.subscribe(fetchTracks);
    return () => subscription.unsubscribe();
  }, [fetchTracks]);

  const categorizedTracks = useMemo(() => {
    return {
      youtube: tracks.filter(t => t.type === 'PLAYLIST'),
      course: tracks.filter(t => t.type === 'COURSE'),
      project: tracks.filter(t => t.type === 'PROJECT'),
      plan: tracks.filter(t => t.type === 'PLAN'),
    };
  }, [tracks]);

  return {
    tracks,
    categorizedTracks,
    loading,
    refreshTracks: fetchTracks,
  };
}
