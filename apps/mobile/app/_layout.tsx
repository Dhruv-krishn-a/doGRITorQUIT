import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { vars } from "nativewind";
import "../global.css";
import { AuthProvider } from "../context/AuthContext";
import { SyncProvider } from "../context/SyncContext";
import { AppThemeProvider, useTheme } from "../context/ThemeContext";
import { StudyUIProvider } from "../context/StudyUIContext";
import { StudyModalManager } from "../components/study/StudyModalManager";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleDailyReminder } from '../lib/notifications';
import BootSplash from "../components/BootSplash";
import { getAccessToken, getApiBaseUrl } from '../lib/nativeAuth';

Notifications.setNotificationHandler({
 handleNotification: async () => ({
 shouldShowAlert: true,
 shouldPlaySound: true,
 shouldSetBadge: false,
 }),
});

function RootLayoutNav() {
 const [booting, setBooting] = useState(true);
 const { theme, colors } = useTheme();

 useEffect(() => {
 (async () => {
 try {
 const token = await registerForPushNotificationsAsync();
 if (token) {
   const accessToken = await getAccessToken();
   if (accessToken) {
     await fetch(`${getApiBaseUrl()}/api/user/push-token`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${accessToken}`,
       },
       body: JSON.stringify({ token }),
     }).catch(() => {});
   }
 }
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

 const themeVars = vars({
  '--bg-primary': colors.primary,
  '--bg-secondary': colors.secondary,
  '--bg-card': colors.card,
  '--text-primary': colors.text,
  '--text-secondary': colors.textSecondary,
  '--border-color': colors.border,
  '--accent-color': colors.accent,
  '--hover-bg': colors.hover,
 });

 return (
 <View style={themeVars} className={`flex-1 theme-${theme} bg-[var(--bg-primary)]`}>
 <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
 <StudyModalManager />
 </View>
 );
}

export default function RootLayout() {
 return (
 <AuthProvider>
 <SyncProvider>
 <AppThemeProvider>
 <StudyUIProvider>
 <SafeAreaProvider>
 <RootLayoutNav />
 </SafeAreaProvider>
 </StudyUIProvider>
 </AppThemeProvider>
 </SyncProvider>
 </AuthProvider>
 );
}
