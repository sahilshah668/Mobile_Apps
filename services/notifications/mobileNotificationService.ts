import { APP_CONFIG } from '../../config/appConfig';
import { FeatureManager } from '../featureManager';
import { PushNotificationManager } from './pushNotificationManager';
import { Platform } from 'react-native';

export interface NotificationData {
  _id: string;
  user: string;
  store?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  last24h: number;
}

export interface NotificationResponse {
  notifications: NotificationData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface TokenRegistrationData {
  partnerId?: string;
  clientId?: string;
  storeId: string;
  userId?: string;
  platform: 'android' | 'ios' | 'web';
  token: string;
  appVersion?: string;
  locale?: string;
}

export interface TopicSubscriptionData {
  storeId: string;
  token: string;
  topic: string;
}

export class MobileNotificationService {
  private static baseUrl: string = '';
  private static isInitialized = false;
  private static authToken: string | null = null;

  /**
   * Initialize the mobile notification service
   */
  static initialize(baseUrl?: string, authToken?: string): void {
    this.baseUrl = baseUrl || APP_CONFIG.api?.baseUrl || '';
    this.authToken = authToken || null;
    this.isInitialized = true;
    console.log('📱 Mobile notification service initialized');
  }

  /**
   * Set authentication token
   */
  static setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   */
  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make API request
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Mobile notification service not initialized');
    }

    if (!this.baseUrl) {
      throw new Error('Base URL not configured');
    }

    const url = `${this.baseUrl}/api/notifications${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('❌ Mobile notification API error:', error);
      throw error;
    }
  }

  /**
   * Register push notification token with backend
   */
  static async registerToken(data: TokenRegistrationData): Promise<{ ok: boolean }> {
    try {
      const result = await this.makeRequest<{ ok: boolean }>('/register-token', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      console.log('📱 Push token registered with backend');
      return result;
    } catch (error) {
      console.error('❌ Failed to register push token:', error);
      throw error;
    }
  }

  /**
   * Unregister push notification token
   */
  static async unregisterToken(storeId: string, token: string): Promise<{ ok: boolean }> {
    try {
      const result = await this.makeRequest<{ ok: boolean }>('/unregister-token', {
        method: 'POST',
        body: JSON.stringify({ storeId, token }),
      });

      console.log('📱 Push token unregistered from backend');
      return result;
    } catch (error) {
      console.error('❌ Failed to unregister push token:', error);
      throw error;
    }
  }

  /**
   * Subscribe to notification topic
   */
  static async subscribeToTopic(data: TopicSubscriptionData): Promise<{ ok: boolean }> {
    try {
      const result = await this.makeRequest<{ ok: boolean }>('/subscribe', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      console.log('📱 Subscribed to topic:', data.topic);
      return result;
    } catch (error) {
      console.error('❌ Failed to subscribe to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from notification topic
   */
  static async unsubscribeFromTopic(data: TopicSubscriptionData): Promise<{ ok: boolean }> {
    try {
      const result = await this.makeRequest<{ ok: boolean }>('/unsubscribe', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      console.log('📱 Unsubscribed from topic:', data.topic);
      return result;
    } catch (error) {
      console.error('❌ Failed to unsubscribe from topic:', error);
      throw error;
    }
  }

  /**
   * Get notifications for current user
   */
  static async getNotifications(options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    storeId?: string;
  } = {}): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.unreadOnly) params.append('unreadOnly', 'true');
      if (options.storeId) params.append('storeId', options.storeId);

      const endpoint = params.toString() ? `/?${params.toString()}` : '/';
      const result = await this.makeRequest<NotificationResponse>(endpoint);

      console.log('📱 Fetched notifications:', result.notifications.length);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(storeId?: string): Promise<NotificationStats> {
    try {
      const params = storeId ? `?storeId=${storeId}` : '';
      const result = await this.makeRequest<NotificationStats>(`/stats${params}`);

      console.log('📱 Fetched notification stats:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch notification stats:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<NotificationData> {
    try {
      const result = await this.makeRequest<NotificationData>(`/${notificationId}/read`, {
        method: 'PATCH',
      });

      console.log('📱 Marked notification as read:', notificationId);
      return result;
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(storeId?: string): Promise<{ success: boolean }> {
    try {
      const params = storeId ? `?storeId=${storeId}` : '';
      const result = await this.makeRequest<{ success: boolean }>(`/mark-all-read${params}`, {
        method: 'PATCH',
      });

      console.log('📱 Marked all notifications as read');
      return result;
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<NotificationData> {
    try {
      const result = await this.makeRequest<NotificationData>(`/${notificationId}`, {
        method: 'DELETE',
      });

      console.log('📱 Deleted notification:', notificationId);
      return result;
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  static async deleteAllNotifications(storeId?: string): Promise<{ success: boolean }> {
    try {
      const params = storeId ? `?storeId=${storeId}` : '';
      const result = await this.makeRequest<{ success: boolean }>(`/${params}`, {
        method: 'DELETE',
      });

      console.log('📱 Deleted all notifications');
      return result;
    } catch (error) {
      console.error('❌ Failed to delete all notifications:', error);
      throw error;
    }
  }

  /**
   * Bulk mark notifications as read
   */
  static async bulkMarkAsRead(notificationIds: string[]): Promise<{ success: boolean }> {
    try {
      const result = await this.makeRequest<{ success: boolean }>('/bulk/mark-read', {
        method: 'PATCH',
        body: JSON.stringify({ notificationIds }),
      });

      console.log('📱 Bulk marked notifications as read:', notificationIds.length);
      return result;
    } catch (error) {
      console.error('❌ Failed to bulk mark notifications as read:', error);
      throw error;
    }
  }

  /**
   * Bulk delete notifications
   */
  static async bulkDeleteNotifications(notificationIds: string[]): Promise<{ success: boolean }> {
    try {
      const result = await this.makeRequest<{ success: boolean }>('/bulk/delete', {
        method: 'DELETE',
        body: JSON.stringify({ notificationIds }),
      });

      console.log('📱 Bulk deleted notifications:', notificationIds.length);
      return result;
    } catch (error) {
      console.error('❌ Failed to bulk delete notifications:', error);
      throw error;
    }
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(token: string, title?: string, body?: string, data?: Record<string, any>): Promise<{ messageId: string }> {
    try {
      const result = await this.makeRequest<{ messageId: string }>('/send-test', {
        method: 'POST',
        body: JSON.stringify({
          token,
          title: title || 'Test Notification',
          body: body || 'This is a test notification from the mobile app',
          data: data || {},
        }),
      });

      console.log('📱 Test notification sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
      throw error;
    }
  }

  /**
   * Auto-register push token with backend
   */
  static async autoRegisterToken(storeId: string, userId?: string): Promise<void> {
    if (!FeatureManager.isPushNotificationsEnabled()) {
      console.log('📱 Push notifications not enabled, skipping token registration');
      return;
    }

    const pushToken = PushNotificationManager.getPushToken();
    if (!pushToken) {
      console.log('📱 No push token available, skipping registration');
      return;
    }

    try {
      const registrationData: TokenRegistrationData = {
        storeId,
        userId,
        platform: Platform.OS as 'android' | 'ios',
        token: pushToken,
        appVersion: APP_CONFIG.appVersion || '1.0.0',
        locale: 'en-US', // This could be dynamic
      };

      await this.registerToken(registrationData);
      console.log('📱 Auto-registered push token with backend');
    } catch (error) {
      console.error('❌ Failed to auto-register push token:', error);
    }
  }

  /**
   * Auto-subscribe to default topics
   */
  static async autoSubscribeToTopics(storeId: string): Promise<void> {
    if (!FeatureManager.isPushNotificationsEnabled()) {
      console.log('📱 Push notifications not enabled, skipping topic subscription');
      return;
    }

    const pushToken = PushNotificationManager.getPushToken();
    if (!pushToken) {
      console.log('📱 No push token available, skipping topic subscription');
      return;
    }

    try {
      const defaultTopics = ['orders', 'promotions', 'general'];
      
      for (const topic of defaultTopics) {
        try {
          await this.subscribeToTopic({
            storeId,
            token: pushToken,
            topic,
          });
        } catch (error) {
          console.error(`❌ Failed to subscribe to topic ${topic}:`, error);
        }
      }

      console.log('📱 Auto-subscribed to default topics');
    } catch (error) {
      console.error('❌ Failed to auto-subscribe to topics:', error);
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(storeId?: string): Promise<number> {
    try {
      const params = storeId ? `?storeId=${storeId}` : '';
      const result = await this.makeRequest<{ count: number }>(`/unread-count${params}`);
      return result.count;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Check if service is initialized
   */
  static isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset service state
   */
  static reset(): void {
    this.isInitialized = false;
    this.authToken = null;
    console.log('📱 Mobile notification service reset');
  }
}
