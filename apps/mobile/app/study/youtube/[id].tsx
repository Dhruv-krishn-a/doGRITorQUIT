import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../../db';
import StudyTrack from '../../../db/models/StudyTrack';
import StudyUnit from '../../../db/models/StudyUnit';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { toggleUnitCompletion } from '../../../lib/study-logic';

interface YoutubeDetailProps {
 track: StudyTrack;
 units: StudyUnit[];
}

const YoutubeDetail: React.FC<YoutubeDetailProps> = ({ track, units }) => {
 const router = useRouter();
 const { colors } = useTheme();
 const [activeTab, setActiveTab] = useState<'PLAYLIST' | 'NOTES' | 'STATS'>('PLAYLIST');

 const stats = useMemo(() => {
 const done = units.filter(u => u.status === 'DONE').length;
 const total = units.length;
 const timeSpent = units.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0);
 return { done, total, timeSpent };
 }, [units]);

 const UnitCard = ({ unit }: { unit: StudyUnit }) => {
 const isDone = unit.status === 'DONE';
 return (
 <TouchableOpacity 
 onPress={() => router.push(`/study/${track.id}/${unit.id}`)}
 className={`p-5 rounded-[2rem] mb-3 flex-row items-center border ${
 isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] '
 }`}
 >
 <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDone ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
 <Ionicons name="logo-youtube" size={18} color={isDone ? "#10b981" : "#f43f5e"} />
 </View>
 <View className="flex-1 text-left">
 <Text className={`font-black text-sm uppercase italic tracking-tight ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`} numberOfLines={1}>
 {unit.title}
 </Text>
 <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 italic opacity-60">
 {unit.durationMinutes} MIN • {isDone ? 'WATCHED' : 'QUEUED'}
 </Text>
 </View>
 <Ionicons name={isDone ? "checkmark-circle" : "play-circle"} size={20} color={isDone ? "#10b981" : colors.accent} />
 </TouchableOpacity>
 );
 };

 return (
 <View className="flex-1 bg-[var(--bg-primary)]">
 {/* Header */}
 <View className="pt-16 px-6 pb-6 bg-[var(--bg-card)] border-b border-[var(--border-color)] ">
 <View className="flex-row items-center justify-between mb-6">
 <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
 <Ionicons name="chevron-back" size={20} color={colors.text} />
 </TouchableOpacity>
 <View className="flex-row items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
 <Ionicons name="logo-youtube" size={12} color="#f43f5e" />
 <Text className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 italic">Media Path</Text>
 </View>
 <TouchableOpacity className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
 <Ionicons name="sync-outline" size={18} color={colors.textSecondary} />
 </TouchableOpacity>
 </View>

 <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-4">
 {track.title}
 </Text>
 
 <View className="flex-row items-center gap-4">
 <View className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
 <View className="h-full bg-rose-500" style={{ width: `${track.progressPercentage}%` }} />
 </View>
 <Text className="text-[10px] font-black text-rose-500 italic">{Math.round(track.progressPercentage)}%</Text>
 </View>
 </View>

 {/* Tabs */}
 <View className="flex-row px-4 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
 {(['PLAYLIST', 'NOTES', 'STATS'] as const).map(tab => (
 <TouchableOpacity 
 key={tab} 
 onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
 className={`flex-1 py-4 items-center border-b-2 ${activeTab === tab ? 'border-rose-500' : 'border-transparent'}`}
 >
 <Text className={`text-[8px] font-black uppercase tracking-widest italic ${activeTab === tab ? 'text-rose-500' : 'text-[var(--text-secondary)] opacity-40'}`}>
 {tab}
 </Text>
 </TouchableOpacity>
 ))}
 </View>

 <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
 {activeTab === 'PLAYLIST' && (
 <View>
 <View className="flex-row items-center justify-between mb-6">
 <Text className="text-lg font-black uppercase italic tracking-tight text-[var(--text-primary)]">Videos</Text>
 <Text className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-40 italic">{stats.done}/{stats.total} Watched</Text>
 </View>
 {units.sort((a,b) => a.orderIndex - b.orderIndex).map(u => <UnitCard key={u.id} unit={u} />)}
 </View>
 )}

 {activeTab === 'NOTES' && (
 <View className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] ">
 <View className="flex-row justify-between items-center mb-8 text-left">
 <View>
 <Text className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Media Notes</Text>
 <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase mt-1 opacity-40 italic">Synthesis of video content</Text>
 </View>
 <TouchableOpacity className="p-3 bg-rose-500 rounded-xl ">
 <Ionicons name="save-outline" size={18} color="white" />
 </TouchableOpacity>
 </View>
 <TextInput
 multiline
 placeholder="Captured insights from videos..."
 placeholderTextColor={`${colors.textSecondary}40`}
 className="w-full min-h-[300px] text-base font-black italic text-[var(--text-primary)] uppercase tracking-tighter"
 style={{ textAlignVertical: 'top' }}
 />
 </View>
 )}

 {activeTab === 'STATS' && (
 <View className="space-y-6">
 <View className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] items-center">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-4 italic">Watch Time</Text>
 <Text className="text-5xl font-black text-rose-500 italic tracking-tighter">{Math.round(stats.timeSpent / 60)}H {stats.timeSpent % 60}M</Text>
 <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase mt-4 opacity-40 italic">Total ingestion duration</Text>
 </View>

 <View className="flex-row gap-4">
 <View className="flex-1 bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-color)]">
 <Ionicons name="trending-up-outline" size={20} color="#f43f5e" style={{ marginBottom: 12 }} />
 <Text className="text-xl font-black text-[var(--text-primary)] italic">{(stats.done / Math.max(1, stats.total) * 100).toFixed(0)}%</Text>
 <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 opacity-40 italic">Velocity</Text>
 </View>
 <View className="flex-1 bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-color)]">
 <Ionicons name="timer-outline" size={20} color="#f43f5e" style={{ marginBottom: 12 }} />
 <Text className="text-xl font-black text-[var(--text-primary)] italic">{stats.total - stats.done}</Text>
 <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 opacity-40 italic">Remaining</Text>
 </View>
 </View>
 </View>
 )}
 </ScrollView>
 </View>
 );
};

const EnhancedYoutubeDetail = withObservables(['id'], ({ id }) => ({
 track: database.get<StudyTrack>('study_tracks').findAndObserve(id),
 units: database.get<StudyUnit>('study_units').query(Q.where('track_id', id)).observe(),
}))(YoutubeDetail);

export default function YoutubePage() {
 const { id } = useLocalSearchParams<{ id: string }>();
 return <EnhancedYoutubeDetail id={id} />;
}
