"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStudy } from '@gritorquit/study-core';
import { AnimatePresence } from 'framer-motion';
import { CreateTrackModal } from './CreateTrackModal';
import { CreateProjectModal } from './CreateProjectModal';
import { CreateCourseModal } from './CreateCourseModal';
import { ImportYoutubeModal } from './ImportYoutubeModal';
import { CommitmentModal } from './CommitmentModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { StudySessionModal } from './StudySessionModal';
import { WeeklyReflectionModal } from './WeeklyReflectionModal';

export function StudyModalManager() {
  const { activeModal } = useStudy();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const root = document.getElementById('study-modal-root');
  if (!root) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {activeModal === 'CREATE' && <CreateTrackModal key="create" />}
      {activeModal === 'CREATE_PROJECT' && <CreateProjectModal key="create-project" />}
      {activeModal === 'CREATE_COURSE' && <CreateCourseModal key="create-course" />}
      {activeModal === 'IMPORT_YOUTUBE' && <ImportYoutubeModal key="import-youtube" />}
      {activeModal === 'COMMIT' && <CommitmentModal key="commit" />}
      {activeModal === 'DELETE' && <ConfirmDeleteModal key="delete" />}
      {activeModal === 'SESSION' && <StudySessionModal key="session" />}
      {activeModal === 'REFLECTION' && <WeeklyReflectionModal key="reflection" />}
    </AnimatePresence>,
    root
  );
}