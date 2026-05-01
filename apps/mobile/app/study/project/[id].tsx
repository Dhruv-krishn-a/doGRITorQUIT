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

interface ProjectDetailProps {
 track: StudyTrack;
 units: StudyUnit[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ track, units }) => {
 const router = useRouter();
 const { colors } = useTheme();
 const [activeTab, setActiveTab] = useState<'STEPS' | 'TIMELINE' | 'NOTES' | 'SETTINGS'>('STEPS');

 const metadata = (track?.metadata as any) || {};
 const phases = metadata.phases || ['Planning', 'Execution', 'Review'];

 const unitsByPhase = useMemo(() => {
 const map: Record<string, StudyUnit[]> = {};
 phases.forEach((p: string) => map[p] = []);
 units.forEach(u => {
 const p = (u.metadata as any)?.phase || phases[0];
 if (!map[p]) map[p] = [];
 map[p].push(u);
 });
 return map;
 }, [units, phases]);

 const UnitCard = ({ unit }: { unit: StudyUnit }) => {
 const isDone = unit.status === 'DONE';
 return (
 <TouchableOpacity 
 onPress={() => router.push(`/study/${track.id}/${unit.id}`)}
 className={`p-5 rounded-[2rem] mb-3 flex-row items-center border ${
 isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] '
 }`}
 >
 <View className="flex-1 text-left">
 <Text className={`font-black text-sm uppercase italic tracking-tight ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`}>
 {unit.title}
 </Text>
 <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 italic opacity-60">
 {unit.durationMinutes} MIN • {isDone ? 'COMPLETED' : 'PENDING'}
 </Text>
 </View>
 <TouchableOpacity 
 onPress={() => toggleUnitCompletion(unit.id)}
 className={`w-10 h-10 rounded-xl items-center justify-center ${isDone ? 'bg-emerald-500/10' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
 >
 <Ionicons name={isDone ? "checkmark-circle" : "play"} size={18} color={isDone ? "#10b981" : colors.accent} />
 </TouchableOpacity>
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
 <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] italic bg-[var(--accent-color)]/10 px-3 py-1 rounded-lg">Project Path</Text>
 <TouchableOpacity className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
 <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
 </TouchableOpacity>
 </View>

 <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-4">
 {track.title}
 </Text>
 
 <View className="flex-row items-center gap-4">
 <View className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
 <View className="h-full bg-[var(--accent-color)]" style={{ width: `${track.progressPercentage}%` }} />
 </View>
 <Text className="text-[10px] font-black text-[var(--accent-color)] italic">{Math.round(track.progressPercentage)}%</Text>
 </View>
 </View>

 {/* Tabs */}
 <View className="flex-row px-4 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
 {(['STEPS', 'TIMELINE', 'NOTES', 'SETTINGS'] as const).map(tab => (
 <TouchableOpacity 
 key={tab} 
 onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
 className={`flex-1 py-4 items-center border-b-2 ${activeTab === tab ? 'border-[var(--accent-color)]' : 'border-transparent'}`}
 >
 <Text className={`text-[8px] font-black uppercase tracking-widest italic ${activeTab === tab ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-40'}`}>
 {tab}
 </Text>
 </TouchableOpacity>
 ))}
 </View>

 <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
 {activeTab === 'STEPS' && (
 <View>
 {phases.map((phase: string) => (
 <View key={phase} className="mb-8">
 <View className="flex-row items-center gap-3 mb-4 ml-1">
 <View className="w-1 h-4 bg-[var(--accent-color)] rounded-full" />
 <Text className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] italic">{phase}</Text>
 </View>
 {unitsByPhase[phase]?.length > 0 ? (
 unitsByPhase[phase].map(u => <UnitCard key={u.id} unit={u} />)
 ) : (
 <View className="p-6 bg-[var(--bg-secondary)]/10 rounded-3xl border border-dashed border-[var(--border-color)] items-center">
 <Text className="text-[8px] font-black uppercase text-[var(--text-secondary)] opacity-40 italic">No steps in this phase</Text>
 </View>
 )}
 </View>
 ))}
 </View>
 )}

 {activeTab === 'TIMELINE' && (
 <View className="ml-4 border-l-2 border-[var(--border-color)] pl-8 py-4">
 {phases.map((phase: string, idx: number) => {
 const phaseUnits = unitsByPhase[phase] || [];
 const isCompleted = phaseUnits.length > 0 && phaseUnits.every(u => u.status === 'DONE');
 return (
 <View key={phase} className="mb-12 relative">
 <View className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-[var(--bg-primary)] ${isCompleted ? 'bg-emerald-500' : 'bg-[var(--accent-color)]'}`} />
 <Text className={`text-[10px] font-black uppercase tracking-widest mb-1 italic ${isCompleted ? 'text-emerald-500' : 'text-[var(--accent-color)]'}`}>Phase {idx + 1}</Text>
 <Text className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-4">{phase}</Text>
 <View className="space-y-2">
 {phaseUnits.slice(0, 3).map(u => (
 <View key={u.id} className="flex-row items-center gap-2">
 <Ionicons name={u.status === 'DONE' ? "checkmark-circle" : "ellipse-outline"} size={12} color={u.status === 'DONE' ? "#10b981" : colors.textSecondary} />
 <Text className={`text-[10px] font-black uppercase italic tracking-tight ${u.status === 'DONE' ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`} numberOfLines={1}>{u.title}</Text>
 </View>
 ))}
 </View>
 </View>
 );
 })}
 </View>
 )}

 {activeTab === 'NOTES' && (
 <View className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] ">
 <View className="flex-row justify-between items-center mb-8">
 <Text className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Project Ledger</Text>
 <TouchableOpacity className="p-3 bg-[var(--accent-color)] rounded-xl ">
 <Ionicons name="save-outline" size={18} color="white" />
 </TouchableOpacity>
 </View>
 <TextInput
 multiline
 placeholder="Record your thoughts..."
 placeholderTextColor={`${colors.textSecondary}40`}
 className="w-full min-h-[300px] text-base font-black italic text-[var(--text-primary)] uppercase tracking-tighter"
 style={{ textAlignVertical: 'top' }}
 />
 </View>
 )}

 {activeTab === 'SETTINGS' && (
 <View className="space-y-4">
 <TouchableOpacity className="p-6 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] flex-row items-center justify-between">
 <View className="flex-row items-center gap-4">
 <Ionicons name="create-outline" size={20} color={colors.accent} />
 <Text className="font-black text-[var(--text-primary)] uppercase italic">Rename Path</Text>
 </View>
 <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
 </TouchableOpacity>
 <TouchableOpacity className="p-6 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] flex-row items-center justify-between">
 <View className="flex-row items-center gap-4">
 <Ionicons name="calendar-outline" size={20} color={colors.accent} />
 <Text className="font-black text-[var(--text-primary)] uppercase italic">Target Date</Text>
 </View>
 <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
 </TouchableOpacity>
 <TouchableOpacity className="p-6 bg-rose-500/10 rounded-[2rem] border border-rose-500/20 flex-row items-center justify-between mt-10">
 <View className="flex-row items-center gap-4">
 <Ionicons name="trash-outline" size={20} color="#f43f5e" />
 <Text className="font-black text-rose-500 uppercase italic">Delete Path</Text>
 </View>
 </TouchableOpacity>
 </View>
 )}
 </ScrollView>
 </View>
 );
};

const EnhancedProjectDetail = withObservables(['id'], ({ id }) => ({
 track: database.get<StudyTrack>('study_tracks').findAndObserve(id),
 units: database.get<StudyUnit>('study_units').query(Q.where('track_id', id)).observe(),
}))(ProjectDetail);

export default function ProjectPage() {
 const { id } = useLocalSearchParams<{ id: string }>();
 return <EnhancedProjectDetail id={id} />;
}
