import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { completeVector } from '../lib/execution-logic';

export default function FocusMode() {
  const { id, title, type } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutes default
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Prevent back button
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    if (!user?.id || !id) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      await completeVector(id as string, type as any, user.id);
      router.back();
    } catch (error) {
      console.error("Failed to complete vector:", error);
    }
  };

  const handleAbort = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e1b4b']}
      className="flex-1 items-center justify-center p-8"
    >
      <View className="absolute top-16 items-center">
        <View className="w-12 h-12 rounded-2xl bg-rose-500/20 items-center justify-center border border-rose-500/50 mb-4">
          <Ionicons name="shield-checkmark" size={24} color="#f43f5e" />
        </View>
        <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 animate-pulse">
          Focus Mode Active
        </Text>
      </View>

      <View className="items-center mb-12">
        <Text className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
          Focus Session
        </Text>
        <Text className="text-white text-3xl font-black italic uppercase text-center">
          {title}
        </Text>
      </View>

      <View className="w-64 h-64 rounded-full border-4 border-indigo-500/30 items-center justify-center mb-12">
        <Text className="text-white text-7xl font-black italic tracking-tighter">
          {formatTime(seconds)}
        </Text>
      </View>

      <View className="w-full space-y-4">
        <TouchableOpacity
          onPress={handleComplete}
          className="w-full bg-emerald-500 p-6 rounded-[2rem] items-center shadow-lg shadow-emerald-900/50"
        >
          <Text className="text-white font-black uppercase tracking-[0.2em]">Complete Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAbort}
          className="w-full bg-white/5 p-6 rounded-[2rem] items-center border border-white/10"
        >
          <Text className="text-white/50 font-black uppercase tracking-[0.2em]">Stop Session</Text>
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-12 items-center">
        <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
          Stay focused. Maintain the momentum.
        </Text>
      </View>
    </LinearGradient>
  );
}
