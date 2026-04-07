// apps/mobile/app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import "../global.css";
import { AuthProvider } from "../context/AuthContext";
import { SyncProvider } from "../context/SyncContext";
import { AppThemeProvider } from "../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleDailyReminder } from '../lib/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootLayoutNav() {
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

  return <Stack screenOptions={{ headerShown: false }} />;
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
