export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TodayActionItem = {
  id: string;
  type: 'HABIT' | 'YOUTUBE' | 'COURSE' | 'PROJECT';
  title: string;
  status: 'PENDING' | 'DONE';
  priority: Priority;
  energy: EnergyLevel;
  metadata: any;
  order: number;
};

export type TodayStats = {
  momentum: number;
  completedCount: number;
  totalCount: number;
  estimatedFinishTime: string;
};
