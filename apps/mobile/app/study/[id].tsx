import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../db';
import StudyTrack from '../../db/models/StudyTrack';
import StudyUnit from '../../db/models/StudyUnit';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';

interface TrackDetailProps {
  track: StudyTrack;
  units: StudyUnit[];
}

import { toggleUnitCompletion } from '../../lib/study-logic';

const TrackDetail: React.FC<TrackDetailProps> = ({ track, units }) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handleToggle = async (id: string) => {
    await toggleUnitCompletion(id);
  };

  const UnitCard = ({ unit }: { unit: StudyUnit }) => {
    const isDone = unit.status === 'DONE';
    return (
      <TouchableOpacity 
        onPress={() => handleToggle(unit.id)}
        className={`p-5 rounded-[2rem] mb-4 flex-row items-center border ${
          isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-sm'
        }`}
      >
        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
          isDone ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--accent-color)]/10'
        }`}>
          <Text className={`font-black italic ${isDone ? 'text-[var(--text-secondary)]' : 'text-[var(--accent-color)]'}`}>
            {unit.orderIndex}
          </Text>
        </View>
        <View className="flex-1 text-left">
          <Text className={`font-black text-base uppercase italic tracking-tight ${isDone ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
            {unit.title}
          </Text>
          <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 italic">
            {unit.durationMinutes} Min <Text className="opacity-30">//</Text> {unit.status}
          </Text>
        </View>
        {isDone && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView className="flex-1 bg-[var(--bg-primary)]" contentContainerStyle={{ padding: 24 }}>
      {/* Header */}
      <View className="mb-10 text-left">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mb-6 w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--accent-color)] mb-2 italic">Neural Archive</Text>
        <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none">
          {track.title}
        </Text>
      </View>

      {/* Stats Hero */}
      <View className="bg-[var(--bg-card)] p-8 rounded-[3rem] mb-12 border border-[var(--border-color)] shadow-2xl">
         <View className="flex-row justify-between items-center mb-8 text-left">
            <View>
              <Text className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Mission Completion</Text>
              <Text className="text-[var(--text-primary)] text-5xl font-black italic tracking-tighter">{track.progressPercentage}%</Text>
            </View>
            <View className="w-20 h-20 bg-[var(--accent-color)]/10 rounded-[2rem] items-center justify-center border border-[var(--accent-color)]/20 shadow-sm">
               <Ionicons name="analytics" size={32} color={colors.accent} />
            </View>
         </View>
         <View className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
            <View className="h-full bg-[var(--accent-color)] rounded-full shadow-lg" style={{ width: `${track.progressPercentage}%` }} />
         </View>
      </View>

      {/* Units List */}
      <View className="text-left">
        <View className="flex-row items-center gap-3 mb-6 ml-1">
           <View className="w-1.5 h-4 bg-[var(--accent-color)] rounded-full" />
           <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Structural Units</Text>
        </View>
        
        {units.length > 0 ? (
          units.sort((a,b) => a.orderIndex - b.orderIndex).map(u => <UnitCard key={u.id} unit={u} />)
        ) : (
          <View className="items-center justify-center p-16 bg-[var(--bg-secondary)]/20 rounded-[2.5rem] border-2 border-[var(--border-color)] border-dashed">
            <Ionicons name="construct-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.2, marginBottom: 12 }} />
            <Text className="text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] text-[10px] italic opacity-40">No units mapped</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const enhance = withObservables(['id'], ({ id }) => ({
  track: database.get<StudyTrack>('study_tracks').findAndObserve(id),
  units: database.get<StudyUnit>('study_units').query(Q.where('track_id', id)).observe(),
}));

export default enhance(TrackDetail);
