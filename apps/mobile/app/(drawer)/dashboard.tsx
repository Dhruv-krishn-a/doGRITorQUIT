import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient'; 
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useSync } from '../../context/SyncContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Line, Polyline, Circle } from 'react-native-svg';
import { getWeeklyStats } from '../../lib/analytics-logic';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48 - 48;
const CHART_HEIGHT = 180;

type Tab = 'OVERVIEW' | 'INSIGHTS';

export default function MobileHome() {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const { user } = useAuth();
  const { streak, focusTime, loading: dashboardLoading } = useDashboardStats();
  const { status, lastSyncedAt } = useSync();
  const { colors } = useTheme();

  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'INSIGHTS') {
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
    <View className="flex-1 bg-[var(--bg-primary)]">
      
      {/* Unified Header */}
        <View className="px-6 pt-16 pb-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
          <View className="flex-row justify-between items-center mb-8">
             <View className="text-left">
               <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-1 italic">Command Center</Text>
               <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
                 {user?.email?.split('@')[0] || 'Member'}
               </Text>
             </View>
             <View className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
                <Ionicons name="finger-print" size={24} color={colors.accent} />
             </View>
          </View>

          {/* Segmented Control */}
          <View className="bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)] flex-row relative h-12">
            {(['OVERVIEW', 'INSIGHTS'] as const).map(tab => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  cssInterop={false}
                  onPress={() => {
                    setActiveTab(tab);
                  }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: isActive ? colors.card : 'transparent',
                    borderWidth: isActive ? 1 : 0,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: '900',
                      letterSpacing: 1.4,
                      color: isActive ? colors.accent : colors.textSecondary,
                    }}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }} 
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          {activeTab === 'OVERVIEW' ? (
            <OverviewSection 
              focusTime={focusTime} 
              streak={streak} 
              loading={dashboardLoading} 
              colors={colors}
              status={status}
              lastSyncedAt={lastSyncedAt}
              formatFocusTime={formatFocusTime}
            />
          ) : (
            <InsightsSection 
              stats={analyticsStats} 
              loading={analyticsLoading} 
              colors={colors} 
            />
          )}
        </ScrollView>
      </View>
  );
}

function OverviewSection({ focusTime, streak, loading, colors, status, lastSyncedAt, formatFocusTime }: any) {
  return (
    <View>
      {/* Hero Card */}
      <View className="rounded-[3rem] overflow-hidden mb-8 border border-[var(--border-color)] shadow-2xl">
        <LinearGradient
          colors={[colors.accent, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-10 h-64 justify-between"
        >
          <View className="text-left">
            <Text className="text-[var(--bg-primary)] font-black uppercase tracking-widest text-[10px] opacity-60">Total Focus Duration</Text>
            <Text className="text-[var(--text-primary)] text-6xl font-black italic tracking-tightest mt-1">
              {loading ? <ActivityIndicator color={colors.text} /> : formatFocusTime(focusTime)}
            </Text>
          </View>
          
          <View className="overflow-hidden rounded-[2rem] bg-[var(--bg-primary)]/40 p-5 flex-row items-center justify-between border border-white/10">
             <View className="flex-row items-center">
                <Ionicons name="flame" size={24} color="#F59E0B" />
                <Text className="transform-gpu text-[var(--text-primary)] font-black uppercase tracking-widest text-[11px] ml-3 italic">
                  Streak: {streak} Cycles
                </Text>
             </View>
             <Ionicons name="sparkles" size={18} color={colors.accent} />
          </View>
        </LinearGradient>
      </View>

      <SyncIndicator status={status} lastSyncedAt={lastSyncedAt} colors={colors} />

      <View className="mt-8 flex-row gap-4">
        <View className="flex-1 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm">
           <Ionicons name="pulse" size={28} color={colors.accent} />
           <Text className="text-[var(--text-primary)] font-black text-2xl italic uppercase mt-3 tracking-tighter">Optimal</Text>
           <Text className="text-[var(--text-secondary)] text-[9px] font-black uppercase tracking-[0.2em] mt-1 opacity-40">System Velocity</Text>
        </View>
        <View className="flex-1 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm">
           <Ionicons name="shield-checkmark" size={28} color="#10B981" />
           <Text className="text-[var(--text-primary)] font-black text-2xl italic uppercase mt-3 tracking-tighter">Secured</Text>
           <Text className="text-[var(--text-secondary)] text-[9px] font-black uppercase tracking-[0.2em] mt-1 opacity-40">Cloud Archive</Text>
        </View>
      </View>
    </View>
  );
}

function InsightsSection({ stats, loading, colors }: any) {
  if (loading || !stats) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
        <Text className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic">Analyzing Activity...</Text>
      </View>
    );
  }

  const points = stats.completionData.map((d: any, i: number) => {
    const x = (i * (CHART_WIDTH / 6));
    const y = CHART_HEIGHT - (d.percentage / 100) * CHART_HEIGHT;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View>
      {/* 1. Completion Chart */}
      <View className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-xl mb-8">
        <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-10 italic">Efficiency Matrix</Text>
        
        <View className="h-[180px] w-full items-center justify-center">
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {[0, 0.25, 0.5, 0.75, 1].map(p => (
              <Line 
                key={p} 
                x1="0" y1={CHART_HEIGHT * p} x2={CHART_WIDTH} y2={CHART_HEIGHT * p} 
                stroke={colors.border} strokeWidth="1" opacity={0.1}
              />
            ))}
            
            <Polyline points={points} fill="none" stroke={colors.accent} strokeWidth="5" strokeLinejoin="round" />
            
            {stats.completionData.map((d: any, i: number) => {
               const x = (i * (CHART_WIDTH / 6));
               const y = CHART_HEIGHT - (d.percentage / 100) * CHART_HEIGHT;
               return (
                 <Circle key={i} cx={x} cy={y} r="5" fill={colors.accent} stroke={colors.primary} strokeWidth="3" />
               );
            })}
          </Svg>
        </View>

        <View className="flex-row justify-between mt-8 px-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} className="text-[9px] font-black text-[var(--text-secondary)] uppercase italic opacity-40">{d}</Text>
          ))}
        </View>
      </View>

      {/* 2. Key Insights Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
        <View className="w-[48%] bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm">
           <Text className="text-[var(--text-secondary)] text-[9px] font-black uppercase tracking-[0.2em] mb-3 italic opacity-40">Progress</Text>
           <Text className="text-[var(--text-primary)] text-4xl font-black italic tracking-tighter">{stats.totalCompleted}</Text>
           <Text className="text-[var(--text-secondary)] text-[8px] font-black uppercase mt-2 tracking-widest">Steps Done</Text>
        </View>
        <View className="w-[48%] bg-[var(--accent-color)] p-8 rounded-[2.5rem] border border-sky-400 shadow-lg shadow-sky-500/20">
           <Text className="text-[var(--bg-primary)]/50 text-[9px] font-black uppercase tracking-[0.2em] mb-3 italic">Stability</Text>
           <Text className="text-[var(--bg-primary)] text-4xl font-black italic tracking-tighter">{stats.habitExecutionCount}</Text>
           <Text className="text-[var(--bg-primary)]/40 text-[8px] font-black uppercase mt-2 tracking-widest">Checklist</Text>
        </View>
      </View>

      {/* 3. Consistency Bar Chart */}
      <View className="bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-xl mb-10">
        <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-10 italic">Performance Audit</Text>
        <View className="flex-row items-end justify-between h-40 px-2">
          {stats.completionData.map((d: any, i: number) => (
            <View key={i} className="items-center">
               <View 
                className={`w-8 rounded-t-xl ${d.percentage > 70 ? 'bg-[var(--accent-color)] shadow-lg shadow-sky-500/30' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
                style={{ height: `${Math.max(d.percentage, 8)}%` }}
               />
               <Text className="text-[8px] font-black text-[var(--text-secondary)] mt-3 uppercase italic opacity-40">{d.day}</Text>
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
    <View className={`p-8 rounded-[2.5rem] border ${
      isError ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]'
    }`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-xl items-center justify-center ${isError ? 'bg-rose-500/20' : 'bg-emerald-500/10'}`}>
            <Ionicons 
              name={isSyncing ? "sync" : isError ? "alert-circle" : "cloud-done"} 
              size={20} 
              color={isError ? "#F43F5E" : isSyncing ? colors.accent : "#10B981"} 
            />
          </View>
          <View className="ml-4">
            <Text className={`font-black uppercase tracking-[0.2em] text-[10px] ${
              isError ? 'text-rose-500' : isSyncing ? 'text-[var(--accent-color)]' : 'text-emerald-500'
            }`}>
              {isSyncing ? "Neural Link Active" : isError ? "Link Failure" : "Cloud Synchronized"}
            </Text>
            <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase mt-1 opacity-40 italic">
              {lastSyncedAt ? `Last Sync: ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Initializing Link...'}
            </Text>
          </View>
        </View>
        {isSyncing && <ActivityIndicator size="small" color={colors.accent} />}
      </View>
    </View>
  )
}
