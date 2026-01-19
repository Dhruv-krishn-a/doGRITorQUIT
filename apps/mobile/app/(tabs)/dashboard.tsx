import { View, Text, ScrollView } from 'react-native';
// 1. Import 'styled' from nativewind
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient'; 
import { BlurView } from 'expo-blur';

// 2. Create styled versions of external components
const StyledLinearGradient = styled(LinearGradient);
const StyledBlurView = styled(BlurView);

export default function MobileDashboard() {
  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-6">
           <View>
             <Text className="text-3xl font-bold text-slate-800">Hello, Dhruv</Text>
             <Text className="text-slate-500">Local Mode: Active</Text>
           </View>
           <View className="w-10 h-10 bg-indigo-500 rounded-full" />
        </View>

        {/* Hero Card */}
        <View className="rounded-[30px] overflow-hidden shadow-lg shadow-indigo-200 mb-6">
          {/* Use StyledLinearGradient instead of LinearGradient */}
          <StyledLinearGradient
            colors={['#4f46e5', '#7c3aed']}
            className="p-6 h-48 justify-between"
          >
            <View>
              <Text className="text-white/80 font-bold uppercase text-xs">Focus Time</Text>
              <Text className="text-white text-4xl font-black">4h 20m</Text>
            </View>
            
            {/* Use StyledBlurView instead of BlurView */}
            <StyledBlurView intensity={20} className="overflow-hidden rounded-xl bg-white/20 p-3 flex-row items-center gap-3">
               <Text className="text-white font-bold">Current Streak: 12 Days 🔥</Text>
            </StyledBlurView>
          </StyledLinearGradient>
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
        <Text className="text-amber-600 text-xs mt-1">
          Upgrade to Pro to sync tasks across devices.
        </Text>
      )}
    </View>
  )
}