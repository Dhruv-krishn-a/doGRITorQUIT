import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../../db';
import StudyTrack from '../../../db/models/StudyTrack';
import StudyUnit from '../../../db/models/StudyUnit';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { toggleUnitCompletion } from '../../../lib/study-logic';
import { map } from 'rxjs/operators';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface YoutubeDetailProps {
  track: StudyTrack;
  units: StudyUnit[];
}

const YoutubeDetail: React.FC<YoutubeDetailProps> = ({ track, units }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'BOARD' | 'LIST' | 'NOTES' | 'STATS'>('BOARD');
  const [scrollX, setScrollOffset] = useState(0);

  const activeDotIndex = Math.round(scrollX / SCREEN_WIDTH);

  const stats = useMemo(() => {
    const done = units.filter(u => u.status === 'DONE').length;
    const total = units.length;
    const timeSpent = units.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0);
    return { done, total, timeSpent };
  }, [units]);

  const unitsByStatus = useMemo(() => {
    return {
      BACKLOG: units.filter(u => u.status === 'BACKLOG' || !u.status),
      TODAY: units.filter(u => u.status === 'TODAY' || u.status === 'IN_PROGRESS'),
      DONE: units.filter(u => u.status === 'DONE'),
    };
  }, [units]);

  const UnitCard = ({ unit }: { unit: StudyUnit }) => {
    const isDone = unit.status === 'DONE';
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/study/${track.id}/${unit.id}`)}
        activeOpacity={0.7}
        className={`p-6 rounded-[2.5rem] mb-5 border shadow-sm ${
          isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)]'
        }`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${isDone ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
              <Ionicons name="logo-youtube" size={20} color={isDone ? "#10b981" : "#f43f5e"} />
            </View>
            <View className="text-left">
              <Text className={`font-black text-[9px] uppercase tracking-[0.2em] italic ${isDone ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isDone ? 'PROTOCOL RESOLVED' : 'STREAM NODE'}
              </Text>
              <Text className="text-[8px] font-bold text-[var(--text-secondary)] uppercase opacity-40">INGESTION SEQUENCE</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              toggleUnitCompletion(unit.id);
            }}
            className={`w-10 h-10 rounded-xl items-center justify-center ${isDone ? 'bg-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
          >
             <Ionicons name={isDone ? "checkmark-circle" : "checkmark-circle-outline"} size={22} color={isDone ? "#10b981" : colors.textSecondary + '40'} />
          </TouchableOpacity>
        </View>

        <Text className={`font-black text-lg uppercase italic tracking-tight mb-6 text-left ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`} numberOfLines={2}>
          {unit.title}
        </Text>

        <View className="flex-row items-center justify-between pt-6 border-t border-[var(--border-color)]/30">
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
               <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={{ opacity: 0.4 }} />
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase opacity-40 italic">{unit.durationMinutes || 15}M</Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
            <Text className="text-[10px] font-black text-rose-500 uppercase italic">Media Sync</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push(`/study/${track.id}/${unit.id}`)}
            className="flex-row items-center gap-3 px-6 py-3 bg-[var(--text-primary)] rounded-2xl shadow-lg shadow-black/10"
          >
             <Ionicons name="play" size={12} color={colors.primary} />
             <Text className="text-[10px] font-black text-[var(--bg-primary)] uppercase tracking-widest italic">Engage</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      {/* Header Protocol */}
      <View className="pt-16 px-6 pb-6 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 shadow-lg shadow-rose-500/5">
            <Ionicons name="logo-youtube" size={14} color="#f43f5e" />
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 italic">Media Protocol</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
            <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-6 text-left">
          {track.title}
        </Text>
        
        <View className="flex-row items-center gap-4">
          <View className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
            <View className="h-full bg-rose-500 shadow-lg shadow-rose-500/50" style={{ width: `${track.progressPercentage}%` }} />
          </View>
          <Text className="text-[11px] font-black text-rose-500 italic tracking-tighter">{Math.round(track.progressPercentage)}%</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row px-4 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        {(['BOARD', 'LIST', 'NOTES', 'STATS'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
            className={`flex-1 py-5 items-center border-b-2 ${activeTab === tab ? 'border-rose-500' : 'border-transparent'}`}
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest italic ${activeTab === tab ? 'text-rose-500' : 'text-[var(--text-secondary)] opacity-40'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'BOARD' ? (
        <View className="flex-1">
          {/* Board Swipe Visual Cue & Page Dots */}
          <View className="py-4 bg-[var(--bg-primary)] items-center">
             <View className="flex-row gap-2 bg-[var(--bg-secondary)] px-4 py-1.5 rounded-full border border-[var(--border-color)] mb-4">
                <Ionicons name="swap-horizontal" size={10} color={colors.textSecondary} style={{ opacity: 0.4 }} />
                <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic">Swipe to navigate board columns</Text>
             </View>
             
             {/* Pagination Dots */}
             <View className="flex-row gap-2">
                {[0, 1, 2].map((i) => (
                   <View key={i} className={`h-1 rounded-full transition-all ${activeDotIndex === i ? 'w-4 bg-rose-500' : 'w-1 bg-[var(--border-color)]'}`} />
                ))}
             </View>
          </View>
          
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false} 
            className="flex-1"
            onScroll={(e) => setScrollOffset(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            {/* Column: Backlog */}
            <View style={{ width: SCREEN_WIDTH }} className="px-6">
              <View className="flex-row items-center justify-between mb-8">
                 <View className="flex-row items-center gap-3">
                    <View className="w-2 h-6 bg-[var(--border-color)] rounded-full" />
                    <Text className="text-xl font-black italic uppercase tracking-tight text-[var(--text-primary)]">Queued</Text>
                 </View>
                 <View className="bg-[var(--bg-secondary)] px-3 py-1 rounded-lg border border-[var(--border-color)]">
                    <Text className="text-[9px] font-black uppercase text-[var(--text-secondary)] opacity-40 italic">{unitsByStatus.BACKLOG.length} NODES</Text>
                 </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {unitsByStatus.BACKLOG.length === 0 ? (
                  <View className="py-32 items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] opacity-20">
                    <Ionicons name="layers-outline" size={48} color={colors.textSecondary} />
                    <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] italic mt-4">Buffer Empty</Text>
                  </View>
                ) : unitsByStatus.BACKLOG.map(u => <UnitCard key={u.id} unit={u} />)}
              </ScrollView>
            </View>

            {/* Column: Today */}
            <View style={{ width: SCREEN_WIDTH }} className="px-6 bg-rose-500/[0.03]">
              <View className="flex-row items-center justify-between mb-8">
                 <View className="flex-row items-center gap-3">
                    <View className="w-2 h-6 bg-rose-500 rounded-full shadow-lg shadow-rose-500/50" />
                    <Text className="text-xl font-black italic uppercase tracking-tight text-[var(--text-primary)]">Active</Text>
                 </View>
                 <View className="bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                    <Text className="text-[9px] font-black uppercase text-rose-500 italic">{unitsByStatus.TODAY.length} NODES</Text>
                 </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {unitsByStatus.TODAY.length === 0 ? (
                  <View className="py-32 items-center justify-center border-2 border-dashed border-rose-500/20 rounded-[3rem] opacity-20">
                    <Ionicons name="flash-outline" size={48} color="#f43f5e" />
                    <Text className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic mt-4">No Active Targets</Text>
                  </View>
                ) : unitsByStatus.TODAY.map(u => <UnitCard key={u.id} unit={u} />)}
              </ScrollView>
            </View>

            {/* Column: Resolved */}
            <View style={{ width: SCREEN_WIDTH }} className="px-6">
              <View className="flex-row items-center justify-between mb-8">
                 <View className="flex-row items-center gap-3">
                    <View className="w-2 h-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                    <Text className="text-xl font-black italic uppercase tracking-tight text-[var(--text-primary)]">Resolved</Text>
                 </View>
                 <View className="bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <Text className="text-[9px] font-black uppercase text-emerald-500 italic">{unitsByStatus.DONE.length} NODES</Text>
                 </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {unitsByStatus.DONE.length === 0 ? (
                  <View className="py-32 items-center justify-center border-2 border-dashed border-emerald-500/20 rounded-[3rem] opacity-20">
                    <Ionicons name="checkmark-done-outline" size={48} color="#10b981" />
                    <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic mt-4">Clean Slate</Text>
                  </View>
                ) : unitsByStatus.DONE.map(u => <UnitCard key={u.id} unit={u} />)}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'LIST' && (
            <View>
              <View className="flex-row items-center justify-between mb-8 text-left">
                <Text className="text-xl font-black uppercase italic tracking-tight text-[var(--text-primary)]">Stream Inventory</Text>
                <Text className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-40 italic">{stats.done}/{stats.total} Resolved</Text>
              </View>
              {units.sort((a,b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map(u => <UnitCard key={u.id} unit={u} />)}
            </View>
          )}

          {activeTab === 'NOTES' && (
            <View className="bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-xl">
              <View className="flex-row justify-between items-center mb-10 text-left">
                <View className="text-left">
                  <Text className="text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter text-left">Neural Ledger</Text>
                  <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase mt-1 opacity-40 italic tracking-widest text-left">Synthesis of media patterns</Text>
                </View>
                <TouchableOpacity className="p-4 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20">
                  <Ionicons name="save-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <TextInput
                multiline
                placeholder="Record key concepts and structural insights..."
                placeholderTextColor={`${colors.textSecondary}40`}
                className="w-full min-h-[400px] text-lg font-black italic text-[var(--text-primary)] uppercase tracking-tighter"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
          )}

          {activeTab === 'STATS' && (
            <View className="space-y-8">
              <View className="bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border-color)] items-center shadow-xl">
                <Text className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-6 italic opacity-60">Temporal Consumption</Text>
                <Text className="text-6xl font-black text-rose-500 italic tracking-tighter shadow-sm">{Math.round(stats.timeSpent / 60)}H {stats.timeSpent % 60}M</Text>
                <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase mt-6 opacity-30 italic tracking-widest">Total ingestion duration logged</Text>
              </View>

              <View className="flex-row gap-6">
                <View className="flex-1 bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm">
                  <View className="w-12 h-12 bg-rose-500/10 rounded-2xl items-center justify-center mb-6">
                    <Ionicons name="trending-up" size={20} color="#f43f5e" />
                  </View>
                  <Text className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{(stats.done / Math.max(1, stats.total) * 100).toFixed(0)}%</Text>
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-40 italic">Velocity</Text>
                </View>
                <View className="flex-1 bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm">
                  <View className="w-12 h-12 bg-rose-500/10 rounded-2xl items-center justify-center mb-6">
                    <Ionicons name="timer" size={20} color="#f43f5e" />
                  </View>
                  <Text className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{stats.total - stats.done}</Text>
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-40 italic">Remaining</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const EnhancedYoutubeDetail = withObservables(['id'], ({ id }) => ({
  track: database.get<StudyTrack>('study_tracks').query(Q.where('id', id)).observe().pipe(map(rows => rows[0] || null)),
  units: database.get<StudyUnit>('study_units').query(Q.where('track_id', id)).observe(),
}))(({ track, units }: { track: StudyTrack | null, units: StudyUnit[] }) => {
  const { colors } = useTheme();
  const router = useRouter();

  if (!track) {
    return (
      <View className="flex-1 items-center justify-center bg-[var(--bg-primary)] px-8">
        <View className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full items-center justify-center mb-8 border border-[var(--border-color)]">
          <Ionicons name="play-circle-outline" size={40} color={colors.textSecondary} style={{ opacity: 0.2 }} />
        </View>
        <Text className="text-sm font-black uppercase tracking-[0.1em] text-[var(--text-secondary)] text-center leading-relaxed">
          Media sequence not found{'\n'}in local neural archive.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(drawer)/media-tracker')}
          className="mt-10 bg-[var(--accent-color)] px-10 py-5 rounded-2xl shadow-lg shadow-[var(--accent-color)]/20"
        >
          <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg-primary)]">
            Open Registry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <YoutubeDetail track={track} units={units} />;
});

export default function YoutubePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <EnhancedYoutubeDetail id={id} />;
}
