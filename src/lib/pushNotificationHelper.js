import { Platform } from 'react-native';
import { supabase } from './supabase';
import { TABLES } from './constants';

// expo-notifications and expo-device are native-only — not available on web.
// All helpers gracefully no-op when running outside a native device.
const isNative = Platform.OS !== 'web';

let Notifications = null;
let Device = null;

if (isNative) {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (_) {
    // Package not installed — notifications silently disabled
    Notifications = null;
    Device = null;
  }
}

// Register for push notifications
export async function registerForPushNotificationsAsync(userId) {
  if (!Notifications || !Device) return null;

  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  if (userId && token) {
    await supabase
      .from(TABLES.PROFILES)
      .update({ push_token: token })
      .eq('id', userId);
  }

  return token;
}

// Schedule a local notification
export async function scheduleLocalNotification(title, body, trigger = null) {
  if (!Notifications) return null;
  return await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: trigger || { seconds: 1 },
  });
}

// Schedule deadline reminder
export async function scheduleDeadlineReminder(assignmentId, deadline, activityType) {
  if (!Notifications) return;

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const oneDayBefore = new Date(deadlineDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);

  if (deadlineDate > now) {
    if (oneDayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `deadline-${assignmentId}-1day`,
        content: {
          title: 'Assignment Due Soon!',
          body: `Your ${activityType} assignment is due tomorrow!`,
          sound: 'default',
        },
        trigger: { date: oneDayBefore },
      });
    }

    const deadlineMorning = new Date(deadlineDate);
    deadlineMorning.setHours(9, 0, 0, 0);

    if (deadlineMorning > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `deadline-${assignmentId}-day`,
        content: {
          title: 'Assignment Due Today!',
          body: `Your ${activityType} assignment is due today!`,
          sound: 'default',
        },
        trigger: { date: deadlineMorning },
      });
    }
  }
}

// Cancel scheduled notifications
export async function cancelDeadlineReminders(assignmentId) {
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(`deadline-${assignmentId}-1day`);
  await Notifications.cancelScheduledNotificationAsync(`deadline-${assignmentId}-day`);
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications() {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  if (!Notifications) return [];
  return await Notifications.getAllScheduledNotificationsAsync();
}
