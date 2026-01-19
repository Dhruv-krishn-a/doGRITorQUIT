import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';

// Services
import { ConfigService } from '../services/ConfigService';
import { performSync } from '../services/SyncServices'; // Note: Matches your file tree name

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("📱 App Booting...");

        // 1. Fetch Configuration (The Gatekeeper)
        const config = await ConfigService.fetchConfig();

        // 2. Decide on Sync (The "Feature Flag" Check)
        if (config?.permissions?.canSync) {
          console.log("✅ Pro User: Initializing Cloud Sync...");
          // We pass 'PRO' to imply sync is allowed. 
          // You might want to refine performSync to take a boolean or config object.
          await performSync('PRO'); 
        } else {
          console.log("🔒 Free/Guest: Local Mode Only.");
        }

      } catch (e) {
        console.error("Initialization failed:", e);
      } finally {
        setIsReady(true);
      }
    };

    initApp();
  }, []);

  // Show a loading screen while the app decides "Sync vs Local"
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 20, color: '#64748b' }}>Starting Planner...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* Stack is the navigator. 
        It renders the current route (e.g., app/(tabs)/dashboard.tsx) 
      */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}