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
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 56 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-6">
            <Text className="text-[10px] font-black uppercase tracking-[0.45em] text-[var(--text-secondary)]">
              Daily Execution
            </Text>
            <Text className="mt-1 text-4xl font-black italic uppercase tracking-tight text-[var(--text-primary)]">
              Pulse
            </Text>
          </View>

          <View className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/20 p-5 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                Flow Status
              </Text>
              <Text className="text-[11px] font-black uppercase tracking-wider text-[var(--accent-color)]">
                {completedCount}/{totalCount} Resolved
              </Text>
            </View>

            <View className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
              <View
                className="h-2 rounded-full bg-[var(--accent-color)] shadow-lg shadow-sky-500/50"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </View>

            <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-[var(--bg-secondary)]/50 p-4 border border-[var(--border-color)]">
              <View className="flex-1 mr-4">
                <Text className="text-xs font-black uppercase tracking-wide text-[var(--text-primary)] italic">
                  {remainingCount === 0 ? 'All Clear' : `${remainingCount} Vectors Pending`}
                </Text>
                <Text className="mt-1 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-3">
                  {remainingCount === 0
                    ? 'Resonance achieved. maintain the vector.'
                    : 'Maintain momentum. complete the pulse.'}
                </Text>
              </View>
              {remainingCount > 0 ? (
                <TouchableOpacity
                  onPress={handleRemindMe}
                  className="rounded-xl bg-[var(--accent-color)] px-4 py-2"
                >
                  <Text className="text-[10px] font-black uppercase tracking-wider text-[var(--bg-primary)]">
                    Nudge
                  </Text>
                </TouchableOpacity>
              ) : (
                <Ionicons name="sparkles" size={24} color="#0EA5E9" />
              )}
            </View>
          </View>

          <View className="mt-5 flex-row items-center justify-between">
            <View className="flex-row gap-2">
              {(['PENDING', 'DONE', 'ALL'] as HabitFilter[]).map((item) => {
                const active = filter === item;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setFilter(item)}
                    className={`rounded-full px-4 py-2 border ${active ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}
                  >
                    <Text
                      className={`text-[10px] font-black uppercase tracking-wider ${
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
              className="h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-color)] shadow-lg shadow-sky-500/20"
            >
              <Ionicons name="add" size={24} color="#0B0F19" />
            </TouchableOpacity>
          </View>

          <View className="mt-5 flex-row flex-wrap justify-between">
            {loading && habits.length === 0 ? (
              <ActivityIndicator color="#0EA5E9" className="w-full py-10" />
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
              <View className="w-full items-center rounded-[2rem] border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/10 p-10">
                <Text className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                  Awaiting Data
                </Text>
              </View>
            )}
          </View>

          <View className="mt-8">
            <Text className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Daily Reflection
            </Text>
            <View className="mt-3 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 p-5 shadow-sm">
              <TextInput
                value={reflection}
                onChangeText={setReflection}
                placeholder="What went well today?"
                placeholderTextColor="#475569"
                multiline
                textAlignVertical="top"
                className="min-h-[140px] text-[15px] font-bold leading-6 text-[var(--text-primary)]"
                onBlur={saveReflection}
              />
              <TouchableOpacity
                onPress={saveReflection}
                className="mt-4 items-center rounded-xl bg-[var(--accent-color)] py-3"
              >
                <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--bg-primary)]">
                  Log Reflection
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View className="flex-1 justify-end bg-[var(--bg-primary)]/80">
            <View className="rounded-t-[2.5rem] bg-[var(--bg-secondary)] p-7 pb-10 border-t border-[var(--border-color)]">
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-2xl font-black italic uppercase text-[var(--text-primary)]">New Vector</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle" size={30} color="#475569" />
                </TouchableOpacity>
              </View>

              <TextInput
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
                placeholder="Vector Label..."
                placeholderTextColor="#475569"
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-base font-bold text-[var(--text-primary)] uppercase italic"
                autoFocus
              />

              <TouchableOpacity
                onPress={handleCreateHabit}
                className="mt-6 items-center rounded-2xl bg-[var(--accent-color)] p-5 shadow-lg shadow-sky-500/20"
              >
                <Text className="text-[11px] font-black uppercase tracking-wider text-[var(--bg-primary)]">
                  Initialize Vector
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
  return (
    <TouchableOpacity
      onPress={() => onToggle(habit.id)}
      className={`mb-4 w-[48%] rounded-[1.75rem] border p-5 ${
        done
          ? 'border-mint/20 bg-mint/5 shadow-sm'
          : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/30'
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View
          className={`h-10 w-10 items-center justify-center rounded-xl ${
            done ? 'bg-mint/10' : 'bg-[var(--bg-secondary)]'
          }`}
        >
          <Ionicons
            name={normalizeHabitIcon(habit.icon)}
            size={18}
            color={done ? '#10B981' : '#0EA5E9'}
          />
        </View>
        <Ionicons
          name={done ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={done ? '#10B981' : '#1E293B'}
        />
      </View>

      <Text className={`mt-3 text-sm font-black uppercase italic tracking-tight ${done ? 'text-mint' : 'text-[var(--text-primary)]'}`}>
        {habit.title}
      </Text>
      <Text className={`mt-1 text-[9px] font-bold uppercase tracking-widest ${done ? 'text-mint/60' : 'text-[var(--text-secondary)]'}`}>
        {done ? 'Resolved' : 'Pending'}
      </Text>
    </TouchableOpacity>
  );
}
