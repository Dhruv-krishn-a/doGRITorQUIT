import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import StudyUnit from '../../../db/models/StudyUnit';
import { useRouter } from 'expo-router';
import { toggleUnitCompletion } from '../../../lib/study-logic';

interface ProjectBoardTabProps {
  trackId: string;
  unitsByPhase: Record<string, StudyUnit[]>;
  phases: string[];
}

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width * 0.75;

export function ProjectBoardTab({ trackId, unitsByPhase, phases }: ProjectBoardTabProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const UnitCard = ({ unit }: { unit: StudyUnit }) => {
    const isDone = unit.status === 'DONE';
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/study/${trackId}/${unit.id}` as any)}
        className={`p-5 rounded-[1.5rem] mb-3 border ${
          isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] '
        }`}
      >
        <View className="flex-row justify-between items-start mb-3">
           <Text className={`font-black text-sm uppercase italic tracking-tight flex-1 mr-3 ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`}>
             {unit.title}
           </Text>
           <TouchableOpacity 
             onPress={() => toggleUnitCompletion(unit.id)}
             className={`w-8 h-8 rounded-lg items-center justify-center ${isDone ? 'bg-emerald-500/10' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
           >
             <Ionicons name={isDone ? "checkmark-circle" : "ellipse-outline"} size={16} color={isDone ? "#10b981" : colors.textSecondary} />
           </TouchableOpacity>
        </View>
        <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic opacity-60">
          {unit.durationMinutes || 0} MIN • {isDone ? 'DONE' : 'TODO'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      horizontal 
      pagingEnabled 
      showsHorizontalScrollIndicator={false}
      snapToInterval={COLUMN_WIDTH + 16}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
    >
      {phases.map((phase: string) => (
        <View key={phase} style={{ width: COLUMN_WIDTH, marginHorizontal: 8 }}>
          <View className="flex-row items-center justify-between mb-4 px-2">
            <View className="flex-row items-center gap-2">
               <View className="w-2 h-2 rounded-full bg-[var(--accent-color)]" />
               <Text className="text-sm font-black text-[var(--text-primary)] italic uppercase tracking-tight">{phase}</Text>
            </View>
            <View className="bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)]">
              <Text className="text-[8px] font-black text-[var(--text-secondary)]">{unitsByPhase[phase]?.length || 0}</Text>
            </View>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 rounded-[2rem] bg-[var(--bg-secondary)]/10 border border-dashed border-[var(--border-color)] p-2">
             {unitsByPhase[phase]?.length > 0 ? (
               unitsByPhase[phase].map(u => <UnitCard key={u.id} unit={u} />)
             ) : (
               <View className="p-8 items-center justify-center opacity-50">
                 <Ionicons name="layers-outline" size={24} color={colors.textSecondary} className="mb-2" />
                 <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-center">Drop tasks here</Text>
               </View>
             )}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}
