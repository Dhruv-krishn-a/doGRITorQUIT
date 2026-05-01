import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import StudyTrack from '../../../db/models/StudyTrack';
import StudyUnit from '../../../db/models/StudyUnit';

interface ProjectTimeTabProps {
  track: StudyTrack;
  units: StudyUnit[];
}

export function ProjectTimeTab({ track, units }: ProjectTimeTabProps) {
  const { colors } = useTheme();

  const totalTimeLogged = units.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0);
  const totalDuration = units.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);
  const timeProgress = totalDuration > 0 ? (totalTimeLogged / totalDuration) * 100 : 0;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Time Stats */}
      <View className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] mb-8">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Time Logged</Text>
            <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Total execution time</Text>
          </View>
          <View className="w-12 h-12 bg-indigo-500/10 rounded-2xl items-center justify-center border border-indigo-500/20">
            <Ionicons name="time" size={24} color="#6366f1" />
          </View>
        </View>

        <View className="items-center mb-8">
           <Text className="text-5xl font-black text-[var(--text-primary)] italic tracking-tighter">
             {Math.floor(totalTimeLogged / 60)}<Text className="text-2xl text-[var(--text-secondary)]">H</Text> {totalTimeLogged % 60}<Text className="text-2xl text-[var(--text-secondary)]">M</Text>
           </Text>
        </View>

        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Progress to Estimate</Text>
            <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{Math.round(timeProgress)}%</Text>
          </View>
          <View className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
            <View className="h-full bg-indigo-500" style={{ width: `${Math.min(100, timeProgress)}%` }} />
          </View>
        </View>
      </View>

      {/* Manual Time Entry (Placeholder for future iteration) */}
      <View className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-color)] border-dashed items-center justify-center py-10 opacity-70">
         <Ionicons name="add-circle-outline" size={32} color={colors.textSecondary} className="mb-4" />
         <Text className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">Log Time Manually</Text>
         <Text className="text-[10px] font-bold text-[var(--text-secondary)] text-center mt-2 px-6 uppercase tracking-widest leading-relaxed">
           Quickly add time spent on tasks outside of focus sessions.
         </Text>
      </View>
    </ScrollView>
  );
}
