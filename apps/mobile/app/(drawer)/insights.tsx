import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient'; 
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useSync } from '../../context/SyncContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getWeeklyStats } from '../../lib/analytics-logic';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

const { width } = Dimensions.get('window');

const TIME_RANGES = [
  { label: 'This Week', value: 7 },
  { label: 'This Month', value: 30 },
];

const CATEGORIES = [
  { label: 'All Growth', value: 'ALL', icon: 'pulse' },
  { label: 'Video', value: 'YOUTUBE', icon: 'logo-youtube' },
  { label: 'Strategic', value: 'PLAN', icon: 'map' },
  { label: 'Academic', value: 'COURSE', icon: 'school' },
  { label: 'Building', value: 'PROJECT', icon: 'logo-github' },
];

export default function InsightsHubPage() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [timeRange, setTimeRange] = useState(7);
  const [category, setCategory] = useState('ALL');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWeeklyStats().then(s => {
      setStats(s);
      setLoading(false);
    });
  }, [timeRange, category]);

  const summary = useMemo(() => {
    if (!stats) return { totalTasks: 0, totalHours: 0, growthXp: 0 };
    return {
      totalTasks: stats.totalCompleted || 0,
      totalHours: Math.round((stats.totalFocusMinutes || 0) / 60),
      growthXp: (stats.totalCompleted || 0) * 10
    };
  }, [stats]);

  if (loading && !stats) {
    return (
        <View className="flex-1 bg-[var(--bg-primary)] items-center justify-center">
            <ActivityIndicator size="large" color={colors.accent} />
            <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] mt-6 italic">Analyzing Growth...</Text>
        </View>
    );
  }

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Neural Insights</Text>
          <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Your <Text className="text-[var(--accent-color)]">Growth</Text></Text>
        </View>

        {/* Categories Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-6 px-6">
          <View className="flex-row gap-3">
             {CATEGORIES.map(cat => (
               <TouchableOpacity 
                key={cat.value} 
                onPress={() => setCategory(cat.value)}
                className={`flex-row items-center gap-3 px-6 py-4 rounded-[1.5rem] border ${
                  category === cat.value ? 'bg-[var(--accent-color)] border-transparent shadow-lg shadow-sky-500/20' : 'bg-[var(--bg-card)]/40 border-[var(--border-color)]'
                }`}
               >
                 <Ionicons name={cat.icon as any} size={16} color={category === cat.value ? 'white' : colors.textSecondary} />
                 <Text className={`text-[10px] font-black uppercase tracking-widest ${category === cat.value ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{cat.label}</Text>
               </TouchableOpacity>
             ))}
          </View>
        </ScrollView>

        {/* Summary Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-10">
           {[
             { label: 'Actions Finished', value: summary.totalTasks, icon: 'checkmark-circle', sub: '+12% Velocity' },
             { label: 'Focused Hours', value: summary.totalHours, icon: 'time', sub: 'High Energy' },
             { label: 'Growth Points', value: summary.growthXp, icon: 'sparkles', sub: 'Leveling Up' },
           ].map((item, i) => (
             <View key={i} className="w-[48%] bg-[var(--bg-card)]/40 p-8 rounded-[2.5rem] border border-[var(--border-color)] relative overflow-hidden shadow-sm">
                <Ionicons name={item.icon as any} size={40} color={colors.accent} style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }} />
                <Text className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">{item.label}</Text>
                <Text className="text-3xl font-black italic tracking-tighter text-[var(--text-primary)]">{item.value}</Text>
                <Text className="text-[7px] font-black uppercase text-[var(--accent-color)] mt-3 italic">{item.sub}</Text>
             </View>
           ))}
        </View>

        {/* Momentum Chart */}
        <View className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-xl mb-10">
           <Text className="text-xl font-black italic uppercase tracking-tight text-[var(--text-primary)]">Momentum</Text>
           <Text className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 mt-1 mb-10 italic">Performance Audit</Text>
           
           <View className="h-[180px] w-full flex-row items-end justify-between px-2">
              {stats?.completionData?.map((d: any, i: number) => (
                <View key={i} className="items-center flex-1">
                   <View 
                    className={`w-4 rounded-t-lg ${d.percentage > 70 ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
                    style={{ height: `${Math.max(d.percentage, 8)}%` }}
                   />
                   <Text className="text-[7px] font-black text-[var(--text-secondary)] mt-4 uppercase italic opacity-40">{d.day}</Text>
                </View>
              ))}
           </View>
        </View>

        {/* Consistency */}
        <View className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-xl">
           <Text className="text-xl font-black italic uppercase tracking-tight text-[var(--text-primary)]">Consistency</Text>
           <Text className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 mt-1 mb-8 italic">Habit execution rate</Text>
           
           <View className="space-y-6">
              {stats?.habitStats?.slice(0, 4).map((h: any, i: number) => (
                <View key={i}>
                   <View className="flex-row justify-between mb-2">
                      <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{h.name}</Text>
                      <Text className="text-[9px] font-black italic text-[var(--accent-color)]">{h.rate}%</Text>
                   </View>
                   <View className="h-1 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                      <View className="h-full bg-[var(--accent-color)]" style={{ width: `${h.rate}%` }} />
                   </View>
                </View>
              ))}
           </View>
        </View>

      </ScrollView>
    </View>
  );
}
