import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

interface LoadGaugeProps {
  loadPercentage: number;
  breakdown?: {
    plannedLoad: number;
    capacity: number;
    highEffortUnits: number;
    contextSwitches: number;
  };
}

export function LoadGauge({ loadPercentage, breakdown }: LoadGaugeProps) {
  const { colors } = useTheme();
  const [showDetails, setShowDetails] = React.useState(false);
  
  const isHighLoad = loadPercentage > 90;
  const isMediumLoad = loadPercentage > 70;
  
  const loadColor = isHighLoad ? '#f43f5e' : isMediumLoad ? '#ec4899' : '#d946ef';

  return (
    <TouchableOpacity 
      onPress={() => setShowDetails(!showDetails)}
      activeOpacity={0.9}
      className="bg-[var(--bg-card)] rounded-[3rem] p-6 md:p-8 border border-[var(--border-color)] flex-col items-center justify-center mb-10 overflow-hidden relative min-h-[300px]"
    >
      <View className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
      
      {showDetails && breakdown ? (
        <View className="w-full">
           <View className="flex-row items-center justify-center gap-2 mb-6">
             <Ionicons name="pulse" size={14} color="#ec4899" />
             <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] italic">Study Capacity</Text>
           </View>
           
           <View className="space-y-4">
             <View className="flex-row justify-between items-center bg-[var(--bg-secondary)]/50 p-4 rounded-[1.5rem] border border-[var(--border-color)]">
               <View className="flex-row items-center gap-3">
                 <View className="p-2 bg-rose-500/10 rounded-xl">
                  <Ionicons name="hardware-chip" size={16} color="#f43f5e" />
                 </View>
                 <Text className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Total Workload</Text>
               </View>
               <Text className="font-black text-[var(--text-primary)] text-sm">{breakdown.plannedLoad} / {breakdown.capacity}</Text>
             </View>

             <View className="flex-row justify-between items-center bg-[var(--bg-secondary)]/50 p-4 rounded-[1.5rem] border border-[var(--border-color)]">
               <View className="flex-row items-center gap-3">
                 <View className="p-2 bg-amber-500/10 rounded-xl">
                  <Ionicons name="flash" size={16} color="#f59e0b" />
                 </View>
                 <Text className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Difficult Tasks</Text>
               </View>
               <Text className="font-black text-[var(--text-primary)] text-sm">{breakdown.highEffortUnits} Items</Text>
             </View>

             <View className="flex-row justify-between items-center bg-[var(--bg-secondary)]/50 p-4 rounded-[1.5rem] border border-[var(--border-color)]">
               <View className="flex-row items-center gap-3">
                 <View className="p-2 bg-indigo-500/10 rounded-xl">
                  <Ionicons name="layers" size={16} color="#6366f1" />
                 </View>
                 <Text className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Active Tracks</Text>
               </View>
               <Text className="font-black text-[var(--text-primary)] text-sm">{breakdown.contextSwitches} Tracks</Text>
             </View>
           </View>

           <View className="mt-8 flex-row items-center justify-center gap-2 opacity-50">
             <Ionicons name="refresh" size={12} color={colors.textSecondary} />
             <Text className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Tap to reveal gauge</Text>
           </View>
        </View>
      ) : (
        <View className="items-center w-full">
          <View className="absolute top-2 left-2 flex-row items-center gap-2">
            <View className="bg-pink-500/20 p-2 rounded-xl border border-pink-500/30">
              <Ionicons name="pulse" size={12} color="#ec4899" />
            </View>
            <Text className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Study Load</Text>
          </View>

          <View className="w-48 h-48 items-center justify-center relative mt-6 mb-6">
            {/* Simplified Gauge Ring - SVG requires expo-svg or similar, using CSS circles for React Native */}
            <View className="absolute inset-0 rounded-full border-[12px] border-[var(--bg-secondary)]" />
            <View className="absolute inset-0 rounded-full border-[12px] border-transparent border-t-[var(--accent-color)] border-r-[var(--accent-color)] rotate-45" style={{ borderColor: loadColor, opacity: loadPercentage / 100 }} />
            
            <View className="items-center justify-center pt-2">
              <View className="flex-row items-start gap-1">
                <Text className="text-6xl font-black tracking-tighter leading-none" style={{ color: loadColor }}>{Math.round(loadPercentage)}</Text>
                <Text className="text-xl font-black mt-1 opacity-80" style={{ color: loadColor }}>%</Text>
              </View>
              <Text className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mt-2 opacity-60">Status</Text>
            </View>
          </View>

          <View className="items-center mt-4">
             <Text className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-2 italic">Daily Health</Text>
             <Text className="text-[9px] font-bold text-[var(--text-secondary)] text-center max-w-[200px] leading-relaxed uppercase tracking-widest opacity-80">
               {isHighLoad ? 'Pushing the limits of neural retention.' : 'Studying at an optimal pace for your goals.'}
             </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
