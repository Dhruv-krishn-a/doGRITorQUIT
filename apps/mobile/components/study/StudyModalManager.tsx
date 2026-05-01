import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { WeeklyReflectionModal } from './modals/WeeklyReflectionModal';
import { CommitmentModal } from './modals/CommitmentModal';

export function StudyModalManager() {
  const [showReflection, setShowReflection] = useState(false);
  const [showCommitment, setShowCommitment] = useState(false);

  useEffect(() => {
    // Simple mock logic for demonstration: 
    // If it's Sunday after 5 PM, trigger reflection.
    const now = new Date();
    if (now.getDay() === 0 && now.getHours() >= 17) {
       // setShowReflection(true); // Uncomment to enable auto-trigger
    }
  }, []);

  return (
    <>
      <WeeklyReflectionModal visible={showReflection} onClose={() => setShowReflection(false)} />
      <CommitmentModal visible={showCommitment} onClose={() => setShowCommitment(false)} />
    </>
  );
}
