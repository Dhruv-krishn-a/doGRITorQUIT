import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { getWeeklyStats } from '../../lib/analytics-logic';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { PerspectiveWrapper } from './_layout';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48 - 48; // Account for padding
const CHART_HEIGHT = 180;

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyStats().then(s => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PerspectiveWrapper>
        <View className="flex-1 items-center justify-center bg-[var(--bg-primary)]">
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Processing Streams...</Text>
        </View>
      </PerspectiveWrapper>
    );
  }

  // Velocity Polyline points
  const points = stats.completionData.map((d: any, i: number) => {
    const x = (i * (CHART_WIDTH / 6));
    const y = CHART_HEIGHT - (d.percentage / 100) * CHART_HEIGHT;
    return `${x},${y}`;
  }).join(' ');

  return (
    <PerspectiveWrapper>
      <ScrollView className="flex-1 bg-[var(--bg-primary)]" contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2">Performance Data</Text>
          <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
            Insights
          </Text>
        </View>

        {/* 1. Neural Velocity Chart */}
        <View className="bg-[var(--bg-secondary)]/30 p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm mb-8">
          <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-6">Neural Velocity</Text>
          
          <View className="h-[180px] w-full items-center justify-center">
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(p => (
                <Line 
                  key={p} 
                  x1="0" y1={CHART_HEIGHT * p} x2={CHART_WIDTH} y2={CHART_HEIGHT * p} 
                  stroke="#1e293b" strokeWidth="1" 
                />
              ))}
              
              <Polyline
                points={points}
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              
              {stats.completionData.map((d: any, i: number) => {
                 const x = (i * (CHART_WIDTH / 6));
                 const y = CHART_HEIGHT - (d.percentage / 100) * CHART_HEIGHT;
                 return (
                   <Circle key={i} cx={x} cy={y} r="4" fill="#0EA5E9" stroke="#0B0F19" strokeWidth="2" />
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
          <View className="w-[48%] bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-lg">
             <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">Completion</Text>
             <Text className="text-[var(--text-primary)] text-3xl font-black italic">{stats.totalCompleted}</Text>
             <Text className="text-[var(--text-secondary)] text-[8px] font-bold uppercase mt-1">Vectors Executed</Text>
          </View>
          <View className="w-[48%] bg-[var(--accent-color)] p-6 rounded-[2rem] border border-sky-400 shadow-lg">
             <Text className="text-[var(--bg-primary)]/50 text-[10px] font-black uppercase tracking-widest mb-2">Consistency</Text>
             <Text className="text-[var(--bg-primary)] text-3xl font-black italic">{stats.habitExecutionCount}</Text>
             <Text className="text-[var(--bg-primary)]/40 text-[8px] font-bold uppercase mt-1">Habit Log Pulse</Text>
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
      </ScrollView>
    </PerspectiveWrapper>
  );
}
