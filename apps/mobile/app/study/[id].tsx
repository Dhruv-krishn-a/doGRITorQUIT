import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../db';
import StudyTrack from '../../db/models/StudyTrack';
import { useTheme } from '../../context/ThemeContext';

export default function StudyDispatcherPage() {
 const { id } = useLocalSearchParams<{ id: string }>();
 const router = useRouter();
 const { colors } = useTheme();
 const [track, setTrack] = useState<StudyTrack | null>(null);

 useEffect(() => {
 let mounted = true;
 async function resolveTrack() {
 if (!id) return;
 try {
 const found = await database.get<StudyTrack>('study_tracks').find(id);
 if (mounted) setTrack(found);
 } catch {
 // Invalid/stale id: avoid throwing from findAndObserve and route to study hub.
 if (mounted) {
 router.replace('/(drawer)/study');
 }
 }
 }

 resolveTrack();
 return () => {
 mounted = false;
 };
 }, [id, router]);

 useEffect(() => {
 if (!track?.id) return;

 // Determine the correct route based on type
 let route = `/study/project/${track.id}`; // Default
 if (track.type === 'PLAYLIST') route = `/study/youtube/${track.id}`;
 else if (track.type === 'COURSE') route = `/study/course/${track.id}`;
 else if (track.type === 'PLAN') route = `/study/plan/${track.id}`;

 router.replace(route as any);
 }, [track, router]);

 return (
 <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
 <ActivityIndicator size="large" color={colors.accent} />
 </View>
 );
}
