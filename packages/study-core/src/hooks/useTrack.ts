// packages/study-core/src/hooks/useTrack.ts
// DEPRECATED: Use useStudy() from @gritorquit/study-core/context instead.
// Keeping this file for backward compatibility during transition if needed, 
// but it just wraps useStudy now.

import { useEffect } from 'react';
import { useStudy } from '../context/StudyContext';

export function useTrack(trackId: string) {
  const study = useStudy();

  useEffect(() => {
    if (trackId) {
      study.fetchTrack(trackId);
    }
  }, [trackId, study.fetchTrack]);

  return {
    data: study.activeTrack,
    loading: study.loading,
    refresh: () => study.fetchTrack(trackId),
    commitTrack: study.commitTrack,
    planToday: study.planToday,
    moveUnit: study.moveUnit,
    completeUnit: study.completeUnit,
    deleteTrack: study.deleteTrack,
    setData: study.setTracks as any, // Warning: type mismatch but keeping signature
  };
}
