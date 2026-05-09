import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import StudyUnit from '../../../db/models/StudyUnit';
import { useRouter } from 'expo-router';
import { toggleUnitCompletion } from '../../../lib/study-logic';
import * as Haptics from 'expo-haptics';

interface ProjectBoardTabProps {
  trackId: string;
  unitsByPhase: Record<string, StudyUnit[]>;
  phases: string[];
}

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width * 0.85;

export function ProjectBoardTab({ trackId, unitsByPhase, phases }: ProjectBoardTabProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const UnitCard = ({ unit }: { unit: StudyUnit }) => {
    const isDone = unit.status === 'DONE';
    return (
      <TouchableOpacity 
        onPress={() => {
          Haptics.selectionAsync();
          router.push(`/study/${trackId}/${unit.id}` as any);
        }}
        activeOpacity={0.7}
        className={`p-6 rounded-[2rem] mb-4 border shadow-sm ${
          isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)]'
        }`}
      >
        <View className="flex-row justify-between items-start mb-4">
           <Text className={`font-black text-base uppercase italic tracking-tight flex-1 mr-4 text-left ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`}>
             {unit.title}
           </Text>
           <TouchableOpacity 
             onPress={() => {
               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
               toggleUnitCompletion(unit.id);
             }}
             className={`w-10 h-10 rounded-xl items-center justify-center ${isDone ? 'bg-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
           >
             <Ionicons name={isDone ? "checkmark-circle" : "ellipse-outline"} size={20} color={isDone ? "#10b981" : colors.textSecondary + '40'} />
           </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
             <Ionicons name="time-outline" size={12} color={colors.textSecondary} style={{ opacity: 0.4 }} />
             <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40 italic">{unit.durationMinutes || 0}M</Text>
          </View>
          <View className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
          <Text className={`text-[9px] font-black uppercase italic ${isDone ? 'text-emerald-500' : 'text-amber-500'}`}>
            {isDone ? 'RESOLVED' : 'ACTIVE'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <View className="flex-row justify-center items-center py-4">
         <View className="flex-row gap-2 bg-[var(--bg-secondary)] px-4 py-1.5 rounded-full border border-[var(--border-color)]">
            <Ionicons name="swap-horizontal" size={10} color={colors.textSecondary} style={{ opacity: 0.4 }} />
            <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic">Swipe Phases</Text>
         </View>
      </View>

      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        snapToInterval={COLUMN_WIDTH + 24}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {phases.map((phase: string) => (
          <View key={phase} style={{ width: COLUMN_WIDTH, marginHorizontal: 12 }}>
            <View className="mb-6 px-2 text-left">
               <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3">
                     <View className="w-2 h-6 bg-[var(--accent-color)] rounded-full shadow-lg shadow-[var(--accent-color)]/50" />
                     <Text className="text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">{phase.replace('_', ' ')}</Text>
                  </View>
                  <View className="bg-[var(--bg-secondary)] px-4 py-1 rounded-xl border border-[var(--border-color)]">
                    <Text className="text-[10px] font-black text-[var(--text-secondary)] italic">{unitsByPhase[phase]?.length || 0} NODES</Text>
                  </View>
               </View>

               <TouchableOpacity 
                activeOpacity={0.7}
                className="w-full py-5 bg-amber-500 rounded-[1.5rem] flex-row items-center justify-center gap-3 shadow-lg shadow-amber-500/20"
               >
                  <Ionicons name="sparkles" size={18} color="white" />
                  <Text className="text-[11px] font-black text-white uppercase tracking-widest italic">Generate Tasks for {phase.replace('_', ' ')}</Text>
               </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 rounded-[2.5rem] bg-[var(--bg-secondary)]/5 border border-dashed border-[var(--border-color)] p-4">
               {unitsByPhase[phase]?.length > 0 ? (
                 unitsByPhase[phase].map(u => <UnitCard key={u.id} unit={u} />)
               ) : (
                 <View className="py-20 items-center justify-center opacity-30">
                   <Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
                   <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic mt-6 text-center">No tasks defined for this phase{'\n'}Generate using AI or add manually</Text>
                 </View>
               )}
               <View className="h-10" />
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
