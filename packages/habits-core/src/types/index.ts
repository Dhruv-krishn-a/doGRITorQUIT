export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO string
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  icon?: string | null;
  color?: string | null;
  order: number;
  active: boolean;
  logs?: HabitLog[];
}

export interface DailyNote {
  id: string;
  date: string; // ISO string
  content: string;
}

export interface HabitData {
  habits: Habit[];
  logs: HabitLog[];
  notes: DailyNote[];
}

export interface HabitsOfflineStorage {
  isOffline: () => boolean;
  getHabitData: (start: string, end: string) => Promise<HabitData>;
  saveHabitData: (data: HabitData) => Promise<void>;
  queueAction: (action: string, payload: any) => Promise<void>;
}
