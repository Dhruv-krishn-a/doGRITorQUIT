import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useStudyHub } from '../../hooks/useStudyHub';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PerspectiveWrapper } from './_layout';
import { useTheme } from '../../context/ThemeContext';
import { PathCreationManager } from '../../components/study/PathCreationManager';

export default function StudyHubPage() {
  const { categorizedTracks, loading, refreshTracks } = useStudyHub();
  const router = useRouter();
  const { colors } = useTheme();
  
  // Creation Manager State
  const [creationVisible, setCreationVisible] = useState(false);

  const TrackCard = ({ track }: { track: any }) => {
    const getRoute = () => {
      if (track.type === 'PLAYLIST') return `/study/youtube/${track.id}`;
      if (track.type === 'COURSE') return `/study/course/${track.id}`;
      if (track.type === 'PROJECT') return `/study/project/${track.id}`;
      if (track.type === 'PLAN') return `/study/plan/${track.id}`;
      return `/study/${track.id}`;
    };

    return (
      <TouchableOpacity 
        onPress={() => router.push(getRoute() as any)}
        className="bg-[var(--bg-secondary)]/40 rounded-[2.5rem] p-6 border border-[var(--border-color)] mb-5 shadow-sm active:scale-[0.98] transition-all"
      >
        <View className="flex-row items-center">
          <View className={`w-16 h-16 rounded-3xl items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm`}>
            <Ionicons 
              name={track.type === 'PLAYLIST' ? 'logo-youtube' : track.type === 'COURSE' ? 'school' : 'rocket'} 
              size={28} 
              color={track.type === 'PLAYLIST' ? '#f43f5e' : track.type === 'COURSE' ? '#d946ef' : colors.accent} 
            />
          </View>
          <View className="ml-5 flex-1">
            <Text className="text-[var(--text-primary)] font-black text-xl italic uppercase tracking-tighter" numberOfLines={1}>{track.title}</Text>
            <View className="flex-row items-center mt-3">
               <View className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
                  <View 
                    className="h-full rounded-full shadow-lg" 
                    style={{ 
                      width: `${track.progressPercentage}%`,
                      backgroundColor: track.type === 'PLAYLIST' ? '#f43f5e' : track.type === 'COURSE' ? '#d946ef' : colors.accent
                    }} 
                  />
               </View>
               <Text className={`ml-4 text-xs font-black italic tracking-tighter`} style={{ color: track.type === 'PLAYLIST' ? '#f43f5e' : track.type === 'COURSE' ? '#d946ef' : colors.accent }}>
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
    <PerspectiveWrapper>
      <View className="flex-1 bg-[var(--bg-primary)]">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10 text-left">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Your Journey</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none">
              Paths
            </Text>
          </View>

          <View className="flex-row gap-5 mb-12">
            <View className="flex-1 bg-[var(--bg-card)]/50 p-6 rounded-[2.5rem] border border-[var(--border-color)] items-center justify-center shadow-sm">
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 italic">Active Paths</Text>
               <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">{Object.values(categorizedTracks).flat().length}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setCreationVisible(true)}
              className="w-24 h-24 bg-[var(--accent-color)] rounded-[3rem] items-center justify-center shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
            >
              <Ionicons name="add" size={40} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loading && Object.values(categorizedTracks).every(arr => arr.length === 0) ? (
            <ActivityIndicator size="large" color={colors.accent} className="mt-10" />
          ) : (
            <>
              {[
                { key: 'PLAYLIST', data: categorizedTracks.youtube, label: 'Media Paths', color: '#f43f5e' },
                { key: 'COURSE', data: categorizedTracks.course, label: 'Learning Paths', color: '#d946ef' },
                { key: 'PROJECT', data: categorizedTracks.project, label: 'Project Paths', color: colors.accent }
              ].map((section) => (
                <View key={section.key} className="mb-10">
                  <View className="flex-row items-center gap-3 mb-5 ml-1">
                     <View className="w-1 h-4 rounded-full" style={{ backgroundColor: section.color }} />
                     <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic">{section.label}</Text>
                  </View>
                  
                  {section.data.length > 0 ? (
                    section.data.map(t => <TrackCard key={t.id} track={t} />)
                  ) : (
                    <View className="p-10 bg-[var(--bg-secondary)]/20 rounded-[2.5rem] border-2 border-dashed border-[var(--border-color)] items-center justify-center">
                      <Ionicons name="layers-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.2, marginBottom: 12 }} />
                      <Text className="text-[10px] font-black text-[var(--text-secondary)]/40 uppercase italic tracking-widest text-center">Nothing here</Text>
                    </View>
                  )}
                </View>
              ))}
            </>
          )}
        </ScrollView>

        <PathCreationManager 
          isVisible={creationVisible} 
          onClose={() => setCreationVisible(false)} 
          onRefresh={refreshTracks}
        />
      </View>
    </PerspectiveWrapper>
  );
}
