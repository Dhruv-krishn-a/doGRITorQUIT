import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withRepeat, withSequence } from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';

interface StudyLevelHUDProps {
  totalXP: number;
  currentLevel: number;
  nextLevelXP: number;
}

export function StudyLevelHUD({ totalXP, currentLevel, nextLevelXP }: StudyLevelHUDProps) {
  const { colors } = useTheme();
  const xpProgress = Math.min(100, (totalXP / Math.max(1, nextLevelXP)) * 100);

  // Animations
  const progressWidth = useSharedValue(0);
  const badgeScale = useSharedValue(0.9);
  
  useEffect(() => {
    progressWidth.value = withTiming(xpProgress, { duration: 1500 });
    badgeScale.value = withSpring(1, { damping: 10, stiffness: 100 });
  }, [xpProgress]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const animatedBadgeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: badgeScale.value }, { rotate: '-3deg' }],
    };
  });

  return (
    <View className="bg-[var(--bg-secondary)]/30 rounded-[3rem] p-6 md:p-8 border border-[var(--border-color)] mb-10 overflow-hidden relative">
      {/* Background decoration */}
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent-color)] rounded-full opacity-5 blur-[40px]" />
      
      <View className="flex-row items-center justify-between mb-8 z-10">
        <View className="flex-row items-center gap-6">
          {/* Level Badge Orb */}
          <Animated.View 
            className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-[2.5rem] border-4 border-[var(--bg-primary)] items-center justify-center relative overflow-hidden"
            style={animatedBadgeStyle}
          >
            <View className="absolute inset-0 bg-white/20 skew-x-12 translate-x-4" />
            <Text className="text-4xl font-black text-white italic tracking-tighter shadow-sm">{currentLevel}</Text>
            <View className="absolute -bottom-2 -right-2 bg-[var(--bg-primary)] p-1.5 rounded-xl border border-[var(--border-color)]">
              <Ionicons name="trophy" size={12} color={colors.accent} />
            </View>
          </Animated.View>

          <View>
            <View className="flex-row items-center gap-2 bg-[var(--accent-color)]/10 px-3 py-1 rounded-lg self-start mb-2 border border-[var(--accent-color)]/20">
              <Ionicons name="flash" size={10} color={colors.accent} />
              <Text className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-color)]">Learning Rank</Text>
            </View>
            <Text className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Advanced</Text>
            <Text className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Tier</Text>
          </View>
        </View>

        <View className="items-end hidden sm:flex">
          <View className="flex-row items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
             <Ionicons name="checkmark-circle" size={14} color="#10b981" />
             <Text className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Goal Reached</Text>
          </View>
        </View>
      </View>

      {/* XP Bar Section */}
      <View className="z-10">
        <View className="flex-row justify-between items-end mb-3 px-1">
          <View>
            <Text className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">Current Points</Text>
            <Text className="text-lg font-black text-[var(--text-primary)] tracking-tighter italic">{totalXP.toLocaleString()} XP</Text>
          </View>
          <View className="items-end">
            <Text className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-color)] opacity-80">Next Level</Text>
            <Text className="text-lg font-black text-[var(--text-primary)] tracking-tighter italic">{Math.round(nextLevelXP - totalXP).toLocaleString()} XP</Text>
          </View>
        </View>
        
        <View className="h-4 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
          <Animated.View 
            className="h-full bg-[var(--accent-color)] rounded-full"
            style={animatedProgressStyle}
          />
        </View>
      </View>
    </View>
  );
}
