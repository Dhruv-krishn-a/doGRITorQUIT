import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Pressable } from 'react-native';
import { useToday } from '../../hooks/useToday';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import SmartTimeline from '../../components/today/SmartTimeline';
import * as Haptics from 'expo-haptics';

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
 toggleTaskComplete, toggleUnitComplete
 } = useToday();
 const router = useRouter();
 const { colors } = useTheme();

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

 const handleStartMission = (item: any) => {
 if (item.type === 'YOUTUBE' || item.type === 'COURSE') {
 const trackId = item.metadata?.trackId as string | undefined;
 if (trackId) {
 router.push(`/study/${trackId}/${item.id}` as any);
 return;
 }
 router.push('/(drawer)/study');
 return;
 }

 if (item.type === 'PROJECT') {
 const planId = item.metadata?.planId as string | undefined;
 if (planId) {
 router.push(`/study/plan/${planId}` as any);
 } else {
 router.push('/(drawer)/project-tracker');
 }
 return;
 }

 if (item.type === 'HABIT') {
 router.push('/(drawer)/checklist');
 return;
 }

 router.push('/(drawer)/study');
 };

 const handleComplete = (item: any) => {
 if (item.type === 'HABIT') toggleHabit(item.id, false);
 else if (item.type === 'PROJECT') toggleTaskComplete(item.id, false);
 else toggleUnitComplete(item.id, false);
 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
 };

 const isOverload = scheduleData.allocated.length > 5;

 return (
 <View className="flex-1 bg-[var(--bg-primary)]">
 <Modal visible={showAddBlock} transparent animationType="slide">
 <View className="flex-1 justify-end bg-black/60">
 <View 
 style={{ backgroundColor: colors.card }}
 className="p-8 rounded-t-[3.5rem] border-t border-[var(--border-color)] "
 >
 <View className="flex-row justify-between items-center mb-8">
 <Text className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Plan My Day</Text>
 <TouchableOpacity onPress={() => setShowAddBlock(false)} className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
 <Ionicons name="close" size={24} color={colors.textSecondary} />
 </TouchableOpacity>
 </View>
 <ScrollView className="space-y-8 max-h-[80vh]" showsVerticalScrollIndicator={false}>
 {/* Objectives Selection */}
 <View className="text-left">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic">Tasks to focus on</Text>
 <View className="flex-row flex-wrap gap-2">
 {goals.map(goal => (
 <TouchableOpacity 
 key={goal.id} 
 onPress={() => setSelectedGoalIds(prev => prev.includes(goal.id) ? prev.filter(id => id !== goal.id) : [...prev, goal.id])}
 className={`px-5 py-3 rounded-2xl border ${selectedGoalIds.includes(goal.id) ? 'bg-[var(--accent-color)] border-[var(--accent-color)] ' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
 >
 <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedGoalIds.includes(goal.id) ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}>{goal.title}</Text>
 </TouchableOpacity>
 ))}
 </View>
 </View>

 <View className="text-left">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 ml-1 italic">Activity Name</Text>
 <TextInput 
 value={newBlockTitle} 
 onChangeText={setNewBlockTitle} 
 placeholder="Work, Study, Gym..." 
 placeholderTextColor={colors.textSecondary + '40'} 
 className="w-full px-6 py-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-primary)] font-black italic uppercase tracking-tight" 
 />
 </View>
 
 <View className="flex-row gap-4">
 <View className="flex-1 text-left">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 ml-1 italic">Window Start</Text>
 <TextInput value={newBlockStart} onChangeText={setNewBlockStart} placeholder="09:00" placeholderTextColor={colors.textSecondary + '40'} className="w-full px-6 py-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-primary)] font-black italic uppercase tracking-tight" />
 </View>
 <View className="flex-1 text-left">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 ml-1 italic">Window End</Text>
 <TextInput value={newBlockEnd} onChangeText={setNewBlockEnd} placeholder="10:00" placeholderTextColor={colors.textSecondary + '40'} className="w-full px-6 py-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl text-[var(--text-primary)] font-black italic uppercase tracking-tight" />
 </View>
 </View>

 <View className="text-left">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic">Select Icon</Text>
 <View className="flex-row gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] p-2">
 {(['briefcase', 'moon', 'barbell', 'cafe', 'book'] as const).map(icon => (
 <TouchableOpacity key={icon} onPress={() => setNewBlockIcon(icon)} className={`flex-1 p-4 rounded-2xl items-center justify-center ${newBlockIcon === icon ? 'bg-[var(--bg-card)] border border-[var(--border-color)] ' : ''}`}>
 <Ionicons name={icon} size={24} color={newBlockIcon === icon ? colors.accent : colors.textSecondary} />
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
 className="w-full mt-4 px-6 py-6 bg-[var(--accent-color)] rounded-3xl items-center "
 >
 <Text className="text-[11px] font-black text-[var(--bg-primary)] uppercase tracking-[0.2em] italic">Save Rhythm</Text>
 </TouchableOpacity>
 </ScrollView>
 </View>
 </View>
 </Modal>

 <ScrollView className="flex-1 bg-[var(--bg-primary)]" contentContainerStyle={{ paddingBottom: 120, paddingTop: 60 }}>
 
 {/* Simplified Header */}
 <View className="px-6 mb-8 text-left flex-row justify-between items-end">
 <View>
 <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Ready to grow?</Text>
 <Text className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">Today</Text>
 </View>
 <TouchableOpacity onPress={() => setShowAddBlock(true)} className="px-6 py-4 bg-[var(--accent-color)] rounded-2xl ">
 <Text className="text-[10px] font-black text-[var(--bg-primary)] uppercase italic">Plan Day</Text>
 </TouchableOpacity>
 </View>

 {/* Day Balance Meter */}
 <View className="px-6 mb-10">
 <View className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 ">
 <View className="flex-row justify-between items-center mb-4">
 <Text className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Your Day Balance</Text>
 <Text className={`text-[9px] font-black uppercase tracking-widest italic ${isOverload ? 'text-rose-500' : 'text-emerald-500'}`}>
 {isOverload ? 'Heavy Load' : 'Balanced'}
 </Text>
 </View>
 <View className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
 <View 
 className={`h-full ${isOverload ? 'bg-rose-500' : 'bg-[var(--accent-color)]'}`}
 style={{ width: `${Math.min(100, (scheduleData.allocated.length / 8) * 100)}%` }} 
 />
 </View>
 <Text className="mt-4 text-[10px] font-bold italic opacity-60 text-[var(--text-secondary)]">
 {isOverload 
 ? "Your day is quite full. Remember to take short breaks." 
 : "You have a great rhythm today. Keep going!"}
 </Text>
 </View>
 </View>

 <View className="px-6 mb-8">
 <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 italic ml-1">Your Rhythm</Text>
 <SmartTimeline 
 blocks={scheduleData.blocks} 
 onTimeClick={() => {}} 
 startHour={DAY_START_HOUR} 
 />
 </View>

 <View className="px-6 mb-10 text-left">
 <View className="p-8 bg-[var(--bg-card)]/50 border border-[var(--border-color)] rounded-[3rem] relative overflow-hidden">
 <Text className="text-5xl font-black text-[var(--text-primary)] tracking-tightest mb-2 italic uppercase">{formatDuration(scheduleData.totalFreeMinutes)}</Text>
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] opacity-40 italic">Available Energy</Text>
 </View>
 </View>

 <View className="px-6">
 <View className="flex-row justify-between items-center mb-8 border-b border-[var(--border-color)] pb-4 text-left">
 <Text className="text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-tight">Your Path</Text>
 {selectedGoalIds.length > 0 && (
 <TouchableOpacity onPress={() => setSelectedGoalIds([])} className="bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--border-color)]">
 <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase italic">Reset</Text>
 </TouchableOpacity>
 )}
 </View>

 <View className="space-y-6">
 {scheduleData.allocated.map((task) => (
 <View key={task.id} className="flex-row gap-6 mb-6">
 <View className="w-16 items-end pt-6">
 <Text className="text-xl font-black text-[var(--text-primary)] tracking-tighter leading-none italic">{formatTime(task.startTime).split(' ')[0]}</Text>
 <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase mt-1 italic">{formatTime(task.startTime).split(' ')[1]}</Text>
 </View>
 <View className="flex-1 p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] relative overflow-hidden group">
 <View className="flex-row items-center gap-3 mb-4 text-left">
 {(task.type === 'YOUTUBE' || task.type === 'VIDEO') && <Ionicons name="logo-youtube" size={16} color="#f43f5e" />}
 <Text className="text-xl font-bold text-[var(--text-primary)] flex-1 uppercase italic tracking-tighter leading-none" numberOfLines={1}>{task.title}</Text>
 </View>
 
 <View className="flex-row items-center justify-between">
 <View className="px-3 py-1.5 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
 <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic">{task.actualDuration}M</Text>
 </View>
 
 <View className="flex-row gap-3">
 <TouchableOpacity onPress={() => handleStartMission(task)} className="flex-row items-center gap-2 px-5 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl active:scale-95 transition-all">
 <Ionicons name="play" size={12} color={colors.accent} />
 <Text className="text-[10px] font-black text-[var(--text-primary)] uppercase italic">Start</Text>
 </TouchableOpacity>
 <TouchableOpacity onPress={() => handleComplete(task)} className="w-12 h-12 bg-emerald-500/10 rounded-2xl items-center justify-center border border-emerald-500/20 active:scale-95 transition-all ">
 <Ionicons name="checkmark" size={24} color="#10b981" />
 </TouchableOpacity>
 </View>
 </View>
 </View>
 </View>
 ))}

 {scheduleData.allocated.length === 0 && (
 <View className="p-20 border-2 border-dashed border-[var(--border-color)] rounded-[3.5rem] items-center justify-center bg-[var(--bg-secondary)]/10 opacity-30">
 <Ionicons name="flash-outline" size={48} color={colors.textSecondary} />
 <Text className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-6 italic text-center leading-relaxed">Ready to build your rhythm</Text>
 </View>
 )}
 </View>
 </View>
 </ScrollView>
 </View>
 );
}
