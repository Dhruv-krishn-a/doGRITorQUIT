import { View, Text, ScrollView } from 'react-native';
// 1. Change Import: 'styled' is gone, use 'cssInterop'
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient'; 
import { BlurView } from 'expo-blur';

// 2. "Teach" external components to handle className
// We map the 'className' prop to the 'style' prop
cssInterop(LinearGradient, {
  className: 'style',
});

cssInterop(BlurView, {
  className: 'style',
});

export default function MobileDashboard() {
  return (
    <View className="transform-gpu flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header Section */}
        <View className="transform-gpu flex-row justify-between items-center mb-6">
           <View>
             <Text className="transform-gpu text-3xl font-bold text-slate-800">Hello, Dhruv</Text>
             <Text className="transform-gpu text-slate-500">Local Mode: Active</Text>
           </View>
           <View className="transform-gpu w-10 h-10 bg-indigo-500 rounded-full" />
        </View>

        {/* Hero Card */}
        <View className="transform-gpu rounded-[30px] overflow-hidden shadow-lg shadow-indigo-200 mb-6">
          {/* 3. Use the ORIGINAL component directly with className */}
          <LinearGradient
            colors={['#4f46e5', '#7c3aed']}
            className="transform-gpu p-6 h-48 justify-between"
          >
            <View>
              <Text className="transform-gpu text-white/80 font-bold uppercase text-xs">Focus Time</Text>
              <Text className="transform-gpu text-white text-4xl font-bold">4h 20m</Text>
            </View>
            
            {/* Use the ORIGINAL component directly */}
            <BlurView intensity={20} className="transform-gpu overflow-hidden rounded-xl bg-white/20 p-3 flex-row items-center gap-3">
               <Text className="transform-gpu text-white font-bold">Current Streak: 12 Days 🔥</Text>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Sync Status Indicator */}
        <SyncIndicator />

      </ScrollView>
    </View>
  );
}

function SyncIndicator() {
  const isPro = false; 

  return (
    <View className={`p-4 rounded-xl border ${isPro ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <Text className={`font-bold ${isPro ? 'text-green-700' : 'text-amber-700'}`}>
        {isPro ? "☁️ Cloud Sync Active" : "💾 Local Storage Only"}
      </Text>
      {!isPro && (
        <Text className="transform-gpu text-amber-600 text-xs mt-1">
          Upgrade to Pro to sync tasks across devices.
        </Text>
      )}
    </View>
  )
}