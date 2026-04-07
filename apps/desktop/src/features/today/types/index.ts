export type ActionItemType = 'YOUTUBE' | 'COURSE' | 'PROJECT' | 'HABIT';

export interface TodayActionItem {
  id: string;
  type: ActionItemType;
  title: string;
  description?: string;
  status: 'PENDING' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  energy: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata: any; // YouTube ID, Project ID, etc.
  order: number;
}

export interface TodayStats {
  momentum: number; // 0-100
  estimatedFinishTime: string;
  completedCount: number;
  totalCount: number;
}
