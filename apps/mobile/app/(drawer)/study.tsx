import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useStudyHub } from '../../hooks/useStudyHub';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { PathCreationManager } from '../../components/study/PathCreationManager';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { StudyLevelHUD } from '../../components/study/hud/StudyLevelHUD';
import { LoadGauge } from '../../components/study/hud/LoadGauge';
import { ReviewList } from '../../components/study/hud/ReviewList';
import { useSync } from '../../context/SyncContext';

export default function StudyGrowthHub() {
 const { categorizedTracks, loading, refreshTracks } = useStudyHub();
 const { isSyncing, sync } = useSync();
 const { streak, focusTime } = useDashboardStats();
 const router = useRouter();
 const { colors } = useTheme();
 
 // Creation Manager State
 const [creationVisible, setCreationVisible] = useState(false);

 const projectCount = categorizedTracks.project.length;
 const courseCount = categorizedTracks.course.length;
 const mediaCount = categorizedTracks.youtube.length;
 const planCount = categorizedTracks.plan.length;

 const totalActive = projectCount + courseCount + mediaCount + planCount;

 // Mock Data for HUDs (to be replaced with real backend sync later)
 const mockTotalXP = (totalActive * 50) + focusTime * 10;
 const currentLevel = Math.floor(mockTotalXP / 1000) + 1;
 const nextLevelXP = currentLevel * 1000;
 
 const loadPercentage = Math.min(100, (totalActive / 5) * 100);
 const breakdown = {
   plannedLoad: totalActive,
   capacity: 5,
   highEffortUnits: projectCount + courseCount,
   contextSwitches: totalActive,
 };
 const mockRevisions = categorizedTracks.course.map(t => ({ id: t.id + '_rev', title: 'Review Chapter 1', trackId: t.id, track: { title: t.title }, type: 'REVISION' })).slice(0, 2);

 // Simple Balance Logic
 const energyBalance = useMemo(() => {
 if (totalActive === 0) return { label: "Plenty of room", color: "#6366f1", advice: "You have a lot of energy to start something new." };
 if (totalActive <= 2) return { label: "Perfect Balance", color: "#10b981", advice: "Your learning pace is exactly where it should be." };
 if (totalActive <= 4) return { label: "Day is Full", color: "#f59e0b", advice: "You have a lot on your plate. Focus on finishing these." };
 return { label: "Overload Risk", color: "#f43f5e", advice: "Warning: You might feel tired soon. Maybe pause one path?" };
 }, [totalActive]);

 const PillarCard = ({ id, label, sub, count, icon, color, path }: any) => (
 <TouchableOpacity 
 onPress={() => router.push(path)}
 className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-[2.5rem] mb-4 w-[48%] active:scale-95"
 >
 <View className="flex-row justify-between items-start mb-5">
 <View className="p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
 <Ionicons name={icon} size={20} color={colors.accent} />
 </View>
 <View className="items-end">
 <Text className="text-xl font-black italic tracking-tighter text-[var(--text-primary)]">{count}</Text>
 <Text className="text-[8px] font-bold uppercase tracking-widest opacity-40 text-[var(--text-secondary)]">{sub}</Text>
 </View>
 </View>
 <Text className="text-sm font-bold uppercase tracking-tight italic text-[var(--text-primary)]">
 {label}
 </Text>
 </TouchableOpacity>
 );

 return (
 <View className="flex-1 bg-[var(--bg-primary)]">
 <ScrollView
 className="flex-1"
 contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
 showsVerticalScrollIndicator={false}
 refreshControl={
   <RefreshControl 
     refreshing={isSyncing} 
     onRefresh={sync} 
     tintColor={colors.accent} 
     colors={[colors.accent]}
   />
 }
 >
 <View className="mb-10 text-left">
 <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Your Hub</Text>
 <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none mb-6">
 Growth
 </Text>
 
 <StudyLevelHUD 
   totalXP={mockTotalXP} 
   currentLevel={currentLevel} 
   nextLevelXP={nextLevelXP} 
 />
 </View>

 {/* 1. Next Step Focus Card */}
 <TouchableOpacity 
 onPress={() => setCreationVisible(true)}
 className="relative overflow-hidden rounded-[3rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 mb-10 "
 >
 <View className="flex-row items-center gap-6">
 <View className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] items-center justify-center border border-[var(--border-color)]">
 <Ionicons name="rocket" size={32} color={colors.accent} />
 </View>
 <View className="flex-1">
 <Text className="text-xl font-black italic uppercase tracking-tight text-[var(--text-primary)]">Start Something New</Text>
 <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Architect your next journey</Text>
 </View>
 </View>
 </TouchableOpacity>

 {/* 2. Energy Balance & Reviews */}
 <View className="mb-10">
   <LoadGauge loadPercentage={loadPercentage} breakdown={breakdown} />
   <ReviewList revisions={mockRevisions} />
 </View>

 {/* 3. The Four Pillars */}
 <View className="flex-row flex-wrap justify-between">
 <PillarCard id="build" label="Build" sub="Projects" count={projectCount} icon="logo-github" path="/(drawer)/project-tracker" />
 <PillarCard id="learn" label="Learn" sub="Courses" count={courseCount} icon="school" path="/(drawer)/course-tracker" />
 <PillarCard id="watch" label="Watch" sub="Media" count={mediaCount} icon="play-circle" path="/(drawer)/media-tracker" />
 <PillarCard id="plan" label="Plan" sub="Roadmaps" count={planCount} icon="map" path="/(drawer)/roadmap-tracker" />
 </View>

 <TouchableOpacity 
 onPress={() => sync()}
 className="mt-10 py-5 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)] items-center justify-center flex-row gap-3 active:scale-95 transition-all"
 >
 <Ionicons name="sync" size={16} color={colors.textSecondary} />
 <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Refresh Neural Link</Text>
 </TouchableOpacity>

 </ScrollView>

 <PathCreationManager 
 isVisible={creationVisible} 
 onClose={() => setCreationVisible(false)} 
 onRefresh={sync}
 />
 </View>
 );
}
