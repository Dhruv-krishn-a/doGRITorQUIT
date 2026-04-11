import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const DAILY_BRIEFING_TAG = 'daily_briefing';
const CHECKLIST_REMAINING_TAG = 'checklist_remaining';
const TODAY_MOTIVATION_TAG = 'today_motivation';
const TASK_REMINDER_TAG = 'task_reminder';
let didLogFcmSkip = false;

async function ensureLocalNotificationsReady(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4f46e5',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

async function cancelScheduledByTag(tag: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const matching = scheduled.filter((item) => item.content.data?.tag === tag);
  await Promise.all(matching.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export async function registerForPushNotificationsAsync() {
  try {
    const ready = await ensureLocalNotificationsReady();
    if (!ready) {
      return;
    }

    try {
      return (await Notifications.getExpoPushTokenAsync()).data;
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : '';

      if (message.includes('Default FirebaseApp is not initialized')) {
        if (!didLogFcmSkip) {
          console.log('Push token setup skipped: Firebase/FCM not configured. Local reminders still work.');
          didLogFcmSkip = true;
        }
        return;
      }

      throw error;
    }
  } catch (error) {
    console.warn('Push notification registration skipped:', error);
    return;
  }
}

export async function sendImmediateNotification(title: string, body: string, data = {}) {
  try {
    const ready = await ensureLocalNotificationsReady();
    if (!ready) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
  } catch (error) {
    console.warn('Immediate notification failed:', error);
  }
}

export async function scheduleDailyReminder() {
  try {
    await cancelScheduledByTag(DAILY_BRIEFING_TAG);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Command Center: Daily Briefing 🛰️",
        body: "Your daily vectors are ready for execution. Initialize your mission.",
        data: { tag: DAILY_BRIEFING_TAG },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: 'default',
        hour: 8,
        minute: 0,
      },
    });
  } catch (error) {
    console.warn('Daily reminder scheduling skipped:', error);
  }
}

export async function scheduleTaskReminder(title: string, date: Date) {
  try {
    const ready = await ensureLocalNotificationsReady();
    if (!ready) return null;
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Vector Deadline Approaching 🚀",
        body: `Execution required for: ${title}`,
        data: { tag: `${TASK_REMINDER_TAG}_${title}` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        channelId: 'default',
        date: new Date(date.getTime() - 15 * 60000), // 15 mins before
      },
    });
  } catch (error) {
    console.warn('Task reminder scheduling skipped:', error);
    return null;
  }
}

export async function scheduleTodayMotivationalReminders() {
  try {
    const ready = await ensureLocalNotificationsReady();
    if (!ready) return;
    await cancelScheduledByTag(TODAY_MOTIVATION_TAG);

    const dayParts = [
      { hour: 8, minute: 0, title: 'Morning setup', body: 'Plan your top 3 priorities and start with the hardest one.' },
      { hour: 18, minute: 0, title: 'Evening checkpoint', body: 'Review pending tasks and close at least one more block.' },
      { hour: 22, minute: 0, title: 'Night wrap', body: 'Mark completed tasks and prepare tomorrow schedule.' },
    ];

    await Promise.all(dayParts.map((slot) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: slot.title,
          body: slot.body,
          data: { tag: TODAY_MOTIVATION_TAG },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId: 'default',
          hour: slot.hour,
          minute: slot.minute,
        },
      })
    ));
  } catch (error) {
    console.warn('Motivational reminders scheduling skipped:', error);
  }
}

export async function scheduleTaskReminderSeries(task: {
  id: string;
  title: string;
  dueDate: Date;
  repeatUntilDoneMinutes?: number;
}) {
  try {
    const ready = await ensureLocalNotificationsReady();
    if (!ready) return [];
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const prefix = `${TASK_REMINDER_TAG}_${task.id}`;
    const existing = scheduled.filter((item) => String(item.content.data?.tag || '').startsWith(prefix));
    await Promise.all(existing.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));

    const ids: string[] = [];
    const beforeDay = new Date(task.dueDate);
    beforeDay.setDate(beforeDay.getDate() - 1);
    beforeDay.setHours(20, 0, 0, 0);
    if (beforeDay.getTime() > Date.now()) {
      ids.push(await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tomorrow reminder',
          body: `${task.title} is scheduled for tomorrow.`,
          data: { tag: `${prefix}_before_day` },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          channelId: 'default',
          date: beforeDay,
        },
      }));
    }

    if (task.dueDate.getTime() > Date.now()) {
      ids.push(await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Scheduled task now',
          body: `Time for: ${task.title}`,
          data: { tag: `${prefix}_due` },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          channelId: 'default',
          date: task.dueDate,
        },
      }));
    }

    const intervalMinutes = task.repeatUntilDoneMinutes || 120;
    ids.push(await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Still pending',
        body: `${task.title} is still open. Complete it when you can.`,
        data: { tag: `${prefix}_repeat` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        channelId: 'default',
        seconds: intervalMinutes * 60,
        repeats: true,
      },
    }));

    return ids;
  } catch (error) {
    console.warn('Task reminder series scheduling skipped:', error);
    return [];
  }
}

export async function cancelTaskReminderSeries(taskId: string) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const prefix = `${TASK_REMINDER_TAG}_${taskId}`;
    const matching = scheduled.filter((item) => String(item.content.data?.tag || '').startsWith(prefix));
    await Promise.all(matching.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  } catch (error) {
    console.warn('Task reminder cancel skipped:', error);
  }
}

export async function scheduleChecklistNudgeSoon(remainingTitles: string[], seconds: number = 5) {
  try {
    const ready = await ensureLocalNotificationsReady();
    if (!ready || remainingTitles.length === 0) {
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reminder set',
        body: `Still pending: ${remainingTitles.slice(0, 2).join(', ')}`,
        data: { tag: `${CHECKLIST_REMAINING_TAG}_nudge` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        channelId: 'default',
        seconds,
        repeats: false,
      },
    });
  } catch (error) {
    console.warn('Checklist nudge scheduling skipped:', error);
    return null;
  }
}

export async function scheduleChecklistRemainingReminder(
  remainingTitles: string[],
  hour: number = 20,
  minute: number = 30
) {
  try {
    const ready = await ensureLocalNotificationsReady();
    if (!ready) {
      return null;
    }

    await cancelScheduledByTag(CHECKLIST_REMAINING_TAG);

    if (remainingTitles.length === 0) {
      return null;
    }

    const preview = remainingTitles.slice(0, 3).join(', ');
    const suffix = remainingTitles.length > 3 ? ` +${remainingTitles.length - 3} more` : '';

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `${remainingTitles.length} habits remaining today`,
        body: `${preview}${suffix}`,
        data: { tag: CHECKLIST_REMAINING_TAG },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: 'default',
        hour,
        minute,
      },
    });
  } catch (error) {
    console.warn('Checklist reminder scheduling skipped:', error);
    return null;
  }
}
