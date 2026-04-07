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

  const handleToggle = async (id: string) => {
    await toggleUnitCompletion(id);
  };

  const UnitCard = ({ unit }: { unit: StudyUnit }) => {
    const isDone = unit.status === 'DONE';
    return (
      <TouchableOpacity 
        onPress={() => handleToggle(unit.id)}
        className={`p-4 rounded-3xl mb-4 flex-row items-center border ${
          isDone ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
          isDone ? 'bg-slate-100' : 'bg-indigo-50'
        }`}>
          <Text className={`font-black italic ${isDone ? 'text-slate-400' : 'text-indigo-600'}`}>
            {unit.orderIndex}
          </Text>
        </View>
        <View className="flex-1">
          <Text className={`font-bold text-base ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {unit.title}
          </Text>
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {unit.durationMinutes} Minutes • {unit.status}
          </Text>
        </View>
        {isDone && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#fafbfc]" contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View className="mb-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-2">Neural Archive</Text>
        <Text className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
          {track.title}
        </Text>
      </View>

      {/* Stats Hero */}
      <View className="bg-slate-900 p-6 rounded-[2.5rem] mb-10 shadow-xl shadow-slate-300">
         <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest">Completion</Text>
              <Text className="text-white text-4xl font-black italic">{track.progressPercentage}%</Text>
            </View>
            <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center border border-white/10">
               <Ionicons name="analytics" size={24} color="white" />
            </View>
         </View>
         <View className="h-2 bg-white/10 rounded-full overflow-hidden">
            <View className="h-full bg-indigo-500" style={{ width: `${track.progressPercentage}%` }} />
         </View>
      </View>

      {/* Units List */}
      <View>
        <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 ml-1">Structural Units</Text>
        {units.length > 0 ? (
          units.sort((a,b) => a.orderIndex - b.orderIndex).map(u => <UnitCard key={u.id} unit={u} />)
        ) : (
          <View className="items-center justify-center p-10 bg-white rounded-[2rem] border border-slate-100 border-dashed">
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No units mapped</Text>
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
