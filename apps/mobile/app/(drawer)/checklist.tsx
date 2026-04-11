import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Q } from '@nozbe/watermelondb';

import { useTheme } from '../../context/ThemeContext';
import { useChecklist } from '../../hooks/useChecklist';
import { database } from '../../db';
import Note from '../../db/models/Note';
import Habit from '../../db/models/Habit';
import { scheduleChecklistNudgeSoon, scheduleChecklistRemainingReminder } from '../../lib/notifications';
import { PerspectiveWrapper } from './_layout';

type HabitFilter = 'ALL' | 'PENDING' | 'DONE';

function normalizeHabitIcon(name?: string): keyof typeof Ionicons.glyphMap {
  const fallback: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
  if (!name) return fallback;

  const normalized = name.toLowerCase().trim();
  const aliases: Record<string, keyof typeof Ionicons.glyphMap> = {
    bookopen: 'book-outline',
    monitor: 'desktop-outline',
    zap: 'flash-outline',
    flash: 'flash-outline',
  };

  const resolved = aliases[normalized] ?? (normalized as keyof typeof Ionicons.glyphMap);
  return Ionicons.glyphMap[resolved] ? resolved : fallback;
}

export default function ChecklistPage() {
  const { habits, logs, loading, toggleHabit, createHabit } = useChecklist();
  const [filter, setFilter] = useState<HabitFilter>('PENDING');
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [reflection, setReflection] = useState('');
  const [reflectionNote, setReflectionNote] = useState<Note | null>(null);
  const { colors } = useTheme();

  const completedHabitIds = useMemo(() => {
    return new Set(logs.map((log) => log.habitId));
  }, [logs]);

  const completedCount = completedHabitIds.size;
  const totalCount = habits.length;
  const remainingCount = Math.max(totalCount - completedCount, 0);
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const visibleHabits = useMemo(() => {
    if (filter === 'DONE') {
      return habits.filter((habit) => completedHabitIds.has(habit.id));
    }

    if (filter === 'PENDING') {
      return habits.filter((habit) => !completedHabitIds.has(habit.id));
    }

    return habits;
  }, [habits, completedHabitIds, filter]);

  const remainingHabits = useMemo(() => {
    return habits.filter((habit) => !completedHabitIds.has(habit.id));
  }, [habits, completedHabitIds]);

  useEffect(() => {
    async function loadReflection() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const notes = await database
        .get<Note>('notes')
        .query(
          Q.where('category', 'DAILY_REFLECTION'),
          Q.where('created_at', Q.gte(today.getTime()))
        )
        .fetch();

      if (notes.length > 0) {
        setReflectionNote(notes[0]);
        setReflection(notes[0].content || '');
      }
    }

    loadReflection();
  }, []);

  useEffect(() => {
    const titles = remainingHabits.map((habit) => habit.title);
    scheduleChecklistRemainingReminder(titles).catch(() => {});
  }, [remainingHabits]);

  const handleToggle = async (habitId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleHabit(habitId);
  };

  const handleCreateHabit = async () => {
    const title = newHabitTitle.trim();
    if (!title) return;

    await createHabit(title);
    setNewHabitTitle('');
    setModalVisible(false);
  };

  const handleRemindMe = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const titles = remainingHabits.map((habit) => habit.title);
    await scheduleChecklistNudgeSoon(titles, 5);
    await scheduleChecklistRemainingReminder(titles, 21, 0);
  };

  const saveReflection = async () => {
    await database.write(async () => {
      if (reflectionNote) {
        await reflectionNote.update((n) => {
          n.content = reflection;
        });
      } else {
        const newNote = await database.get<Note>('notes').create((n) => {
          n.title = `Reflection - ${new Date().toLocaleDateString()}`;
          n.content = reflection;
          n.category = 'DAILY_REFLECTION';
          n.userId = 'default';
        });
        setReflectionNote(newNote);
      }
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <PerspectiveWrapper>
      <View className="flex-1 bg-[var(--bg-primary)]">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8 text-left">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">
              Daily Execution
            </Text>
            <Text className="text-4xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none">
              Pulse
            </Text>
          </View>

          <View className="rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] italic">
                Flow Status
              </Text>
              <Text className="text-[11px] font-black uppercase tracking-widest text-[var(--accent-color)] italic">
                {completedCount}/{totalCount} Resolved
              </Text>
            </View>

            <View className="h-3 overflow-hidden rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/50">
              <View
                className="h-full rounded-full bg-[var(--accent-color)] shadow-lg shadow-sky-500/50"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </View>

            <View className="mt-6 flex-row items-center justify-between rounded-[2rem] bg-[var(--bg-secondary)]/40 p-5 border border-[var(--border-color)]">
              <View className="flex-1 mr-4 text-left">
                <Text className="text-xs font-black uppercase tracking-wide text-[var(--text-primary)] italic">
                  {remainingCount === 0 ? 'Resonance Achieved' : `${remainingCount} Vectors Pending`}
                </Text>
                <Text className="mt-1 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-tight italic">
                  {remainingCount === 0
                    ? 'Flow state maintained. the system is stable.'
                    : 'Maintain momentum. Complete the daily pulse.'}
                </Text>
              </View>
              {remainingCount > 0 ? (
                <TouchableOpacity
                  onPress={handleRemindMe}
                  className="rounded-xl bg-[var(--accent-color)] px-5 py-2.5 shadow-lg shadow-sky-500/20"
                >
                  <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-primary)]">
                    Nudge
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="w-10 h-10 items-center justify-center bg-[var(--accent-color)]/10 rounded-full border border-[var(--accent-color)]/20">
                  <Ionicons name="sparkles" size={20} color={colors.accent} />
                </View>
              )}
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row gap-2">
              {(['PENDING', 'DONE', 'ALL'] as HabitFilter[]).map((item) => {
                const active = filter === item;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setFilter(item)}
                    className={`rounded-full px-5 py-2.5 border ${active ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg shadow-sky-500/20' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}
                  >
                    <Text
                      className={`text-[9px] font-black uppercase tracking-widest ${
                        active ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="h-12 w-12 items-center justify-center rounded-2xl bg-[var(--text-primary)] shadow-xl"
            >
              <Ionicons name="add" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {loading && habits.length === 0 ? (
              <ActivityIndicator color={colors.accent} size="large" className="w-full py-12" />
            ) : (
              visibleHabits.map((habit) => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  done={completedHabitIds.has(habit.id)}
                  onToggle={handleToggle}
                />
              ))
            )}

            {!loading && visibleHabits.length === 0 && (
              <View className="w-full items-center justify-center rounded-[2.5rem] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/10 p-12">
                <Ionicons name="layers-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.2, marginBottom: 12 }} />
                <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40">
                  Sector Neutral
                </Text>
              </View>
            )}
          </View>

          <View className="mt-10 text-left">
            <View className="flex-row items-center gap-3 mb-5 ml-1">
               <View className="w-1 h-4 bg-[var(--accent-color)] rounded-full" />
               <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Daily Reflection</Text>
            </View>
            <View className="rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl">
              <TextInput
                value={reflection}
                onChangeText={setReflection}
                placeholder="MISSION DEBRIEF..."
                placeholderTextColor={colors.textSecondary + '40'}
                multiline
                textAlignVertical="top"
                className="min-h-[160px] text-[15px] font-black leading-6 text-[var(--text-primary)] italic uppercase tracking-tighter"
                onBlur={saveReflection}
              />
              <TouchableOpacity
                onPress={saveReflection}
                className="mt-6 items-center rounded-2xl bg-[var(--accent-color)] py-4 shadow-lg shadow-sky-500/20"
              >
                <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-primary)] italic">
                  Log Reflection
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View className="flex-1 justify-end bg-black/60">
            <View 
              style={{ backgroundColor: colors.card }}
              className="rounded-t-[3.5rem] p-10 pb-16 border-t border-[var(--border-color)] shadow-2xl"
            >
              <View className="mb-10 flex-row items-center justify-between">
                <Text className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Initialize Vector</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View className="mb-8 text-left">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1">Mission Label</Text>
                <TextInput
                  value={newHabitTitle}
                  onChangeText={setNewHabitTitle}
                  placeholder="Designation..."
                  placeholderTextColor={colors.textSecondary + '40'}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 text-lg font-black text-[var(--text-primary)] uppercase italic tracking-tight"
                  autoFocus
                />
              </View>

              <TouchableOpacity
                onPress={handleCreateHabit}
                activeOpacity={0.9}
                className="items-center rounded-3xl bg-[var(--accent-color)] p-6 shadow-xl shadow-sky-500/30"
              >
                <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-primary)] italic">
                  Execute Initialization
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </PerspectiveWrapper>
  );
}

function HabitItem({
  habit,
  done,
  onToggle,
}: {
  habit: Habit;
  done: boolean;
  onToggle: (habitId: string) => Promise<void>;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onToggle(habit.id)}
      activeOpacity={0.8}
      className={`mb-5 w-[48%] rounded-[2rem] border p-6 ${
        done
          ? 'border-mint/30 bg-mint/10 shadow-lg shadow-mint/10'
          : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/40 shadow-sm'
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl border ${
            done ? 'bg-mint/20 border-mint/30' : 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-sm'
          }`}
        >
          <Ionicons
            name={normalizeHabitIcon(habit.icon)}
            size={22}
            color={done ? '#10B981' : colors.accent}
          />
        </View>
        <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${done ? 'bg-mint border-mint' : 'border-[var(--border-color)]'}`}>
           {done && <Ionicons name="checkmark" size={14} color="white" />}
        </View>
      </View>

      <Text className={`mt-5 text-base font-black uppercase italic tracking-tighter leading-none ${done ? 'text-mint' : 'text-[var(--text-primary)]'}`}>
        {habit.title}
      </Text>
      <Text className={`mt-2 text-[9px] font-black uppercase tracking-widest italic ${done ? 'text-mint/60' : 'text-[var(--text-secondary)]'}`}>
        {done ? 'Resolved' : 'Pending'}
      </Text>
    </TouchableOpacity>
  );
}
