import { FCMService, FCMNotification } from './fcmService';
import { APNSService, APNSNotification } from './apnsService';
import { FeatureManager } from '../featureManager';
import { APP_CONFIG } from '../../config/appConfig';
import { Platform } from 'react-native';

export interface PushNotificationConfig {
  fcm: {
    fcmServerKey: string;
    android: {
      enable: boolean;
      topicOrders: boolean;
      topicPromotions: boolean;
    };
  };
  apns: {
    keyId: string;
    teamId: string;
    bundleId: string;
    p8Url: string;
  };
}

export interface UnifiedNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  priority?: 'high' | 'normal';
  badge?: number;
  category?: string;
  threadId?: string;
  imageUrl?: string;
  channelId?: string;
}

export interface NotificationTopic {
  name: string;
  description: string;
  platform: 'android' | 'ios' | 'both';
}

export class PushNotificationManager {
  private static isInitialized = false;
  private static config: PushNotificationConfig | null = null;

  /**
   * Initialize push notification services
   */
  static async initialize(): Promise<void> {
    // Check if push notifications are enabled
    if (!FeatureManager.isPushNotificationsEnabled()) {
      console.log('🔔 Push notifications not enabled in app config');
      return;
    }

    this.config = {
      fcm: {
        fcmServerKey: APP_CONFIG.appRequest?.push?.fcmServerKey || '',
        android: APP_CONFIG.appRequest?.push?.android || {
          enable: false,
          topicOrders: false,
          topicPromotions: false
        }
      },
      apns: {
        keyId: APP_CONFIG.appRequest?.push?.apns?.keyId || '',
        teamId: APP_CONFIG.appRequest?.push?.apns?.teamId || '',
        bundleId: APP_CONFIG.appRequest?.push?.apns?.bundleId || '',
        p8Url: APP_CONFIG.appRequest?.push?.apns?.p8Url || ''
      }
    };

    try {
      // Initialize platform-specific services
      if (Platform.OS === 'android' && FeatureManager.isFCMEnabled()) {
        console.log('🔔 Initializing FCM for Android...');
        await FCMService.initialize(this.config.fcm.fcmServerKey);
        
        // Subscribe to default topics
        await FCMService.subscribeToDefaultTopics();
      }

      if (Platform.OS === 'ios' && FeatureManager.isAPNSEnabled()) {
        console.log('🔔 Initializing APNS for iOS...');
        await APNSService.initialize(this.config.apns);
      }

      this.isInitialized = true;
      console.log('✅ Push notification manager initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  }

  /**
   * Send notification to the current platform
   */
  static async sendNotification(notification: UnifiedNotification): Promise<void> {
    if (!this.isInitialized) {
      console.warn('🔔 Push notification manager not initialized');
      return;
    }

    try {
      if (Platform.OS === 'android' && FeatureManager.isFCMEnabled()) {
        const fcmNotification: FCMNotification = {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound,
          priority: notification.priority,
          channelId: notification.channelId,
          imageUrl: notification.imageUrl
        };
        await FCMService.sendLocalNotification(fcmNotification);
      } else if (Platform.OS === 'ios' && FeatureManager.isAPNSEnabled()) {
        const apnsNotification: APNSNotification = {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound,
          badge: notification.badge,
          category: notification.category,
          threadId: notification.threadId
        };
        await APNSService.sendLocalNotification(apnsNotification);
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  /**
   * Subscribe to topic
   */
  static async subscribeToTopic(topic: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('🔔 Push notification manager not initialized');
      return false;
    }

    try {
      if (Platform.OS === 'android' && FeatureManager.isFCMEnabled()) {
        return await FCMService.subscribeToTopic(topic);
      } else if (Platform.OS === 'ios' && FeatureManager.isAPNSEnabled()) {
        // APNS doesn't have topics like FCM, but we can simulate it
        console.log('🔔 APNS topic subscription simulated:', topic);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from topic
   */
  static async unsubscribeFromTopic(topic: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('🔔 Push notification manager not initialized');
      return false;
    }

    try {
      if (Platform.OS === 'android' && FeatureManager.isFCMEnabled()) {
        return await FCMService.unsubscribeFromTopic(topic);
      } else if (Platform.OS === 'ios' && FeatureManager.isAPNSEnabled()) {
        // APNS doesn't have topics like FCM, but we can simulate it
        console.log('🔔 APNS topic unsubscription simulated:', topic);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', error);
      return false;
    }
  }

  /**
   * Get push token for current platform
   */
  static getPushToken(): string | null {
    if (!this.isInitialized) {
      return null;
    }

    if (Platform.OS === 'android' && FeatureManager.isFCMEnabled()) {
      return FCMService.getPushToken();
    } else if (Platform.OS === 'ios' && FeatureManager.isAPNSEnabled()) {
      return APNSService.getPushToken();
    }

    return null;
  }

  /**
   * Get available topics
   */
  static getAvailableTopics(): NotificationTopic[] {
    const baseTopics = [
      { name: 'orders', description: 'Order updates and status changes', platform: 'both' as const },
      { name: 'promotions', description: 'Special offers and promotions', platform: 'both' as const },
      { name: 'news', description: 'App news and updates', platform: 'both' as const },
      { name: 'general', description: 'General notifications', platform: 'both' as const }
    ];

    // Filter topics based on platform
    return baseTopics.filter(topic => {
      if (Platform.OS === 'android') {
        return topic.platform === 'android' || topic.platform === 'both';
      } else if (Platform.OS === 'ios') {
        return topic.platform === 'ios' || topic.platform === 'both';
      }
      return false;
    });
  }

  /**
   * Get notification categories (iOS only)
   */
  static getNotificationCategories() {
    if (Platform.OS === 'ios' && FeatureManager.isAPNSEnabled()) {
      return APNSService.getAvailableCategories();
    }
    return [];
  }

  /**
   * Check if push notifications are initialized
   */
  static isPushNotificationsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get push notification configuration
   */
  static getConfig(): PushNotificationConfig | null {
    return this.config;
  }

  /**
   * Get push notification status
   */
  static getStatus(): Record<string, boolean> {
    return {
      initialized: this.isInitialized,
      pushNotificationsEnabled: FeatureManager.isPushNotificationsEnabled(),
      fcmEnabled: FeatureManager.isFCMEnabled(),
      fcmInitialized: FCMService.isFCMInitialized(),
      apnsEnabled: FeatureManager.isAPNSEnabled(),
      apnsInitialized: APNSService.isAPNSInitialized(),
      hasPushToken: !!this.getPushToken()
    };
  }

  /**
   * Remove all notification listeners
   */
  static removeListeners(): void {
    if (Platform.OS === 'android') {
      FCMService.removeListeners();
    } else if (Platform.OS === 'ios') {
      APNSService.removeListeners();
    }
  }

  /**
   * Reset push notification manager (for testing)
   */
  static reset(): void {
    this.isInitialized = false;
    this.config = null;
    
    if (Platform.OS === 'android') {
      FCMService.reset();
    } else if (Platform.OS === 'ios') {
      APNSService.reset();
    }
    
    console.log('🔔 Push notification manager reset');
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(): Promise<void> {
    const testNotification: UnifiedNotification = {
      title: 'Test Notification',
      body: 'This is a test notification from the push notification manager',
      data: {
        type: 'test',
        timestamp: Date.now(),
        platform: Platform.OS
      },
      sound: 'default',
      priority: 'high'
    };

    await this.sendNotification(testNotification);
  }

  /**
   * Send order notification
   */
  static async sendOrderNotification(orderId: string, status: string): Promise<void> {
    const orderNotification: UnifiedNotification = {
      title: 'Order Update',
      body: `Your order #${orderId} status has been updated to ${status}`,
      data: {
        type: 'order_update',
        orderId,
        status,
        action: 'open_order'
      },
      sound: 'default',
      priority: 'high',
      category: Platform.OS === 'ios' ? 'ORDER_UPDATE' : undefined,
      channelId: Platform.OS === 'android' ? 'orders' : undefined
    };

    await this.sendNotification(orderNotification);
  }

  /**
   * Send promotion notification
   */
  static async sendPromotionNotification(title: string, description: string, promotionId: string): Promise<void> {
    const promotionNotification: UnifiedNotification = {
      title: title,
      body: description,
      data: {
        type: 'promotion',
        promotionId,
        action: 'open_promotion'
      },
      sound: 'default',
      priority: 'normal',
      category: Platform.OS === 'ios' ? 'PROMOTION' : undefined,
      channelId: Platform.OS === 'android' ? 'promotions' : undefined
    };

    await this.sendNotification(promotionNotification);
  }
}
