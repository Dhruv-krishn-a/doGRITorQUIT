import { Unit, Track } from '@gritorquit/study-core';

export type EnergyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ProjectTab = 'OVERVIEW' | 'BOARD' | 'TIMELINE' | 'TASKS' | 'PHASES' | 'TIME' | 'REVIEWS' | 'NOTES' | 'SETTINGS';

export interface ProjectContextProps {
  track: Track;
  units: Unit[];
  phases: Record<string, Unit[]>;
  metadata: { phases?: string[]; projectType?: string; priority?: string; globalNotes?: string };
  recentSessions?: any[];
  formatMins: (mins: number) => string;
  formatTime: (totalSeconds: number) => string;
  addUnit: (trackId: string, unit: any) => Promise<void>;
}
