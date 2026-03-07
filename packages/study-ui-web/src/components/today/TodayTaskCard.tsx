// packages/study-ui-web/src/components/today/TodayTaskCard.tsx
"use client";

import React from 'react';
import { UnitCard } from '../shared/UnitCard';
import { motion } from 'framer-motion';

interface TodayTaskCardProps {
  item: any;
  index: number;
  onStart: (id: string, type: string) => void;
  onComplete: (id: string, type: string) => void;
  onPostpone: (id: string, type: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string, completed: boolean) => void;
  TaskCardComponent?: React.ComponentType<any>;
}

export function TodayTaskCard({ 
  item, 
  index, 
  onStart, 
  onComplete, 
  onPostpone, 
  onToggleSubtask,
  TaskCardComponent 
}: TodayTaskCardProps) {
  const isStudy = ['VIDEO', 'LESSON', 'REVISION', 'FEATURE'].includes(item.type) || !!item.trackId;

  if (isStudy) {
    const unit = {
      ...item,
      watchPercentage: item.progress || 0,
      actualTimeSpentMinutes: item.studyTime || 0,
      durationMinutes: item.duration || 0,
    };

    return (
      <UnitCard 
        unit={unit} 
        index={index} 
        isDraggable={false}
        onAction={(actionType, u) => {
          if (actionType === 'SESSION' || actionType === 'TIMER') onStart(u.id, u.type);
          if (actionType === 'COMPLETE') onComplete(u.id, u.type);
        }}
      />
    );
  }

  if (TaskCardComponent) {
    return (
      <TaskCardComponent 
        task={item} 
        onStart={() => onStart(item.id, 'TASK')}
        onComplete={() => onComplete(item.id, 'TASK')}
        onPostpone={() => onPostpone(item.id, 'TASK')}
        onToggleSubtask={(subtaskId: string, completed: boolean) => onToggleSubtask?.(item.id, subtaskId, completed)}
      />
    );
  }

  return (
    <div className="p-4 bg-white border border-rose-100 rounded-2xl">
      {item.title}
    </div>
  );
}
