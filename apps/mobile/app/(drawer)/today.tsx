import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { useToday } from '../../hooks/useToday';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PerspectiveWrapper } from './_layout';
import SmartTimeline from '../../components/today/SmartTimeline';

const DAY_START_HOUR = 23; // 11 PM

const parseTime = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${ampm}`;
};

const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export default function TodayPage() {
  const { 
    actionStream, loading, 
    toggleHabit, refreshAll,
    toggleTaskComplete, toggleUnitComplete, createScheduledTask
  } = useToday();
  const router = useRouter();

  const [fixedBlocks, setFixedBlocks] = useState([
    { id: '1', title: 'Sleep', start: '23:00', end: '07:00', icon: 'moon' as const },
    { id: '2', title: 'Work', start: '09:00', end: '18:00', icon: 'briefcase' as const },
  ]);
  
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('09:00');
  const [newBlockEnd, setNewBlockEnd] = useState('10:00');
  const [newBlockIcon, setNewBlockIcon] = useState<'briefcase'|'moon'|'barbell'|'cafe'|'book'>('briefcase');

  const goals = useMemo(() => {
    return actionStream.filter(i => i.status === 'PENDING').map(i => ({
      ...i,
      actualDuration: i.duration || i.estimatedMinutes || 30,
      intensity: i.priority === 'HIGH' || i.priority === 'URGENT' ? 'High' : (i.priority === 'LOW' ? 'Low' : 'Mid')
    }));
  }, [actionStream]);

  const scheduleData = useMemo(() => {
    const rawBlocks = fixedBlocks.map(b => ({
      ...b,
      startMinutes: parseTime(b.start),
      endMinutes: parseTime(b.end)
    }));

    const normalized: any[] = [];
    rawBlocks.forEach(b => {
      if (b.endMinutes < b.startMinutes) {
        normalized.push({ ...b, s: 0, e: b.endMinutes });
        normalized.push({ ...b, s: b.startMinutes, e: 1440 });
      } else {
        normalized.push({ ...b, s: b.startMinutes, e: b.endMinutes });
      }
    });

    const sortedBlocks = normalized.sort((a, b) => a.s - b.s);
    
    // Merge
    const merged: any[] = [];
    if (sortedBlocks.length > 0) {
      let current = { s: sortedBlocks[0].s, e: sortedBlocks[0].e };
      for (let i = 1; i < sortedBlocks.length; i++) {
        if (sortedBlocks[i].s <= current.e) { current.e = Math.max(current.e, sortedBlocks[i].e); }
        else { merged.push(current); current = { s: sortedBlocks[i].s, e: sortedBlocks[i].e }; }
      }
      merged.push(current);
    }

    const freeWindows: any[] = [];
    let lastEnd = 0;
    merged.forEach(b => {
      if (b.s > lastEnd) freeWindows.push({ s: lastEnd, e: b.s, d: b.s - lastEnd });
      lastEnd = b.e;
    });
    if (lastEnd < 1440) freeWindows.push({ s: lastEnd, e: 1440, d: 1440 - lastEnd });

    // Allocation
    const filteredGoals = selectedGoalIds.length > 0 
      ? goals.filter(g => selectedGoalIds.includes(g.id))
      : goals;

    const allocated: any[] = [];
    let currentWindowIdx = 0;
    let currentWindow = freeWindows.length > 0 ? { ...freeWindows[0] } : null;

    filteredGoals.forEach(task => {
      let placed = false;
      let buffer = task.intensity === 'High' ? 15 : (task.intensity === 'Mid' ? 5 : 0);
      while (currentWindow && !placed) {
        if (currentWindow.d >= task.actualDuration) {
          allocated.push({ ...task, startTime: currentWindow.s, endTime: currentWindow.s + task.actualDuration });
          currentWindow.s += (task.actualDuration + buffer);
          currentWindow.d -= (task.actualDuration + buffer);
          placed = true;
        } else {
          currentWindowIdx++;
          currentWindow = currentWindowIdx < freeWindows.length ? { ...freeWindows[currentWindowIdx] } : null;
        }
      }
    });

    return { 
      blocks: rawBlocks, 
      allocated, 
      totalFreeMinutes: freeWindows.reduce((acc, w) => acc + w.d, 0)
    };
  }, [fixedBlocks, goals, selectedGoalIds]);

  const handleTimelineClick = (mins: number) => {
    setNewBlockStart(formatTime(mins).split(' ')[0]);
    setNewBlockEnd(formatTime((mins + 60) % 1440).split(' ')[0]);
    setShowAddBlock(true);
  };

  const handleStartMission = (item: any) => {
    router.push({
      pathname: '/mission',
      params: { id: item.id, title: item.title, type: item.type }
    });
  };

  const handleComplete = (item: any) => {
    if (item.type === 'HABIT') toggleHabit(item.id, false);
    else if (item.type === 'PROJECT') toggleTaskComplete(item.id, false);
    else toggleUnitComplete(item.id, false);
    Alert.alert("Success", "Completed!");
  };

  if (loading && actionStream.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[var(--bg-primary)]">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <PerspectiveWrapper>
      <Modal visible={showAddBlock} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-[var(--bg-card)] p-6 rounded-t-3xl border-t border-[var(--border-color)]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-[var(--text-primary)]">Architect Day</Text>
              <TouchableOpacity onPress={() => setShowAddBlock(false)} className="p-2">
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="space-y-6 max-h-[80vh]">
              {/* Objectives Selection */}
              <View>
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Today's Objectives</Text>
                <View className="flex-row flex-wrap gap-2">
                  {goals.map(goal => (
                    <TouchableOpacity 
                      key={goal.id} 
                      onPress={() => setSelectedGoalIds(prev => prev.includes(goal.id) ? prev.filter(id => id !== goal.id) : [...prev, goal.id])}
                      className={`px-4 py-2 rounded-xl border ${selectedGoalIds.includes(goal.id) ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}
                    >
                      <Text className={`text-[10px] font-black ${selectedGoalIds.includes(goal.id) ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{goal.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Block Name</Text>
                <TextInput value={newBlockTitle} onChangeText={setNewBlockTitle} placeholder="e.g., Deep Work" placeholderTextColor="#64748b" className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold" />
              </View>
              
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Start</Text>
                  <TextInput value={newBlockStart} onChangeText={setNewBlockStart} placeholder="09:00" placeholderTextColor="#64748b" className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">End</Text>
                  <TextInput value={newBlockEnd} onChangeText={setNewBlockEnd} placeholder="10:00" placeholderTextColor="#64748b" className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold" />
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Icon</Text>
                <View className="flex-row gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-1.5">
                  {(['briefcase', 'moon', 'barbell', 'cafe', 'book'] as const).map(icon => (
                    <TouchableOpacity key={icon} onPress={() => setNewBlockIcon(icon)} className={`flex-1 p-3 rounded-xl items-center justify-center ${newBlockIcon === icon ? 'bg-[var(--bg-card)]' : ''}`}>
                      <Ionicons name={icon} size={20} color={newBlockIcon === icon ? '#0EA5E9' : '#64748b'} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => {
                  if (newBlockTitle.trim()) {
                    setFixedBlocks(prev => [...prev, { id: Date.now().toString(), title: newBlockTitle, start: newBlockStart, end: newBlockEnd, icon: newBlockIcon }]);
                    setNewBlockTitle('');
                  }
                  setShowAddBlock(false);
                }} 
                className="w-full mt-4 px-6 py-5 bg-[var(--accent-color)] rounded-2xl items-center shadow-lg"
              >
                <Text className="text-[11px] font-black text-white uppercase tracking-widest">Update Schedule</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1 bg-[var(--bg-primary)]" contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>
        <View className="px-6 mb-6">
          <Text className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">Today</Text>
          <Text className="text-xs font-bold text-[var(--text-secondary)] opacity-60">Define your non-negotiable path.</Text>
        </View>

        <SmartTimeline 
          blocks={scheduleData.blocks} 
          onTimeClick={handleTimelineClick} 
          startHour={DAY_START_HOUR} 
        />

        <View className="px-6 mb-10">
          <View className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] shadow-sm">
            <Text className="text-4xl font-black text-[var(--accent-color)] tracking-tighter mb-1">{formatDuration(scheduleData.totalFreeMinutes)}</Text>
            <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Architected Capacity</Text>
          </View>
        </View>

        <View className="px-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-black text-[var(--text-primary)]">Allocated Path</Text>
            {selectedGoalIds.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedGoalIds([])}>
                <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase">Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="space-y-4">
            {scheduleData.allocated.map((task) => (
              <View key={task.id} className="flex-row gap-4">
                <View className="w-14 items-end pt-4">
                  <Text className="text-sm font-black text-[var(--text-primary)]">{formatTime(task.startTime).split(' ')[0]}</Text>
                  <Text className="text-[8px] font-black text-[var(--accent-color)] uppercase mt-0.5">{formatTime(task.startTime).split(' ')[1]}</Text>
                </View>
                <View className="flex-1 p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-sm">
                  <View className="flex-row items-center gap-2 mb-2">
                    {(task.type === 'YOUTUBE' || task.type === 'VIDEO') && <Ionicons name="logo-youtube" size={14} color="#ef4444" />}
                    <Text className="text-base font-black text-[var(--text-primary)] flex-1" numberOfLines={1}>{task.title}</Text>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40">{task.actualDuration}m</Text>
                    </View>
                    
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => handleStartMission(task)} className="flex-row items-center gap-1.5 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                        <Ionicons name="play" size={12} color="#0EA5E9" />
                        <Text className="text-[9px] font-black text-[var(--text-primary)] uppercase">Start</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleComplete(task)} className="p-2.5 bg-emerald-500/10 rounded-xl">
                        <Ionicons name="checkmark" size={16} color="#10b981" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {scheduleData.allocated.length === 0 && (
              <View className="p-12 border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] items-center opacity-30">
                <Ionicons name="list" size={40} color="#64748b" />
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-4">Awaiting Plan Deployment</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </PerspectiveWrapper>
  );
}
