import React from 'react';
import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'expo-router';

interface ReviewListProps {
  revisions: any[]; // Replace with correct type
}

export function ReviewList({ revisions }: ReviewListProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View className="bg-[var(--bg-card)]/40 rounded-[3rem] border border-[var(--border-color)] p-8 mb-10 flex-1 relative overflow-hidden min-h-[300px]">
      <View className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-color)]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

      <View className="flex-row items-center justify-between mb-8 z-10">
        <View className="flex-row items-center gap-4">
          <View className="p-3 bg-[var(--accent-color)]/20 rounded-2xl border border-[var(--accent-color)]/30">
            <Ionicons name="time" size={18} color={colors.accent} />
          </View>
          <View>
            <Text className="text-sm font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Review Pipeline</Text>
            <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1 opacity-60">Pending Sync</Text>
          </View>
        </View>
        
        {revisions && revisions.length > 0 && (
          <View className="bg-[var(--accent-color)]/10 px-3 py-1.5 rounded-xl border border-[var(--accent-color)]/20 flex-row items-center gap-1.5">
            <Ionicons name="sparkles" size={10} color={colors.accent} />
            <Text className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] italic">{revisions.length} Due</Text>
          </View>
        )}
      </View>

      <View className="flex-1 z-10">
        {revisions && revisions.length > 0 ? (
          revisions.map((unit, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => router.push(`/study/${unit.trackId}/${unit.id}`)}
              className="bg-[var(--bg-secondary)]/40 border border-[var(--border-color)] p-5 rounded-[1.5rem] mb-3 flex-row justify-between items-center"
            >
              <View className="flex-1 mr-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="bg-[var(--accent-color)]/10 px-2 py-1 rounded-md border border-[var(--accent-color)]/20">
                    <Text className="text-[7px] font-black uppercase tracking-widest text-[var(--accent-color)] italic">Review</Text>
                  </View>
                  <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 truncate">
                    {unit.track?.title || 'Unknown Track'}
                  </Text>
                </View>
                <Text className="text-base font-black text-[var(--text-primary)] uppercase italic tracking-tight" numberOfLines={1}>
                  {unit.title}
                </Text>
              </View>
              <View className="w-10 h-10 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] items-center justify-center">
                <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center p-6 opacity-80">
            <View className="bg-[var(--bg-secondary)] p-8 rounded-[3rem] border border-[var(--border-color)] mb-6">
              <Ionicons name="hardware-chip-outline" size={40} color={colors.border} />
            </View>
            <Text className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-2 italic">Buffer Empty</Text>
            <Text className="text-[9px] font-bold text-[var(--text-secondary)] text-center uppercase tracking-widest max-w-[200px] leading-relaxed opacity-60 italic">
              All knowledge successfully integrated into long-term memory.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
