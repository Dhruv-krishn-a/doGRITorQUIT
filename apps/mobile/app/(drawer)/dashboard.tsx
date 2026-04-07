import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient'; 
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useSync } from '../../context/SyncContext';
import { Ionicons } from '@expo/vector-icons';
import { PerspectiveWrapper } from './_layout';
import { useTheme } from '../../context/ThemeContext';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

export default function MobileDashboard() {
  const { user } = useAuth();
  const { streak, focusTime, loading } = useDashboardStats();
  const { status, lastSyncedAt } = useSync();
  const { colors } = useTheme();

  const formatFocusTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <PerspectiveWrapper>
      <View className="transform-gpu flex-1 bg-[var(--bg-primary)]">
        <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
          
          {/* Header Section */}
          <View className="transform-gpu flex-row justify-between items-center mb-8">
             <View>
               <Text className="transform-gpu text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-1">Atmospheric Scan</Text>
               <Text className="transform-gpu text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
                 {user?.email?.split('@')[0]}
               </Text>
             </View>
             <View className="transform-gpu w-14 h-14 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
                <Ionicons name="finger-print" size={24} color={colors.accent} />
             </View>
          </View>

          {/* Hero Card */}
          <View className="transform-gpu rounded-[2.5rem] overflow-hidden mb-8 border border-[var(--border-color)]">
            <LinearGradient
              colors={[colors.accent, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="transform-gpu p-8 h-56 justify-between"
            >
              <View>
                <Text className="transform-gpu text-[var(--bg-primary)] font-black uppercase tracking-widest text-[10px]">Neural Focus Time</Text>
                <Text className="transform-gpu text-[var(--text-primary)] text-5xl font-black italic tracking-tighter mt-1">
                  {loading ? <ActivityIndicator color={colors.text} /> : formatFocusTime(focusTime)}
                </Text>
              </View>
              
              <View className="transform-gpu overflow-hidden rounded-[2rem] bg-[var(--bg-primary)]/40 p-4 flex-row items-center justify-between border border-white/10">
                 <View className="flex-row items-center">
                    <Ionicons name="flame" size={20} color="#F59E0B" />
                    <Text className="transform-gpu text-[var(--text-primary)] font-black uppercase tracking-widest text-[10px] ml-2">
                      Streak: {streak} Cycles
                    </Text>
                 </View>
                 <Ionicons name="sparkles" size={16} color={colors.accent} />
              </View>
            </LinearGradient>
          </View>

          {/* Sync Status Indicator */}
          <SyncIndicator status={status} lastSyncedAt={lastSyncedAt} />

          {/* Quick Insights */}
          <View className="mt-8">
             <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 ml-1">System Health</Text>
             <View className="flex-row gap-4">
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

        </ScrollView>
      </View>
    </PerspectiveWrapper>
  );
}

function SyncIndicator({ status, lastSyncedAt }: { status: string, lastSyncedAt: Date | null }) {
  const isSyncing = status === 'SYNCING';
  const isError = status === 'ERROR';
  const { colors } = useTheme();

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
          isError ? 'text-rose-500' : isSyncing ? 'text-[var(--accent-color)]' : 'text-mint'
        }`}>
          {isSyncing ? "Neural Link Active..." : 
           isError ? "Link Failure" : 
           `Cloud Sync: ${lastSyncedAt ? 'Operational' : 'Pending'}`}
        </Text>
      </View>
    </View>
  )
}
