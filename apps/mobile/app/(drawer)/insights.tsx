import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useSync } from '../../context/SyncContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Polyline, Circle } from 'react-native-svg';
import { PerspectiveWrapper } from './_layout';
import { getWeeklyStats } from '../../lib/analytics-logic';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48 - 48;
const CHART_HEIGHT = 180;

type Tab = 'dashboard' | 'analytics';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { user } = useAuth();
  const { colors } = useTheme();
  const { streak, focusTime, loading: dashboardLoading } = useDashboardStats();
  const { status, lastSyncedAt } = useSync();
  
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'analytics') {
      setAnalyticsLoading(true);
      getWeeklyStats().then(s => {
        setAnalyticsStats(s);
        setAnalyticsLoading(false);
      });
    }
  }, [activeTab]);

  const formatFocusTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <PerspectiveWrapper>
      <View className="flex-1 bg-[var(--bg-primary)]">
        {/* Header with Segmented Tab */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row justify-between items-end mb-6">
            <View>
              <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-1">Neural Hub</Text>
              <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Insights</Text>
            </View>
            <View className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
              <Ionicons name="stats-chart" size={20} color={colors.accent} />
            </View>
          </View>

          <View className="bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)] flex-row relative h-12">
            <TouchableOpacity 
              onPress={() => setActiveTab('dashboard')}
              className={`flex-1 items-center justify-center rounded-xl ${activeTab === 'dashboard' ? 'bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'dashboard' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('analytics')}
              className={`flex-1 items-center justify-center rounded-xl ${activeTab === 'analytics' ? 'bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'analytics' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'dashboard' ? (
            <DashboardView 
              user={user} 
              focusTime={focusTime} 
              streak={streak} 
              loading={dashboardLoading} 
              colors={colors}
              status={status}
              lastSyncedAt={lastSyncedAt}
              formatFocusTime={formatFocusTime}
            />
          ) : (
            <AnalyticsView 
              stats={analyticsStats} 
              loading={analyticsLoading} 
              colors={colors} 
            />
          )}
        </ScrollView>
      </View>
    </PerspectiveWrapper>
  );
}

function DashboardView({ user, focusTime, streak, loading, colors, status, lastSyncedAt, formatFocusTime }: any) {
  return (
    <View className="mt-4">
      {/* Hero Card */}
      <View className="rounded-[2.5rem] overflow-hidden mb-8 border border-[var(--border-color)]">
        <LinearGradient
          colors={[colors.accent, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-8 h-56 justify-between"
        >
          <View>
            <Text className="text-[var(--bg-primary)] font-black uppercase tracking-widest text-[10px]">Neural Focus Time</Text>
            <Text className="text-[var(--text-primary)] text-5xl font-black italic tracking-tighter mt-1">
              {loading ? <ActivityIndicator color={colors.text} /> : formatFocusTime(focusTime)}
            </Text>
          </View>
          
          <View className="overflow-hidden rounded-[2rem] bg-[var(--bg-primary)]/40 p-4 flex-row items-center justify-between border border-white/10">
             <View className="flex-row items-center">
                <Ionicons name="flame" size={20} color="#F59E0B" />
                <Text className="text-[var(--text-primary)] font-black uppercase tracking-widest text-[10px] ml-2">
                  Streak: {streak} Cycles
                </Text>
             </View>
             <Ionicons name="sparkles" size={16} color={colors.accent} />
          </View>
        </LinearGradient>
      </View>

      <SyncIndicator status={status} lastSyncedAt={lastSyncedAt} colors={colors} />

      <View className="mt-8 flex-row gap-4">
        <View className="flex-1 bg-[var(--bg-secondary)]/30 p-6 rounded-[2rem] border border-[var(--border-color)]">
           <Ionicons name="pulse" size={24} color={colors.accent} />
           <Text className="text-[var(--text-primary)] font-black text-xl italic uppercase mt-2">Optimal</Text>
           <Text className="text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-widest">Velocity</Text>
        </View>
        <View className="flex-1 bg-[var(--bg-secondary)]/30 p-6 rounded-[2rem] border border-[var(--border-color)]">
           <Ionicons name="shield-checkmark" size={24} color="#10B981" />
           <Text className="text-[var(--text-primary)] font-black text-xl italic uppercase mt-2">Secured</Text>
           <Text className="text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-widest">Neural Link</Text>
        </View>
      </View>
    </View>
  );
}

function AnalyticsView({ stats, loading, colors }: any) {
  if (loading || !stats) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
        <Text className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Streaming Data...</Text>
      </View>
    );
  }

  const points = stats.completionData.map((d: any, i: number) => {
    const x = (i * (CHART_WIDTH / 6));
    const y = CHART_HEIGHT - (d.percentage / 100) * CHART_HEIGHT;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View className="mt-4">
      {/* 1. Neural Velocity Chart */}
      <View className="bg-[var(--bg-secondary)]/30 p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm mb-8">
        <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-6">Neural Velocity</Text>
        
        <View className="h-[180px] w-full items-center justify-center">
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {[0, 0.25, 0.5, 0.75, 1].map(p => (
              <Line 
                key={p} 
                x1="0" y1={CHART_HEIGHT * p} x2={CHART_WIDTH} y2={CHART_HEIGHT * p} 
                stroke={colors.border} strokeWidth="1" opacity={0.2}
              />
            ))}
            
            <Polyline points={points} fill="none" stroke={colors.accent} strokeWidth="4" strokeLinejoin="round" />
            
            {stats.completionData.map((d: any, i: number) => {
               const x = (i * (CHART_WIDTH / 6));
               const y = CHART_HEIGHT - (d.percentage / 100) * CHART_HEIGHT;
               return (
                 <Circle key={i} cx={x} cy={y} r="4" fill={colors.accent} stroke={colors.primary} strokeWidth="2" />
               );
            })}
          </Svg>
        </View>

        <View className="flex-row justify-between mt-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} className="text-[8px] font-black text-[var(--text-secondary)] uppercase">{d}</Text>
          ))}
        </View>
      </View>

      {/* 2. Key Insights Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
        <View className="w-[48%] bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-color)]">
           <Text className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest mb-2">Completion</Text>
           <Text className="text-[var(--text-primary)] text-3xl font-black italic">{stats.totalCompleted}</Text>
           <Text className="text-[var(--text-secondary)] text-[8px] font-bold uppercase mt-1">Vectors Done</Text>
        </View>
        <View className="w-[48%] bg-[var(--accent-color)] p-6 rounded-[2rem] border border-sky-400">
           <Text className="text-[var(--bg-primary)]/50 text-[10px] font-black uppercase tracking-widest mb-2">Consistency</Text>
           <Text className="text-[var(--bg-primary)] text-3xl font-black italic">{stats.habitExecutionCount}</Text>
           <Text className="text-[var(--bg-primary)]/40 text-[8px] font-bold uppercase mt-1">Habit Pulse</Text>
        </View>
      </View>

      {/* 3. Consistency Audit */}
      <View className="bg-[var(--bg-secondary)]/30 p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm mb-10">
        <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-6">Consistency Audit</Text>
        <View className="flex-row items-end justify-between h-40 px-2">
          {stats.completionData.map((d: any, i: number) => (
            <View key={i} className="items-center">
               <View 
                className={`w-8 rounded-t-xl ${d.percentage > 70 ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-secondary)]'}`}
                style={{ height: `${Math.max(d.percentage, 5)}%` }}
               />
               <Text className="text-[8px] font-black text-[var(--text-secondary)] mt-2 uppercase">{d.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function SyncIndicator({ status, lastSyncedAt, colors }: any) {
  const isSyncing = status === 'SYNCING';
  const isError = status === 'ERROR';

  return (
    <View className={`p-6 rounded-[2rem] border ${
      isError ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]'
    }`}>
      <View className="flex-row items-center">
        <Ionicons 
          name={isSyncing ? "sync" : isError ? "alert-circle" : "cloud-done"} 
          size={20} 
          color={isError ? "#F43F5E" : isSyncing ? colors.accent : "#10B981"} 
        />
        <Text className={`font-black uppercase tracking-widest text-[10px] ml-3 ${
          isError ? 'text-rose-500' : isSyncing ? 'text-[var(--accent-color)]' : 'text-emerald-500'
        }`}>
          {isSyncing ? "Neural Link Active..." : 
           isError ? "Link Failure" : 
           `Cloud Sync: ${lastSyncedAt ? 'Operational' : 'Pending'}`}
        </Text>
      </View>
    </View>
  )
}
