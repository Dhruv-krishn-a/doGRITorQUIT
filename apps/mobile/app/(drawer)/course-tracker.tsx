import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useStudyHub } from '../../hooks/useStudyHub';
import { useSync } from '../../context/SyncContext';
import { CourseInitModal } from '../../components/study/modals/CourseInitModal';

export default function CourseTrackerPage() {
  const { categorizedTracks, loading, refreshTracks } = useStudyHub();
  const { isSyncing, sync } = useSync();
  const router = useRouter();
  const { colors } = useTheme();
  const [creationVisible, setCreationVisible] = useState(false);

  const courses = categorizedTracks.course;

  useFocusEffect(
    useCallback(() => {
      refreshTracks();
    }, [])
  );

  const onRefresh = () => {
    sync().then(() => refreshTracks());
  };

  const CourseCard = ({ track }: { track: any }) => {
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/study/course/${track.id}` as any)}
        activeOpacity={0.7}
        className="bg-[var(--bg-card)]/40 rounded-[2.5rem] p-8 border border-[var(--border-color)] mb-5 "
      >
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-3xl items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <Ionicons name="school" size={28} color="#d946ef" />
          </View>
          <View className="ml-5 flex-1">
            <Text className="text-[var(--text-primary)] font-black text-xl italic uppercase tracking-tighter leading-tight" numberOfLines={2}>
              {track.title}
            </Text>
            <View className="flex-row items-center mt-4">
              <View className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
                <View 
                  className="h-full rounded-full bg-[#d946ef]  -500/50" 
                  style={{ width: `${track.progressPercentage}%` }} 
                />
              </View>
              <Text className="ml-4 text-[10px] font-black italic tracking-tighter text-fuchsia-500">
                {Math.round(track.progressPercentage)}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl 
            refreshing={isSyncing} 
            onRefresh={onRefresh} 
            tintColor="#d946ef" 
            colors={["#d946ef"]}
          />
        }
      >
        <View className="mb-10 flex-row justify-between items-end">
          <View>
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Academic OS</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
              Courses
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setCreationVisible(true)}
            className="w-14 h-14 bg-[var(--accent-color)] rounded-2xl items-center justify-center  [var(--accent-color)]/20"
          >
            <Ionicons name="add" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading && !isSyncing ? (
          <ActivityIndicator size="large" color="#d946ef" className="py-20" />
        ) : courses.length === 0 ? (
          <View className="py-32 items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] bg-[var(--bg-secondary)]/10">
            <Ionicons name="school-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.2 }} />
            <Text className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest italic mt-4 text-center">No active courses found{'\n'}Initialize your learning</Text>
            <TouchableOpacity 
              onPress={() => setCreationVisible(true)}
              className="mt-8 px-8 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl"
            >
              <Text className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest">Initialize New Course</Text>
            </TouchableOpacity>
          </View>
        ) : (
          courses.map(t => <CourseCard key={t.id} track={t} />)
        )}

        <View className="mt-10 p-10 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-[3.5rem]">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="p-2 bg-fuchsia-500/20 rounded-lg">
              <Ionicons name="book" size={14} color="#d946ef" />
            </View>
            <Text className="text-xs font-black text-fuchsia-500 uppercase tracking-[0.2em] italic">Curriculum Protocol</Text>
          </View>
          <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed opacity-60 italic">
            Course modules and progress metrics are deconstructed into atomic units and broadcasted across the neural network.
          </Text>
        </View>
      </ScrollView>

      <CourseInitModal 
        isVisible={creationVisible} 
        onClose={() => setCreationVisible(false)} 
        onRefresh={onRefresh}
      />
    </View>
  );
}

