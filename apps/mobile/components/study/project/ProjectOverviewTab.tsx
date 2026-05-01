import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import StudyTrack from '../../../db/models/StudyTrack';
import StudyUnit from '../../../db/models/StudyUnit';

interface ProjectOverviewTabProps {
  track: StudyTrack;
  unitsByPhase: Record<string, StudyUnit[]>;
  phases: string[];
}

export function ProjectOverviewTab({ track, unitsByPhase, phases }: ProjectOverviewTabProps) {
  const { colors } = useTheme();

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* High Level Stats */}
      <View className="flex-row justify-between mb-8 gap-4">
        <View className="flex-1 bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-color)]">
          <Ionicons name="flag-outline" size={24} color={colors.accent} />
          <Text className="text-2xl font-black text-[var(--text-primary)] italic mt-4">{phases.length}</Text>
          <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1 opacity-60">Active Phases</Text>
        </View>
        <View className="flex-1 bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-color)]">
          <Ionicons name="checkbox-outline" size={24} color="#10b981" />
          <Text className="text-2xl font-black text-[var(--text-primary)] italic mt-4">{Object.values(unitsByPhase).flat().filter(u => u.status === 'DONE').length}</Text>
          <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1 opacity-60">Tasks Done</Text>
        </View>
      </View>

      {/* Phase Health */}
      <Text className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-6">Phase Health</Text>
      
      {phases.map((phase: string, idx: number) => {
        const phaseUnits = unitsByPhase[phase] || [];
        const done = phaseUnits.filter(u => u.status === 'DONE').length;
        const total = phaseUnits.length;
        const pct = total === 0 ? 0 : (done / total) * 100;
        const isCompleted = total > 0 && done === total;

        return (
          <View key={phase} className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-color)] mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-3">
                <View className={`w-8 h-8 rounded-xl items-center justify-center border ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20'}`}>
                  <Text className={`text-[10px] font-black italic ${isCompleted ? 'text-emerald-500' : 'text-[var(--accent-color)]'}`}>{idx + 1}</Text>
                </View>
                <Text className="text-base font-black text-[var(--text-primary)] italic uppercase tracking-tight">{phase}</Text>
              </View>
              <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{done}/{total}</Text>
            </View>
            
            <View className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
              <View className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-[var(--accent-color)]'}`} style={{ width: `${pct}%` }} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
