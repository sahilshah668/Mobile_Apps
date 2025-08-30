import { FeatureManager } from '../featureManager';
import { APP_CONFIG } from '../../config/appConfig';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface APNSConfig {
  keyId: string;
  teamId: string;
  bundleId: string;
  p8Url: string;
}

export interface APNSNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  category?: string;
  threadId?: string;
}

export interface APNSCategory {
  identifier: string;
  actions: APNSAction[];
}

export interface APNSAction {
  identifier: string;
  title: string;
  options?: ('foreground' | 'destructive' | 'authenticationRequired')[];
}

export class APNSService {
  private static isInitialized = false;
  private static apnsConfig: APNSConfig | null = null;
  private static pushToken: string | null = null;
  private static notificationListener: Notifications.Subscription | null = null;
  private static responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize APNS service
   */
  static async initialize(config?: APNSConfig): Promise<void> {
    // Check if push notifications are enabled
    if (!FeatureManager.isPushNotificationsEnabled()) {
      console.log('🔔 Push notifications not enabled in app config');
      return;
    }

    // Check if APNS is enabled
    if (!FeatureManager.isAPNSEnabled()) {
      console.log('🔔 APNS not enabled in app config');
      return;
    }

    // Use provided config or get from app config
    const appConfig = config || APP_CONFIG.appRequest?.push?.apns;
    
    if (!appConfig || !appConfig.keyId || !appConfig.teamId || !appConfig.bundleId) {
      console.log('🔔 Incomplete APNS configuration');
      return;
    }

    this.apnsConfig = appConfig;

    try {
      // Configure notification behavior
      await this.configureNotifications();

      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });

      if (status !== 'granted') {
        console.log('🔔 Notification permission denied');
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // This should be configured
      });

      this.pushToken = token.data;
      console.log('🔔 APNS Push Token:', this.pushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      // Register notification categories
      await this.registerNotificationCategories();

      this.isInitialized = true;
      console.log('🔔 APNS service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing APNS:', error);
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
  }

  /**
   * Set up notification listeners
   */
  private static setupNotificationListeners(): void {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 APNS Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for notification responses
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 APNS Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Register notification categories for iOS
   */
  private static async registerNotificationCategories(): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      // Order update category
      await Notifications.setNotificationCategoryAsync('ORDER_UPDATE', [
        {
          identifier: 'VIEW_ORDER',
          buttonTitle: 'View Order',
          options: ['foreground'],
        },
        {
          identifier: 'TRACK_ORDER',
          buttonTitle: 'Track Order',
          options: ['foreground'],
        },
      ]);

      // Promotion category
      await Notifications.setNotificationCategoryAsync('PROMOTION', [
        {
          identifier: 'VIEW_PROMOTION',
          buttonTitle: 'View Offer',
          options: ['foreground'],
        },
        {
          identifier: 'SHARE_PROMOTION',
          buttonTitle: 'Share',
          options: ['foreground'],
        },
      ]);

      // General category
      await Notifications.setNotificationCategoryAsync('GENERAL', [
        {
          identifier: 'OPEN_APP',
          buttonTitle: 'Open App',
          options: ['foreground'],
        },
      ]);

      console.log('🔔 APNS notification categories registered');
    } catch (error) {
      console.error('❌ Error registering notification categories:', error);
    }
  }

  /**
   * Handle incoming notification
   */
  private static handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data, categoryIdentifier } = notification.request.content;
    
    // Log notification details
    console.log('🔔 APNS Notification received:', {
      title,
      body,
      data,
      categoryIdentifier,
      timestamp: new Date().toISOString()
    });

    // Handle different notification types based on category or data
    if (categoryIdentifier === 'ORDER_UPDATE' || data?.type === 'order_update') {
      this.handleOrderNotification(data);
    } else if (categoryIdentifier === 'PROMOTION' || data?.type === 'promotion') {
      this.handlePromotionNotification(data);
    } else {
      this.handleGeneralNotification(data);
    }
  }

  /**
   * Handle notification response (user tap or action)
   */
  private static handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { title, body, data, categoryIdentifier } = response.notification.request.content;
    const actionIdentifier = response.actionIdentifier;
    
    console.log('🔔 APNS User action:', {
      title,
      body,
      data,
      categoryIdentifier,
      actionIdentifier,
      timestamp: new Date().toISOString()
    });

    // Handle different actions based on action identifier
    switch (actionIdentifier) {
      case 'VIEW_ORDER':
        this.handleViewOrderAction(data);
        break;
      case 'TRACK_ORDER':
        this.handleTrackOrderAction(data);
        break;
      case 'VIEW_PROMOTION':
        this.handleViewPromotionAction(data);
        break;
      case 'SHARE_PROMOTION':
        this.handleSharePromotionAction(data);
        break;
      case 'OPEN_APP':
        this.handleOpenAppAction(data);
        break;
      default:
        this.handleDefaultAction(data);
        break;
    }
  }

  /**
   * Handle order-related notifications
   */
  private static handleOrderNotification(data: any): void {
    console.log('🔔 APNS Order notification handled:', data);
    // Implement order-specific logic
  }

  /**
   * Handle promotion notifications
   */
  private static handlePromotionNotification(data: any): void {
    console.log('🔔 APNS Promotion notification handled:', data);
    // Implement promotion-specific logic
  }

  /**
   * Handle general notifications
   */
  private static handleGeneralNotification(data: any): void {
    console.log('🔔 APNS General notification handled:', data);
    // Implement general notification logic
  }

  /**
   * Handle view order action
   */
  private static handleViewOrderAction(data: any): void {
    console.log('🔔 APNS View order action:', data);
    // Navigate to order details
  }

  /**
   * Handle track order action
   */
  private static handleTrackOrderAction(data: any): void {
    console.log('🔔 APNS Track order action:', data);
    // Navigate to order tracking
  }

  /**
   * Handle view promotion action
   */
  private static handleViewPromotionAction(data: any): void {
    console.log('🔔 APNS View promotion action:', data);
    // Navigate to promotion details
  }

  /**
   * Handle share promotion action
   */
  private static handleSharePromotionAction(data: any): void {
    console.log('🔔 APNS Share promotion action:', data);
    // Share promotion
  }

  /**
   * Handle open app action
   */
  private static handleOpenAppAction(data: any): void {
    console.log('🔔 APNS Open app action:', data);
    // Open app or specific screen
  }

  /**
   * Handle default action
   */
  private static handleDefaultAction(data: any): void {
    console.log('🔔 APNS Default action:', data);
    // Default action handling
  }

  /**
   * Send local notification (for testing)
   */
  static async sendLocalNotification(notification: APNSNotification): Promise<void> {
    if (!this.isInitialized) {
      console.warn('🔔 APNS not initialized, cannot send notification');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound || 'default',
          badge: notification.badge,
          categoryIdentifier: notification.category,
          threadIdentifier: notification.threadId,
        },
        trigger: null, // Send immediately
      });

      console.log('🔔 APNS Local notification sent:', notification);
    } catch (error) {
      console.error('❌ Error sending APNS local notification:', error);
    }
  }

  /**
   * Get available notification categories
   */
  static getAvailableCategories(): APNSCategory[] {
    return [
      {
        identifier: 'ORDER_UPDATE',
        actions: [
          { identifier: 'VIEW_ORDER', title: 'View Order', options: ['foreground'] },
          { identifier: 'TRACK_ORDER', title: 'Track Order', options: ['foreground'] },
        ]
      },
      {
        identifier: 'PROMOTION',
        actions: [
          { identifier: 'VIEW_PROMOTION', title: 'View Offer', options: ['foreground'] },
          { identifier: 'SHARE_PROMOTION', title: 'Share', options: ['foreground'] },
        ]
      },
      {
        identifier: 'GENERAL',
        actions: [
          { identifier: 'OPEN_APP', title: 'Open App', options: ['foreground'] },
        ]
      }
    ];
  }

  /**
   * Get push token
   */
  static getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Check if APNS is initialized
   */
  static isAPNSInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get APNS configuration
   */
  static getAPNSConfig(): APNSConfig | null {
    return this.apnsConfig;
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

    console.log('🔔 APNS listeners removed');
  }

  /**
   * Reset APNS service (for testing)
   */
  static reset(): void {
    this.isInitialized = false;
    this.apnsConfig = null;
    this.pushToken = null;
    this.removeListeners();
    console.log('🔔 APNS service reset');
  }
}
