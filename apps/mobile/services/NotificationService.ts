import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const MobileNotificationService = {
  async init() {
    if (Platform.OS === 'web') return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    // Set up default channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
      });
    }
  },

  async scheduleDailyReminder() {
    // Schedule 9 AM reminder
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Morning Pulse Check ☀️",
        body: "Initialize your daily habits and architect your path for today.",
        data: { url: '/checklist' },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  },

  async sendImmediate(title: string, body: string, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // immediate
    });
  }
};
