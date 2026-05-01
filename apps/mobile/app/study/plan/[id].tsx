import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../../db';
import StudyTrack from '../../../db/models/StudyTrack';
import StudyUnit from '../../../db/models/StudyUnit';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface PlanDetailProps {
 track: StudyTrack;
 units: StudyUnit[];
}

const PlanDetail: React.FC<PlanDetailProps> = ({ track, units }) => {
 const router = useRouter();
 const { colors } = useTheme();

 const milestones = useMemo(() => {
 const groups: Record<string, StudyUnit[]> = {};
 units.forEach(u => {
 const milestone = (u.metadata as any)?.milestone || 'General';
 if (!groups[milestone]) groups[groups[milestone] ? milestone : milestone] = []; // Defensive
 if (!groups[milestone]) groups[milestone] = [];
 groups[milestone].push(u);
 });
 return Object.entries(groups);
 }, [units]);

 return (
 <View className="flex-1 bg-[var(--bg-primary)]">
 {/* Header */}
 <View className="pt-16 px-6 pb-8 bg-[var(--bg-card)] border-b border-[var(--border-color)] ">
 <View className="flex-row items-center justify-between mb-6">
 <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
 <Ionicons name="chevron-back" size={20} color={colors.text} />
 </TouchableOpacity>
 <View className="flex-row items-center gap-2 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20">
 <Ionicons name="map-outline" size={12} color={colors.accent} />
 <Text className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)] italic">Roadmap</Text>
 </View>
 <TouchableOpacity className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
 <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
 </TouchableOpacity>
 </View>

 <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-4">
 {track.title}
 </Text>
 
 <View className="p-6 bg-[var(--bg-secondary)]/50 rounded-3xl border border-[var(--border-color)]">
 <View className="flex-row justify-between items-end">
 <View>
 <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1 italic opacity-40">Completion Status</Text>
 <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">{Math.round(track.progressPercentage)}%</Text>
 </View>
 <View className="items-end">
 <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1 italic opacity-40">Total Steps</Text>
 <Text className="text-xl font-black text-[var(--text-primary)] italic">{units.length}</Text>
 </View>
 </View>
 <View className="h-1.5 bg-[var(--bg-primary)] rounded-full mt-4 overflow-hidden border border-[var(--border-color)]/20">
 <View className="h-full bg-[var(--accent-color)]" style={{ width: `${track.progressPercentage}%` }} />
 </View>
 </View>
 </View>

 <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
 <View className="space-y-10">
 {milestones.map(([name, mUnits], idx) => (
 <View key={name}>
 <View className="flex-row items-center gap-3 mb-6">
 <View className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] items-center justify-center border border-[var(--border-color)]">
 <Text className="text-xs font-black text-[var(--accent-color)] italic">{idx + 1}</Text>
 </View>
 <Text className="text-lg font-black text-[var(--text-primary)] italic uppercase tracking-tight">{name}</Text>
 </View>
 
 <View className="space-y-3">
 {mUnits.map(u => (
 <TouchableOpacity 
 key={u.id}
 onPress={() => router.push(`/study/${track.id}/${u.id}`)}
 className="p-5 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] flex-row items-center justify-between "
 >
 <View className="flex-1 mr-4">
 <Text className={`font-black text-sm uppercase italic tracking-tight ${u.status === 'DONE' ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`}>{u.title}</Text>
 </View>
 <Ionicons 
 name={u.status === 'DONE' ? "checkmark-circle" : "arrow-forward"} 
 size={18} 
 color={u.status === 'DONE' ? "#10b981" : colors.textSecondary} 
 style={{ opacity: u.status === 'DONE' ? 1 : 0.2 }}
 />
 </TouchableOpacity>
 ))}
 </View>
 </View>
 ))}
 </View>
 </ScrollView>
 </View>
 );
};

const EnhancedPlanDetail = withObservables(['id'], ({ id }) => ({
 track: database.get<StudyTrack>('study_tracks').findAndObserve(id),
 units: database.get<StudyUnit>('study_units').query(Q.where('track_id', id)).observe(),
}))(PlanDetail);

export default function PlanPage() {
 const { id } = useLocalSearchParams<{ id: string }>();
 const router = useRouter();
 const { colors } = useTheme();
 const [exists, setExists] = useState<boolean | null>(null);

 useEffect(() => {
 let active = true;
 if (!id) {
 setExists(false);
 return;
 }

 database
 .get<StudyTrack>('study_tracks')
 .find(id)
 .then(() => {
 if (active) setExists(true);
 })
 .catch(() => {
 if (active) setExists(false);
 });

 return () => {
 active = false;
 };
 }, [id]);

 if (exists === null) {
 return (
 <View className="flex-1 items-center justify-center bg-[var(--bg-primary)]">
 <ActivityIndicator size="large" color={colors.accent} />
 </View>
 );
 }

 if (!exists || !id) {
 return (
 <View className="flex-1 items-center justify-center bg-[var(--bg-primary)] px-8">
 <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center">
 This roadmap is not available in local study tracks.
 </Text>
 <TouchableOpacity
 onPress={() => router.replace('/(drawer)/planner')}
 className="mt-6 bg-[var(--accent-color)] px-6 py-4 rounded-2xl"
 >
 <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg-primary)]">
 Open Planner
 </Text>
 </TouchableOpacity>
 </View>
 );
 }

 return <EnhancedPlanDetail id={id} />;
}
