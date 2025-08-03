import notifee, {
  AndroidImportance,
  EventType,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { StoreTime } from './storeService';

interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  date: Date;
}

class NotificationService {
  constructor() {
    this.configurePushNotifications();
  }

  private isEmulator(): boolean {
    if (Platform.OS === 'android') {
      // Check for common emulator indicators
      const isEmulator =
        __DEV__ ||
        process.env.NODE_ENV === 'development' ||
        !!process.env.REACT_NATIVE_PACKAGER_HOSTNAME;

      console.log('Running on emulator:', isEmulator);
      return isEmulator;
    }
    return false;
  }

  private async configurePushNotifications() {
    try {
      // Create notification channel for Android
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'store-notifications',
          name: 'Store Notifications',
          description: 'Notifications for store opening times',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
          lights: true,
          lightColor: '#FF0000',
        });

        // Create a separate channel for test notifications
        await notifee.createChannel({
          id: 'test-notifications',
          name: 'Test Notifications',
          description: 'Test notification channel',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });
      }

      // Set up notification event listeners
      notifee.onForegroundEvent(({ type, detail }) => {
        switch (type) {
          case EventType.PRESS:
            console.log('User pressed notification', detail.notification);
            break;
          case EventType.DISMISSED:
            console.log('User dismissed notification', detail.notification);
            break;
        }
      });

      notifee.onBackgroundEvent(async ({ type, detail }) => {
        switch (type) {
          case EventType.PRESS:
            console.log(
              'User pressed notification (background)',
              detail.notification,
            );
            break;
          case EventType.DISMISSED:
            console.log(
              'User dismissed notification (background)',
              detail.notification,
            );
            break;
        }
      });
    } catch (error) {
      console.error('Error configuring notifications:', error);
    }
  }

  /**
   * Schedule a notification for 1 hour before store opening
   */
  public scheduleStoreOpeningNotification(
    storeTime: StoreTime,
    dayOfWeek: number,
  ): void {
    if (!storeTime.is_open) {
      return; // Don't schedule notifications for closed days
    }

    const notificationDate = this.calculateNotificationDate(
      storeTime.start_time,
      dayOfWeek,
    );

    if (notificationDate <= new Date()) {
      return; // Don't schedule notifications in the past
    }

    const notificationId = `store-opening-${dayOfWeek}-${storeTime.start_time}`;

    const notification: NotificationConfig = {
      id: notificationId,
      title: 'Store Opening Soon! 🏪',
      message: `The store opens in 1 hour at ${this.formatTimeForDisplay(
        storeTime.start_time,
      )}`,
      date: notificationDate,
    };

    this.scheduleNotification(notification);
  }

  private calculateNotificationDate(
    openingTime: string,
    dayOfWeek: number,
  ): Date {
    const now = new Date();
    const [hours, minutes] = openingTime.split(':').map(Number);

    // Calculate the next occurrence of this day of week
    const targetDate = new Date(now);
    const currentDayOfWeek = now.getDay();

    // Calculate days until target day
    let daysUntilTarget = dayOfWeek - currentDayOfWeek;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Next week
    }

    // Set the target date
    targetDate.setDate(now.getDate() + daysUntilTarget);
    targetDate.setHours(hours, minutes, 0, 0);

    // Subtract 1 hour for notification
    targetDate.setHours(targetDate.getHours() - 1);

    return targetDate;
  }

  /**
   * Format time for display (e.g., "2:30 PM")
   */
  private formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  /**
   * Schedule a single notification
   */
  private async scheduleNotification(
    notification: NotificationConfig,
  ): Promise<void> {
    await notifee.createTriggerNotification(
      {
        id: notification.id,
        title: notification.title,
        body: notification.message,
        android: {
          channelId: 'store-notifications',
          importance: AndroidImportance.HIGH,
        },
        ios: {
          sound: 'default',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: notification.date.getTime(),
        alarmManager: true,
        repeatFrequency: RepeatFrequency.WEEKLY,
      },
    );
  }

  /**
   * Schedule notifications for all store opening times
   */
  public async scheduleAllStoreNotifications(
    storeTimes: StoreTime[],
  ): Promise<void> {
    await this.cancelAllStoreNotifications();

    // Schedule new notifications for each opening time
    for (const storeTime of storeTimes) {
      if (storeTime.is_open) {
        await this.scheduleStoreOpeningNotification(
          storeTime,
          storeTime.day_of_week,
        );
      }
    }
  }

  public async cancelAllStoreNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
  }

  public async getScheduledNotifications(): Promise<any[]> {
    try {
      const notifications = await notifee.getTriggerNotifications();
      return notifications;
    } catch (error) {
      return [];
    }
  }

  public async requestPermissions(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus === 1;
  }

  public async checkPermissions(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus === 1;
  }

  public async checkNotificationStatus(): Promise<{
    permissions: boolean;
    channels: any[];
    scheduled: any[];
  }> {
    try {
      const permissions = await this.checkPermissions();
      const channels = await notifee.getChannels();
      const scheduled = await this.getScheduledNotifications();

      console.log('Notification Status:', {
        permissions,
        channelsCount: channels.length,
        scheduledCount: scheduled.length,
      });

      return {
        permissions,
        channels,
        scheduled,
      };
    } catch (error) {
      console.error('Error checking notification status:', error);
      return {
        permissions: false,
        channels: [],
        scheduled: [],
      };
    }
  }

  public async testEmulatorNotifications(): Promise<void> {
    try {
      const isEmulator = this.isEmulator();
      console.log('Running on emulator:', isEmulator);

      // Check notification status
      const status = await this.checkNotificationStatus();
      console.log('Notification status:', status);

      await notifee.displayNotification({
        id: 'emulator-test-immediate',
        title: 'Test Notification',
        body: 'If you see this, notifications are working!',
        android: {
          channelId: 'test-notifications',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher',
          color: '#FF0000',
          sound: 'default',
          vibrationPattern: [300, 500],
          showTimestamp: true,
        },
      });

      // Also try a delayed notification
      const delayedDate = new Date();
      delayedDate.setSeconds(delayedDate.getSeconds() + 5);

      console.log(
        'Scheduling delayed notification for:',
        delayedDate.toISOString(),
      );

      await notifee.createTriggerNotification(
        {
          id: 'emulator-test-delayed',
          title: '⏰ Delayed Test',
          body: 'This is a delayed notification test',
          android: {
            channelId: 'test-notifications',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            smallIcon: 'ic_launcher',
            color: '#00FF00',
            sound: 'default',
            vibrationPattern: [300, 500],
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: delayedDate.getTime(),
          alarmManager: true,
        },
      );

      console.log('Delayed notification scheduled successfully');
      console.log('=== EMULATOR TEST COMPLETE ===');
    } catch (error) {
      console.error('Emulator notification test failed:', error);
      throw error;
    }
  }

  public async scheduleTestNotification(): Promise<void> {
    try {
      const isEmulator = this.isEmulator();
      console.log('Scheduling test notification on emulator:', isEmulator);

      // Check permissions first
      const hasPermissions = await this.checkPermissions();
      console.log('Notification permissions granted:', hasPermissions);

      if (!hasPermissions) {
        console.warn(
          'Notification permissions not granted. Requesting permissions...',
        );
        const granted = await this.requestPermissions();
        console.log('Permission request result:', granted);

        if (!granted) {
          throw new Error('Notification permissions not granted');
        }
      }

      const testDate = new Date();
      testDate.setSeconds(testDate.getSeconds() + 10);

      console.log('Scheduling notification for:', testDate.toISOString());

      await notifee.createTriggerNotification(
        {
          id: 'test-notification',
          title: 'PerDiem Test Notification',
          body: 'This is a local test notification from PerDiem app',
          android: {
            channelId: 'test-notifications',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            smallIcon: 'ic_launcher',
            color: '#FF0000',
            sound: 'default',
            vibrationPattern: [300, 500],
            // Add more Android-specific options for emulator testing
            showTimestamp: true,
            timestamp: Date.now(),
          },
          ios: {
            sound: 'default',
            critical: true,
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: testDate.getTime(),
          alarmManager: true,
        },
      );

      // For emulator testing, also try immediate notification
      if (isEmulator) {
        await notifee.displayNotification({
          id: 'immediate-test',
          title: 'PerDiem Test Notification',
          body: 'This is a local test notification from PerDiem app',
          android: {
            channelId: 'test-notifications',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            smallIcon: 'ic_launcher',
            color: '#00FF00',
            sound: 'default',
            vibrationPattern: [300, 500],
          },
        });
      }
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
