import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
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
import { map } from 'rxjs/operators';

interface CourseDetailProps {
  track: StudyTrack;
  units: StudyUnit[];
}

const CourseDetail: React.FC<CourseDetailProps> = ({ track, units }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'CURRICULUM' | 'NOTES' | 'PROGRESS'>('CURRICULUM');

  const stats = useMemo(() => {
    const done = units.filter(u => u.status === 'DONE').length;
    const total = units.length;
    const totalMinutes = units.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);
    return { done, total, totalMinutes };
  }, [units]);

  const UnitCard = ({ unit }: { unit: StudyUnit }) => {
    const isDone = unit.status === 'DONE';
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/study/${track.id}/${unit.id}`)}
        activeOpacity={0.7}
        className={`p-6 rounded-[2.5rem] mb-5 border shadow-sm ${
          isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)]'
        }`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${isDone ? 'bg-emerald-500/10' : 'bg-fuchsia-500/10'}`}>
              <Ionicons name="book" size={20} color={isDone ? "#10b981" : "#d946ef"} />
            </View>
            <View className="text-left">
              <Text className={`font-black text-[9px] uppercase tracking-[0.2em] italic ${isDone ? 'text-emerald-500' : 'text-fuchsia-500'}`}>
                {isDone ? 'NODE RESOLVED' : 'ACADEMIC UNIT'}
              </Text>
              <Text className="text-[8px] font-bold text-[var(--text-secondary)] uppercase opacity-40">CURRICULUM SEQUENCE</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              toggleUnitCompletion(unit.id);
            }}
            className={`w-10 h-10 rounded-xl items-center justify-center ${isDone ? 'bg-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
          >
             <Ionicons name={isDone ? "checkmark-circle" : "checkmark-circle-outline"} size={22} color={isDone ? "#10b981" : colors.textSecondary + '40'} />
          </TouchableOpacity>
        </View>

        <Text className={`font-black text-lg uppercase italic tracking-tight mb-6 text-left ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`} numberOfLines={2}>
          {unit.title}
        </Text>

        <View className="flex-row items-center justify-between pt-6 border-t border-[var(--border-color)]/30">
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
               <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={{ opacity: 0.4 }} />
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase opacity-40 italic">{unit.durationMinutes || 45}M</Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
            <Text className="text-[10px] font-black text-fuchsia-500 uppercase italic">Ingestion Protocol</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push(`/study/${track.id}/${unit.id}`)}
            className="flex-row items-center gap-3 px-6 py-3 bg-[var(--text-primary)] rounded-2xl shadow-lg shadow-black/10"
          >
             <Ionicons name="flash" size={12} color={colors.primary} />
             <Text className="text-[10px] font-black text-[var(--bg-primary)] uppercase tracking-widest italic">Focus</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      {/* Header Protocol */}
      <View className="pt-16 px-6 pb-6 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2 bg-fuchsia-500/10 px-4 py-2 rounded-xl border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/5">
            <Ionicons name="school-outline" size={14} color="#d946ef" />
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500 italic">Academic Path</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
            <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-6 text-left">
          {track.title}
        </Text>
        
        <View className="flex-row items-center gap-4">
          <View className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
            <View className="h-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50" style={{ width: `${track.progressPercentage}%` }} />
          </View>
          <Text className="text-[11px] font-black text-fuchsia-500 italic tracking-tighter">{Math.round(track.progressPercentage)}%</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row px-4 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        {(['CURRICULUM', 'NOTES', 'PROGRESS'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
            className={`flex-1 py-5 items-center border-b-2 ${activeTab === tab ? 'border-fuchsia-500' : 'border-transparent'}`}
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest italic ${activeTab === tab ? 'text-fuchsia-500' : 'text-[var(--text-secondary)] opacity-40'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'CURRICULUM' && (
          <View>
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-2xl font-black uppercase italic tracking-tight text-[var(--text-primary)]">Sequence Inventory</Text>
              <View className="bg-[var(--bg-secondary)] px-3 py-1 rounded-lg border border-[var(--border-color)]">
                 <Text className="text-[9px] font-black uppercase text-[var(--text-secondary)] opacity-40 italic">{stats.done}/{stats.total} NODES</Text>
              </View>
            </View>
            {units.sort((a,b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map(u => <UnitCard key={u.id} unit={u} />)}
          </View>
        )}

        {activeTab === 'NOTES' && (
          <View className="bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-xl">
            <View className="flex-row justify-between items-center mb-10 text-left">
              <View className="text-left">
                <Text className="text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter text-left">Neural Ledger</Text>
                <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase mt-1 opacity-40 italic tracking-widest text-left">Course-wide synthesis</Text>
              </View>
              <TouchableOpacity className="p-4 bg-fuchsia-500 rounded-2xl shadow-lg shadow-fuchsia-500/20">
                <Ionicons name="save-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <TextInput
              multiline
              placeholder="Record key concepts and structural insights..."
              placeholderTextColor={`${colors.textSecondary}40`}
              className="w-full min-h-[400px] text-lg font-black italic text-[var(--text-primary)] uppercase tracking-tighter"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        )}

        {activeTab === 'PROGRESS' && (
          <View className="space-y-8">
            <View className="bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border-color)] items-center shadow-xl">
              <Text className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-6 italic opacity-60">System Mastery</Text>
              <Text className="text-6xl font-black text-fuchsia-500 italic tracking-tighter shadow-sm">{Math.round(track.progressPercentage)}%</Text>
              <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase mt-6 opacity-30 italic tracking-widest">Protocol completion rate</Text>
            </View>

            <View className="flex-row gap-6">
              <View className="flex-1 bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm">
                <View className="w-12 h-12 bg-fuchsia-500/10 rounded-2xl items-center justify-center mb-6">
                  <Ionicons name="time" size={20} color="#d946ef" />
                </View>
                <Text className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{stats.totalMinutes}M</Text>
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-40 italic">Temporal Cost</Text>
              </View>
              <View className="flex-1 bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm">
                <View className="w-12 h-12 bg-fuchsia-500/10 rounded-2xl items-center justify-center mb-6">
                  <Ionicons name="ribbon" size={20} color="#d946ef" />
                </View>
                <Text className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{stats.done}</Text>
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-40 italic">Resolved</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const EnhancedCourseDetail = withObservables(['id'], ({ id }) => ({
  track: database.get<StudyTrack>('study_tracks').query(Q.where('id', id)).observe().pipe(map(rows => rows[0] || null)),
  units: database.get<StudyUnit>('study_units').query(Q.where('track_id', id)).observe(),
}))(({ track, units }: { track: StudyTrack | null, units: StudyUnit[] }) => {
  const { colors } = useTheme();
  const router = useRouter();

  if (!track) {
    return (
      <View className="flex-1 items-center justify-center bg-[var(--bg-primary)] px-8">
        <View className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full items-center justify-center mb-8 border border-[var(--border-color)]">
          <Ionicons name="school-outline" size={40} color={colors.textSecondary} style={{ opacity: 0.2 }} />
        </View>
        <Text className="text-sm font-black uppercase tracking-[0.1em] text-[var(--text-secondary)] text-center leading-relaxed">
          Course sequence not found{'\n'}in local neural archive.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(drawer)/course-tracker')}
          className="mt-10 bg-[var(--accent-color)] px-10 py-5 rounded-2xl shadow-lg shadow-[var(--accent-color)]/20"
        >
          <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-primary)]">
            Open Registry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <CourseDetail track={track} units={units} />;
});

export default function CoursePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <EnhancedCourseDetail id={id} />;
}
