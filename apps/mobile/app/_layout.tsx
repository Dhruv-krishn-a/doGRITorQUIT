// apps/mobile/app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "../global.css";
import { AuthProvider } from "../context/AuthContext";
import { SyncProvider } from "../context/SyncContext";
import { AppThemeProvider, useTheme } from "../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleDailyReminder } from '../lib/notifications';
import BootSplash from "../components/BootSplash";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootLayoutNav() {
  const [booting, setBooting] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        await registerForPushNotificationsAsync();
        await scheduleDailyReminder();
      } catch (error) {
        console.warn("Notification bootstrap skipped:", error);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (booting) {
    return <BootSplash />;
  }

  return (
    <View className={`flex-1 theme-${theme}`}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SyncProvider>
        <AppThemeProvider>
          <SafeAreaProvider>
            <RootLayoutNav />
          </SafeAreaProvider>
        </AppThemeProvider>
      </SyncProvider>
    </AuthProvider>
  );
}
