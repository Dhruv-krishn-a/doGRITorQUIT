import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../db';
import StudyTrack from '../../db/models/StudyTrack';
import StudyUnit from '../../db/models/StudyUnit';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { toggleUnitCompletion } from '../../lib/study-logic';

interface TrackDetailProps {
  track: StudyTrack;
  units: StudyUnit[];
}

const TrackDetail: React.FC<TrackDetailProps> = ({ track, units }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'BOARD' | 'NOTES' | 'ANALYTICS'>('BOARD');

  const handleToggle = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleUnitCompletion(id);
  };

  const UnitCard = ({ unit }: { unit: StudyUnit }) => {
    const isDone = unit.status === 'DONE';
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/study/${track.id}/${unit.id}`)}
        className={`p-6 rounded-[2.5rem] mb-4 flex-row items-center border ${
          isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-sm'
        }`}
      >
        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-5 ${
          isDone ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--accent-color)]/10'
        }`}>
          <Text className={`font-black italic ${isDone ? 'text-[var(--text-secondary)]' : 'text-[var(--accent-color)]'}`}>
            {unit.orderIndex}
          </Text>
        </View>
        <View className="flex-1 text-left">
          <Text className={`font-black text-base uppercase italic tracking-tight ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`}>
            {unit.title}
          </Text>
          <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1.5 italic opacity-60">
            {unit.durationMinutes} MIN <Text className="opacity-20">//</Text> {unit.status}
          </Text>
        </View>
        <View className={`w-10 h-10 rounded-xl items-center justify-center ${isDone ? 'bg-emerald-500/10' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
          <Ionicons name={isDone ? "checkmark" : "play"} size={18} color={isDone ? "#10b981" : colors.accent} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      {/* Dynamic Header */}
      <View className="pt-16 px-6 pb-6 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)] active:scale-90 transition-all"
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
              <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="text-left">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] italic bg-[var(--accent-color)]/10 px-2 py-1 rounded-md">{track.type}</Text>
            <Text className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic opacity-40">System Core</Text>
          </View>
          <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-4">
            {track.title}
          </Text>
          
          <View className="flex-row items-center gap-4">
            <View className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
              <View className="h-full bg-[var(--accent-color)] rounded-full shadow-lg" style={{ width: `${track.progressPercentage}%` }} />
            </View>
            <Text className="text-[10px] font-black text-[var(--accent-color)] italic">{Math.round(track.progressPercentage)}%</Text>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row px-6 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        {(['BOARD', 'NOTES', 'ANALYTICS'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
            className={`flex-1 py-4 items-center border-b-2 ${activeTab === tab ? 'border-[var(--accent-color)]' : 'border-transparent'}`}
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest italic ${activeTab === tab ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-40'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {activeTab === 'BOARD' && (
          <View className="text-left">
            <View className="flex-row items-center gap-3 mb-8 ml-1">
               <View className="w-1.5 h-5 bg-[var(--accent-color)] rounded-full shadow-[0_0_10px_var(--accent-color)]" />
               <Text className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)] italic">Active Path</Text>
            </View>
            
            {units.length > 0 ? (
              units.sort((a,b) => a.orderIndex - b.orderIndex).map(u => <UnitCard key={u.id} unit={u} />)
            ) : (
              <View className="items-center justify-center p-20 bg-[var(--bg-secondary)]/10 rounded-[3.5rem] border-2 border-[var(--border-color)] border-dashed opacity-30">
                <Ionicons name="flash-outline" size={48} color={colors.textSecondary} />
                <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mt-6 italic text-center">Awaiting Neural Sequence</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'NOTES' && (
          <View className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-xl text-left">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tight leading-none">Neural Ledger</Text>
                <Text className="text-[9px] font-black text-[var(--text-secondary)] mt-2 uppercase tracking-widest italic opacity-40">Cross-vector sync</Text>
              </View>
              <TouchableOpacity className="p-4 bg-[var(--accent-color)] rounded-2xl shadow-lg shadow-[var(--accent-color)]/20">
                <Ionicons name="save-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <TextInput
              multiline
              placeholder="Initialize neural recording..."
              placeholderTextColor={`${colors.textSecondary}40`}
              className="w-full min-h-[300px] text-base font-black italic text-[var(--text-primary)] uppercase tracking-tighter"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        )}

        {activeTab === 'ANALYTICS' && (
          <View className="space-y-6">
            <View className="bg-[var(--bg-card)] p-8 rounded-[3.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group">
              <View className="flex-row items-center gap-4 mb-10">
                <View className="p-3 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl border border-[var(--accent-color)]/20 shadow-sm"><Ionicons name="pulse" size={20} color={colors.accent} /></View>
                <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic">Mission Pulse</Text>
              </View>
              <View className="flex-row justify-between items-end">
                <View className="text-left">
                  <Text className="text-5xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{units.filter(u => u.status === 'DONE').length}</Text>
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 italic opacity-40">Units Resolved</Text>
                </View>
                <View className="text-right">
                  <Text className="text-2xl font-black text-[var(--accent-color)] italic tracking-tighter leading-none">+{Math.round(track.progressPercentage)}%</Text>
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 italic opacity-40">Velocity</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-color)]">
                <Ionicons name="time-outline" size={20} color={colors.accent} style={{ marginBottom: 12 }} />
                <Text className="text-xl font-black text-[var(--text-primary)] italic">{units.reduce((a,b) => a + (b.durationMinutes || 0), 0)}M</Text>
                <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 opacity-40 italic">Temporal Investment</Text>
              </View>
              <View className="flex-1 bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-color)]">
                <Ionicons name="flash-outline" size={20} color={colors.accent} style={{ marginBottom: 12 }} />
                <Text className="text-xl font-black text-[var(--text-primary)] italic">STEADY</Text>
                <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 opacity-40 italic">Neural State</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const EnhancedTrackDetail = withObservables(['id'], ({ id }) => ({
  track: database.get<StudyTrack>('study_tracks').findAndObserve(id),
  units: database.get<StudyUnit>('study_units').query(Q.where('track_id', id)).observe(),
}))(TrackDetail);

export default function TrackPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Missing Project ID</Text>
      </View>
    );
  }

  return <EnhancedTrackDetail id={id} />;
}
