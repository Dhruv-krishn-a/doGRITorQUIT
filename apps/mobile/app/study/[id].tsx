import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../db';
import StudyTrack from '../../db/models/StudyTrack';
import withObservables from '@nozbe/with-observables';
import { useTheme } from '../../context/ThemeContext';

interface DispatcherProps {
  track: StudyTrack | null;
}

const PathDispatcher: React.FC<DispatcherProps> = ({ track }) => {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (!track) return;

    // Determine the correct route based on type
    let route = `/study/project/${track.id}`; // Default
    if (track.type === 'PLAYLIST') route = `/study/youtube/${track.id}`;
    else if (track.type === 'COURSE') route = `/study/course/${track.id}`;
    else if (track.type === 'PLAN') route = `/study/plan/${track.id}`;

    router.replace(route as any);
  }, [track]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
};

const EnhancedDispatcher = withObservables(['id'], ({ id }) => ({
  track: database.get<StudyTrack>('study_tracks').findAndObserve(id),
}))(PathDispatcher);

export default function StudyDispatcherPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EnhancedDispatcher id={id} />;
}
