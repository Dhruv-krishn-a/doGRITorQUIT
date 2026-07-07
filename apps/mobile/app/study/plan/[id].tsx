import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';
import { api } from '../../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PlanDetail: React.FC<{ plan: any }> = ({ plan }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [localPlan, setLocalPlan] = useState(plan);

  const units = localPlan.tasks || [];

  const startDate = useMemo(() => {
    return localPlan.startDate ? dayjs(localPlan.startDate) : dayjs(localPlan.createdAt);
  }, [localPlan.startDate, localPlan.createdAt]);

  const dayGroups = useMemo(() => {
    const groups: Record<string, { units: any[], date: string }> = {};
    
    const sortedUnits = [...units].sort((a: any, b: any) => {
      const aDate = a.date ? dayjs(a.date).valueOf() : 0;
      const bDate = b.date ? dayjs(b.date).valueOf() : 0;
      return aDate - bDate;
    });

    sortedUnits.forEach((u: any, idx: number) => {
      const dayNum = u.metadata?.dayNumber || Math.floor(idx / 3) + 1;
      const dayKey = `DAY ${dayNum}`;
      
      if (!groups[dayKey]) {
        groups[dayKey] = {
          units: [],
          date: startDate.add(dayNum - 1, 'day').format('ddd, MMM DD').toUpperCase()
        };
      }
      groups[dayKey].units.push(u);
    });

    return Object.entries(groups).sort((a, b) => {
      const aNum = parseInt(a[0].replace('DAY ', ''));
      const bNum = parseInt(b[0].replace('DAY ', ''));
      return aNum - bNum;
    });
  }, [units, startDate]);

  React.useEffect(() => {
    if (!selectedDay && dayGroups.length > 0) {
      setSelectedDay(dayGroups[0][0]);
    }
  }, [dayGroups]);

  const activeDayData = useMemo(() => {
    return dayGroups.find(([name]) => name === selectedDay);
  }, [selectedDay, dayGroups]);

  const activeDayUnits = activeDayData ? activeDayData[1].units : [];
  const activeDayDate = activeDayData ? activeDayData[1].date : '';

  const handleToggleTask = async (task: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      // Toggle locally first
      const updatedTasks = localPlan.tasks.map((t: any) => 
        t.id === task.id ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'pending' } : t
      );
      setLocalPlan({ ...localPlan, tasks: updatedTasks });
      
      // Update remote
      await api.patch(`/api/plans/${localPlan.id}/tasks/${task.id}`, { completed: !task.completed });
    } catch(e) {
      console.error(e);
    }
  };

  const progressPercentage = localPlan.totalTasks > 0 ? (localPlan.completedTasks / localPlan.totalTasks) * 100 : 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <View className="flex-1 bg-[var(--bg-primary)]">
      {/* 1. Header Protocol */}
      <View className="pt-16 px-6 pb-8 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2 bg-sky-500/10 px-4 py-2 rounded-xl border border-sky-500/20  -500/5">
            <Ionicons name="map-outline" size={14} color="#0ea5e9" />
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 italic">Temporal Engine</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
            <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1 text-left">
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-2 text-left">
              {localPlan.title}
            </Text>
            <View className="flex-row items-center gap-2">
               <View className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <Text className="text-[8px] font-black text-amber-500 uppercase tracking-widest italic">AI PLAN</Text>
               </View>
               <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 italic">
                 {units.length} NODES IN SEQUENCE
               </Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row items-center gap-4">
          <View className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)] ">
            <View className="h-full bg-sky-500  -500/50" style={{ width: `${progressPercentage}%` }} />
          </View>
          <Text className="text-[11px] font-black text-sky-500 italic tracking-tighter">{Math.round(progressPercentage)}%</Text>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* 2. Timeline Sidebar */}
        <View className="w-24 border-r border-[var(--border-color)] bg-[var(--bg-card)]">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
            <View className="px-2 py-4 mb-2 items-center">
               <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 italic">Timeline</Text>
            </View>
            {dayGroups.map(([name, data]) => {
              const isActive = selectedDay === name;
              const allDone = data.units.length > 0 && data.units.every(u => u.completed);
              return (
                <TouchableOpacity 
                  key={name}
                  onPress={() => { setSelectedDay(name); Haptics.selectionAsync(); }}
                  className={`py-8 items-center border-l-4 ${isActive ? 'border-sky-500 bg-sky-500/5' : 'border-transparent'}`}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center border-2 mb-3  ${
                    allDone ? 'bg-emerald-500 border-emerald-500' : 
                    isActive ? 'bg-[var(--bg-primary)] border-sky-500' : 'border-[var(--border-color)] opacity-20'
                  }`}>
                    {allDone ? (
                      <Ionicons name="checkmark" size={18} color="white" />
                    ) : (
                      <Text className={`text-[10px] font-black ${isActive ? 'text-sky-500' : 'text-[var(--text-secondary)]'}`}>
                         {name.replace('DAY ', '')}
                      </Text>
                    )}
                  </View>
                  <Text className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-sky-500' : 'text-[var(--text-secondary)] opacity-40'}`}>
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Primary Goals Content */}
        <View className="flex-1 bg-[var(--bg-primary)]">
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <View className="mb-12 text-left">
              <View className="flex-row items-center gap-3 mb-3">
                 <View className="p-2 bg-sky-500/10 rounded-lg">
                    <Ionicons name="calendar" size={12} color="#0ea5e9" />
                 </View>
                 <Text className="text-[11px] font-black text-sky-500 uppercase tracking-[0.3em] italic">{activeDayDate}</Text>
              </View>
              <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-6 text-left">Primary Goals</Text>
              <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40 leading-relaxed italic text-left">
                Deconstruct the objectives below. Resolve all nodes to advance through the temporal sequence.
              </Text>
            </View>

            <View className="space-y-6">
              {activeDayUnits.length === 0 ? (
                <View className="py-32 items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] opacity-20">
                  <Ionicons name="flash-off-outline" size={48} color={colors.textSecondary} />
                  <Text className="text-[10px] font-black uppercase tracking-widest mt-6">Buffer Empty</Text>
                </View>
              ) : activeDayUnits.map((u) => {
                const isDone = u.completed;
                return (
                  <TouchableOpacity 
                    key={u.id}
                    onPress={() => handleToggleTask(u)}
                    activeOpacity={0.7}
                    className={`p-8 rounded-[3rem] border  ${
                      isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)]'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="flex-row items-center gap-3">
                        <View className={`w-10 h-10 rounded-2xl items-center justify-center border ${isDone ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}>
                          <Ionicons name="terminal" size={18} color={isDone ? "#10b981" : colors.accent} />
                        </View>
                        <View className="text-left">
                          <Text className={`text-[8px] font-black uppercase tracking-[0.3em] ${isDone ? 'text-emerald-500' : 'text-[var(--text-secondary)]'} opacity-60 text-left`}>PLAN NODE</Text>
                          <Text className={`text-[9px] font-black ${isDone ? 'text-emerald-500' : 'text-amber-500'} uppercase italic text-left`}>MEDIUM PRIORITY</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleToggleTask(u)}
                        className={`w-10 h-10 rounded-xl items-center justify-center ${isDone ? 'bg-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
                      >
                         <Ionicons name={isDone ? "checkmark-circle" : "ellipse-outline"} size={22} color={isDone ? "#10b981" : colors.textSecondary + '40'} />
                      </TouchableOpacity>
                    </View>

                    <Text className={`font-black text-xl uppercase italic tracking-tight mb-8 text-left ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`}>
                      {u.title}
                    </Text>

                    <View className="flex-row items-center justify-between pt-8 border-t border-[var(--border-color)]/30">
                      <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1.5">
                           <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={{ opacity: 0.4 }} />
                           <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase opacity-40 italic">{u.estimatedMinutes || 45}M</Text>
                        </View>
                        <View className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                        <Text className={`text-[10px] font-black ${isDone ? 'text-emerald-500' : 'text-sky-500'} uppercase italic`}>
                           {isDone ? 'RESOLVED' : 'ENGAGE NODE'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View className="h-20" />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
};

export default function PlanPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchPlan = async () => {
        try {
          const data = await api.get(`/api/plans/${id}`);
          setPlan(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      if (id) fetchPlan();
    }, [id])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[var(--bg-primary)]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View className="flex-1 items-center justify-center bg-[var(--bg-primary)] px-8">
        <View className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full items-center justify-center mb-10 border border-[var(--border-color)] ">
          <Ionicons name="map-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.2 }} />
        </View>
        <Text className="text-base font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center leading-relaxed">
          Strategic sequence not found{'\n'}in remote neural registry.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(drawer)/roadmap-tracker')}
          className="mt-12 bg-[var(--accent-color)] px-12 py-6 rounded-[2rem]  [var(--accent-color)]/20"
        >
          <Text className="text-xs font-black uppercase tracking-[0.4em] text-[var(--bg-primary)]">
            Open Registry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <PlanDetail plan={plan} />;
}
