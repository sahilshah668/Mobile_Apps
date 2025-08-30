import { FeatureManager } from '../featureManager';
import { APP_CONFIG } from '../../config/appConfig';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface FCMConfig {
  fcmServerKey: string;
  android: {
    enable: boolean;
    topicOrders: boolean;
    topicPromotions: boolean;
  };
}

export interface FCMNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  sound?: string;
  priority?: 'high' | 'normal';
  channelId?: string;
}

export interface FCMTopic {
  name: string;
  description: string;
}

export class FCMService {
  private static isInitialized = false;
  private static fcmServerKey: string | null = null;
  private static androidConfig: FCMConfig['android'] | null = null;
  private static pushToken: string | null = null;
  private static notificationListener: Notifications.Subscription | null = null;
  private static responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize FCM service
   */
  static async initialize(fcmServerKey?: string): Promise<void> {
    // Check if push notifications are enabled
    if (!FeatureManager.isPushNotificationsEnabled()) {
      console.log('🔔 Push notifications not enabled in app config');
      return;
    }

    // Check if FCM is enabled
    if (!FeatureManager.isFCMEnabled()) {
      console.log('🔔 FCM not enabled in app config');
      return;
    }

    // Use provided fcmServerKey or get from config
    const configFcmServerKey = fcmServerKey || APP_CONFIG.appRequest?.push?.fcmServerKey;
    
    if (!configFcmServerKey) {
      console.log('🔔 No FCM server key provided');
      return;
    }

    this.fcmServerKey = configFcmServerKey;
    this.androidConfig = APP_CONFIG.appRequest?.push?.android || {
      enable: true,
      topicOrders: false,
      topicPromotions: false
    };

    try {
      // Configure notification behavior
      await this.configureNotifications();

      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('🔔 Notification permission denied');
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // This should be configured
      });

      this.pushToken = token.data;
      console.log('🔔 FCM Push Token:', this.pushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('🔔 FCM service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing FCM:', error);
    }
  }

  /**
   * Configure notification behavior
   */
  private static async configureNotifications(): Promise<void> {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Orders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('promotions', {
        name: 'Promotions',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  /**
   * Set up notification listeners
   */
  private static setupNotificationListeners(): void {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for notification responses
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle incoming notification
   */
  private static handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data } = notification.request.content;
    
    // Log notification details
    console.log('🔔 Notification received:', {
      title,
      body,
      data,
      timestamp: new Date().toISOString()
    });

    // Handle different notification types based on data
    if (data?.type === 'order_update') {
      this.handleOrderNotification(data);
    } else if (data?.type === 'promotion') {
      this.handlePromotionNotification(data);
    } else {
      this.handleGeneralNotification(data);
    }
  }

  /**
   * Handle notification response (user tap)
   */
  private static handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { title, body, data } = response.notification.request.content;
    
    console.log('🔔 User tapped notification:', {
      title,
      body,
      data,
      timestamp: new Date().toISOString()
    });

    // Handle navigation or actions based on notification data
    if (data?.action) {
      this.handleNotificationAction(data.action, data);
    }
  }

  /**
   * Handle order-related notifications
   */
  private static handleOrderNotification(data: any): void {
    console.log('🔔 Order notification handled:', data);
    // Implement order-specific logic
  }

  /**
   * Handle promotion notifications
   */
  private static handlePromotionNotification(data: any): void {
    console.log('🔔 Promotion notification handled:', data);
    // Implement promotion-specific logic
  }

  /**
   * Handle general notifications
   */
  private static handleGeneralNotification(data: any): void {
    console.log('🔔 General notification handled:', data);
    // Implement general notification logic
  }

  /**
   * Handle notification actions
   */
  private static handleNotificationAction(action: string, data: any): void {
    console.log('🔔 Notification action:', action, data);
    
    switch (action) {
      case 'open_order':
        // Navigate to order details
        break;
      case 'open_promotion':
        // Navigate to promotion details
        break;
      case 'open_product':
        // Navigate to product details
        break;
      default:
        // Default action
        break;
    }
  }

  /**
   * Subscribe to topic
   */
  static async subscribeToTopic(topic: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('🔔 FCM not initialized, cannot subscribe to topic');
      return false;
    }

    try {
      // In a real implementation, you would send this to your backend
      // which would then subscribe the device to the FCM topic
      console.log('🔔 Subscribing to topic:', topic);
      
      // For demo purposes, we'll simulate the subscription
      return true;
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
      console.warn('🔔 FCM not initialized, cannot unsubscribe from topic');
      return false;
    }

    try {
      // In a real implementation, you would send this to your backend
      // which would then unsubscribe the device from the FCM topic
      console.log('🔔 Unsubscribing from topic:', topic);
      
      // For demo purposes, we'll simulate the unsubscription
      return true;
    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', error);
      return false;
    }
  }

  /**
   * Subscribe to default topics based on configuration
   */
  static async subscribeToDefaultTopics(): Promise<void> {
    if (!this.isInitialized || !this.androidConfig) {
      return;
    }

    try {
      if (this.androidConfig.topicOrders) {
        await this.subscribeToTopic('orders');
      }

      if (this.androidConfig.topicPromotions) {
        await this.subscribeToTopic('promotions');
      }

      console.log('🔔 Subscribed to default topics');
    } catch (error) {
      console.error('❌ Error subscribing to default topics:', error);
    }
  }

  /**
   * Send local notification (for testing)
   */
  static async sendLocalNotification(notification: FCMNotification): Promise<void> {
    if (!this.isInitialized) {
      console.warn('🔔 FCM not initialized, cannot send notification');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound || 'default',
        },
        trigger: null, // Send immediately
      });

      console.log('🔔 Local notification sent:', notification);
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }

  /**
   * Get available topics
   */
  static getAvailableTopics(): FCMTopic[] {
    return [
      { name: 'orders', description: 'Order updates and status changes' },
      { name: 'promotions', description: 'Special offers and promotions' },
      { name: 'news', description: 'App news and updates' },
      { name: 'general', description: 'General notifications' }
    ];
  }

  /**
   * Get push token
   */
  static getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Check if FCM is initialized
   */
  static isFCMInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get FCM configuration
   */
  static getFCMConfig(): FCMConfig | null {
    if (!this.isInitialized) {
      return null;
    }

    return {
      fcmServerKey: this.fcmServerKey || '',
      android: this.androidConfig || {
        enable: false,
        topicOrders: false,
        topicPromotions: false
      }
    };
  }

  /**
   * Remove notification listeners
   */
  static removeListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }

    console.log('🔔 FCM listeners removed');
  }

  /**
   * Reset FCM service (for testing)
   */
  static reset(): void {
    this.isInitialized = false;
    this.fcmServerKey = null;
    this.androidConfig = null;
    this.pushToken = null;
    this.removeListeners();
    console.log('🔔 FCM service reset');
  }
}
