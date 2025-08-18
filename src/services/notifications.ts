import * as Notifications from 'expo-notifications';
import APP_CONFIG from '../config/appConfig';

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'min' | 'low' | 'default' | 'high';
  sound?: string;
  vibration?: boolean;
  light?: boolean;
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  channelId?: string;
}

class NotificationService {
  private isInitialized = false;
  private channels: Map<string, NotificationChannel> = new Map();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if notifications are enabled in permissions
      if (!APP_CONFIG.permissions?.notifications) {
        console.log('Notifications not enabled in permissions');
        return;
      }

      // Check if push notifications are enabled
      if (!APP_CONFIG.push?.android?.enable && !APP_CONFIG.push?.apns?.p8Present) {
        console.log('Push notifications not enabled');
        return;
      }

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Create default notification channel
      await this.createDefaultChannel();

      // Create additional channels if needed
      if (APP_CONFIG.push?.android?.topicOrders) {
        await this.createChannel({
          id: 'orders',
          name: 'Order Updates',
          description: 'Notifications about your order status',
          importance: 'high',
        });
      }

      if (APP_CONFIG.push?.android?.topicPromotions) {
        await this.createChannel({
          id: 'promotions',
          name: 'Promotions & Offers',
          description: 'Special offers and promotional notifications',
          importance: 'default',
        });
      }

      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  private async createDefaultChannel(): Promise<void> {
    const defaultChannel: NotificationChannel = {
      id: 'default',
      name: APP_CONFIG.notifications?.channelName || 'General',
      description: APP_CONFIG.notifications?.channelDesc || 'General app notifications',
      importance: APP_CONFIG.notifications?.importance || 'default',
    };

    await this.createChannel(defaultChannel);
  }

  async createChannel(channel: NotificationChannel): Promise<void> {
    try {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: Notifications.AndroidImportance[channel.importance.toUpperCase() as keyof typeof Notifications.AndroidImportance],
        sound: channel.sound,
        vibrationPattern: channel.vibration ? [0, 250, 250, 250] : undefined,
        lightColor: channel.light ? '#FF231F7C' : undefined,
      });
      
      // Store channel for reference
      this.channels.set(channel.id, channel);
      console.log('Notification channel created:', channel.id);
    } catch (error) {
      console.error('Failed to create notification channel:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  async scheduleLocalNotification(notification: NotificationData, trigger?: any): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound,
          badge: notification.badge,
        },
        trigger: trigger || null,
      });
      
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  // Convenience methods for common notification types
  async notifyOrderUpdate(orderId: string, status: string): Promise<void> {
    const notification: NotificationData = {
      title: 'Order Update',
      body: `Your order #${orderId} status has been updated to ${status}`,
      data: { orderId, status, type: 'order_update' },
      channelId: 'orders',
    };

    await this.scheduleLocalNotification(notification);
  }

  async notifyPromotion(title: string, description: string): Promise<void> {
    const notification: NotificationData = {
      title,
      body: description,
      data: { type: 'promotion' },
      channelId: 'promotions',
    };

    await this.scheduleLocalNotification(notification);
  }

  async notifyNewProduct(productName: string): Promise<void> {
    const notification: NotificationData = {
      title: 'New Product Available',
      body: `${productName} is now available in our store!`,
      data: { productName, type: 'new_product' },
      channelId: 'default',
    };

    await this.scheduleLocalNotification(notification);
  }

  async notifyPriceDrop(productName: string, oldPrice: number, newPrice: number): Promise<void> {
    const notification: NotificationData = {
      title: 'Price Drop Alert',
      body: `${productName} price dropped from $${oldPrice} to $${newPrice}`,
      data: { productName, oldPrice, newPrice, type: 'price_drop' },
      channelId: 'promotions',
    };

    await this.scheduleLocalNotification(notification);
  }

  // Get channel information
  getChannel(channelId: string): NotificationChannel | undefined {
    return this.channels.get(channelId);
  }

  getAllChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.isInitialized && 
           APP_CONFIG.permissions?.notifications === true &&
           (APP_CONFIG.push?.android?.enable === true || APP_CONFIG.push?.apns?.p8Present === true);
  }
}

export const notifications = new NotificationService();

export default notifications;
