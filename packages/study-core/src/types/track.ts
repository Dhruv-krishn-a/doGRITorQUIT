// packages/study-core/src/types/track.ts

export type TrackStats = {
  avgMinsPerDay: number;
  estCompletionDate: string | Date;
  status: 'AHEAD' | 'BEHIND' | 'ON_TRACK';
  daysDiff: number;
  todayTargetMins: number;
  todayTargetVideos: number;
  completedVideos: number;
  totalVideos: number;
  masteredContentMinutes: number;
  totalInvestmentMinutes: number;
};

// Generic Track type that doesn't rely on Prisma directly (but mirrors it)
export interface Track {
  id: string;
  title: string;
  description: string | null;
  type: string;
  totalTimeMinutes: number;
  totalDurationMinutes: number;
  progressPercentage: number;
  confidenceScore: number;
  targetDate: string | Date | null;
  dailyAllocationMinutes: number | null;
  remainingMinutes?: number;
  units?: Unit[];
}

export type UnitStatus = 'BACKLOG' | 'THIS_WEEK' | 'TODAY' | 'IN_PROGRESS' | 'DONE' | 'COMPLETED' | 'BLOCKED' | 'REVIEW';

export type UnitType = 'VIDEO' | 'LESSON' | 'FEATURE' | 'TASK' | 'REVISION';

export interface Unit {
  id: string;
  trackId: string;
  title: string;
  description: string | null;
  status: UnitStatus;
  type: UnitType;
  orderIndex: number;
  confidenceRating?: number;
  difficultyRating?: number;
  durationMinutes?: number;
  watchPercentage?: number;
  actualTimeSpentMinutes?: number;
  metadata?: any;
  sessions?: {
    id: string;
    startedAt: string | Date;
    endedAt: string | Date;
    watchedSeconds: number;
  }[];
}

export interface TrackData {
  track: Track & { units: Unit[] };
  stats: TrackStats;
}
