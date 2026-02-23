"use client";

import { useStudy } from '@planner/study-core';
import { AnimatePresence } from 'framer-motion';
import { CreateTrackModal } from './CreateTrackModal';
import { CommitmentModal } from './CommitmentModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { StudySessionModal } from './StudySessionModal';
import { WeeklyReflectionModal } from './WeeklyReflectionModal';

export function StudyModalManager() {
  const { activeModal } = useStudy();

  return (
    <AnimatePresence mode="wait">
      {activeModal === 'CREATE' && <CreateTrackModal key="create" />}
      {activeModal === 'COMMIT' && <CommitmentModal key="commit" />}
      {activeModal === 'DELETE' && <ConfirmDeleteModal key="delete" />}
      {activeModal === 'SESSION' && <StudySessionModal key="session" />}
      {activeModal === 'REFLECTION' && <WeeklyReflectionModal key="reflection" />}
    </AnimatePresence>
  );
}
