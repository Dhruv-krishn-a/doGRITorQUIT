// packages/study-core/src/types/dashboard.ts

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DriftingTrack {
  title: string;
}

export interface UnitWithTrack {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  trackId: string;
  track: { 
    title: string;
    id: string;
  };
}

export interface DashboardData {
  streak: number;
  weeklyTimeMinutes: number;
  fatigueLevel: string;
  suggestedMode: string;
  overloadRisk?: boolean;
  burnoutRisk?: boolean;
  contextSwitchRisk?: boolean;
  driftingTracks?: DriftingTrack[];
  recommendedReduction?: string | number;
  dueRevisions?: (UnitWithTrack)[];
  globalNextUnit?: (UnitWithTrack) | null;
  dailyLoadPercentage?: number;
  maxNeuralCapacity?: number;
  loadBreakdown?: {
    plannedLoad: number;
    capacity: number;
    highEffortUnits: number;
    contextSwitches: number;
  };
  fatigueDetails?: {
    score: number;
    reason: string;
    isBurnoutRisk: boolean;
  };
  lastReflectedAt?: string | Date | null;
  stats?: {
    totalXP: number;
    currentLevel: number;
    nextLevelXP: number;
  };
}
