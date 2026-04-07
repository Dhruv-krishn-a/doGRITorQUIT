import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useToday } from '../../hooks/useToday';
import { ActionCard } from '../../components/ActionCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PerspectiveWrapper } from './_layout';

export default function TodayPage() {
  const { 
    actionStream, stats, loading, 
    energy, setEnergy, toggleHabit, refreshAll,
    toggleTaskComplete, toggleUnitComplete, createScheduledTask, plannerTasks
  } = useToday();
  const router = useRouter();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [taskTime, setTaskTime] = useState('09:00');

  if (loading && actionStream.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[var(--bg-primary)]">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <PerspectiveWrapper>
      <ScrollView className="flex-1 bg-[var(--bg-primary)]" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HUD Section */}
        <View className="p-6 bg-[var(--bg-secondary)]/30 border-b border-[var(--border-color)]">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Current Velocity</Text>
              <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
                {stats.efficiencyScore}% <Text className="text-xs text-[var(--accent-color)] italic">Resonance</Text>
              </Text>
            </View>
            <TouchableOpacity 
              onPress={refreshAll}
              className="w-10 h-10 items-center justify-center bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]"
            >
              <Ionicons name="refresh" size={20} color="#0EA5E9" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between bg-[var(--bg-secondary)]/50 p-4 rounded-3xl border border-[var(--border-color)]">
            <View className="items-center">
              <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Active</Text>
              <Text className="text-lg font-black text-[var(--text-primary)]">{stats.activeHabits}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Resolved</Text>
              <Text className="text-lg font-black text-mint">{stats.completedTasks}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Streak</Text>
              <Text className="text-lg font-black text-amber">{stats.currentStreak}D</Text>
            </View>
          </View>
        </View>

        {/* Energy Selection */}
        <View className="p-6">
          <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Neural Energy Level</Text>
          <View className="flex-row gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setEnergy(level)}
                className={`flex-1 py-3 rounded-2xl border items-center justify-center ${
                  energy === level 
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' 
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                }`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${
                  energy === level ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
                }`}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Stream */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Daily Stream</Text>
            <View className="w-12 h-0.5 bg-[var(--bg-secondary)]" />
          </View>

          <View className="space-y-4">
            {actionStream.map((item) => (
              <ActionCard 
                key={item.id} 
                item={item} 
                onToggle={() => {
                  if (item.type === 'HABIT') {
                    toggleHabit(item.id, item.status === 'DONE');
                  } else if (item.type === 'PROJECT') {
                    toggleTaskComplete(item.id, item.status === 'DONE');
                  } else if (item.type === 'YOUTUBE' || item.type === 'COURSE') {
                    toggleUnitComplete(item.id, item.status === 'DONE');
                  }
                }}
              />
            ))}

            {actionStream.length === 0 && (
              <View className="items-center justify-center p-12 bg-[var(--bg-secondary)]/10 rounded-[2.5rem] border border-dashed border-[var(--border-color)]">
                <Ionicons name="planet" size={32} color="#1E293B" />
                <Text className="mt-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-center">
                  All Vectors Resolved.{"\n"}Awaiting Instructions.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Today's Planner */}
        <View className="mt-10 px-6">
          <View className="bg-[var(--bg-secondary)]/30 p-6 rounded-[2.5rem] border border-[var(--border-color)]">
            <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-4">Inject Instruction</Text>
            
            <TextInput
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4 text-[var(--text-primary)] font-bold text-sm mb-4"
              placeholder="New Task Label..."
              placeholderTextColor="#475569"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            
            <TouchableOpacity
              onPress={async () => {
                if (taskTitle.trim()) {
                  await createScheduledTask({ title: taskTitle, date: taskDate, time: taskTime, priority: 'medium' });
                  setTaskTitle('');
                }
              }}
              className="bg-[var(--accent-color)] py-4 rounded-2xl items-center shadow-lg shadow-[var(--accent-color)]/20"
            >
              <Text className="text-[10px] font-black text-[var(--bg-primary)] uppercase tracking-widest">Execute Initialization</Text>
            </TouchableOpacity>

            <View className="mt-8 space-y-3">
              {plannerTasks.map((task) => (
                <View key={task.id} className="flex-row items-center justify-between p-4 bg-[var(--bg-primary)]/50 rounded-2xl border border-[var(--border-color)]">
                  <View>
                    <Text className="text-[var(--text-primary)] font-black uppercase text-[10px] tracking-tight">{task.title}</Text>
                    <Text className="text-[var(--text-secondary)] text-[8px] font-bold uppercase mt-1">Status: Operational</Text>
                  </View>
                  <Ionicons name="time-outline" size={14} color="#64748b" />
                </View>
              ))}
              {plannerTasks.length === 0 && (
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-center mt-2 italic">No future vectors mapped.</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </PerspectiveWrapper>
  );
}
