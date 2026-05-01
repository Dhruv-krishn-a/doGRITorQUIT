import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useStudyHub } from '../../hooks/useStudyHub';

export default function RoadmapTrackerPage() {
  const { categorizedTracks, loading, refreshTracks } = useStudyHub();
  const router = useRouter();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTracks();
    setRefreshing(false);
  };

  const roadmaps = categorizedTracks.plan;

  const RoadmapCard = ({ track }: { track: any }) => {
    return (
      <TouchableOpacity 
        onPress={() => {
            if (track.isRemotePlan) {
                router.push('/(drawer)/planner');
            } else {
                router.push(`/study/plan/${track.id}` as any);
            }
        }}
        className="bg-[var(--bg-secondary)]/40 rounded-[2.5rem] p-6 border border-[var(--border-color)] mb-5 active:scale-[0.98]"
      >
        <View className="flex-row items-center">
          <View className={`w-16 h-16 rounded-3xl items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)]`}>
            <Ionicons name="map" size={28} color="#38bdf8" />
          </View>
          <View className="ml-5 flex-1">
            <Text className="text-[var(--text-primary)] font-black text-xl italic uppercase tracking-tighter" numberOfLines={1}>{track.title}</Text>
            <View className="flex-row items-center mt-3">
               <View className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
                  <View 
                    className="h-full rounded-full bg-[#38bdf8]" 
                    style={{ width: `${track.progressPercentage}%` }} 
                  />
               </View>
               <Text className="ml-4 text-xs font-black italic tracking-tighter text-[#38bdf8]">
                 {Math.round(track.progressPercentage)}%
               </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ opacity: 0.3 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
      >
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Strategic Maps</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
              Roadmaps
            </Text>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#38bdf8" className="py-20" />
          ) : roadmaps.length === 0 ? (
            <View className="py-20 items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] bg-[var(--bg-secondary)]/10">
               <Ionicons name="map-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.2 }} />
               <Text className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest italic mt-4">No active roadmaps</Text>
            </View>
          ) : (
            roadmaps.map(t => <RoadmapCard key={t.id} track={t} />)
          )}
      </ScrollView>
    </View>
  );
}
