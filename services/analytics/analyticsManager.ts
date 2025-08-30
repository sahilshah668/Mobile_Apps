import { GA4Service } from './ga4Service';
import { SentryService } from './sentryService';
import { FeatureManager } from '../featureManager';
import { APP_CONFIG } from '../../config/appConfig';

export interface AnalyticsConfig {
  ga4Id?: string;
  sentryDsn?: string;
  environment?: string;
  release?: string;
  debug?: boolean;
}

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

export class AnalyticsManager {
  private static isInitialized = false;
  private static config: AnalyticsConfig = {};

  /**
   * Initialize analytics services
   */
  static initialize(config?: AnalyticsConfig): void {
    // Check if analytics is enabled
    if (!FeatureManager.isAnalyticsEnabled()) {
      console.log('📊 Analytics not enabled in app config');
      return;
    }

    this.config = {
      ga4Id: config?.ga4Id || APP_CONFIG.appRequest?.analytics?.ga4Id,
      sentryDsn: config?.sentryDsn || APP_CONFIG.appRequest?.analytics?.sentryDsn,
      environment: config?.environment || 'development',
      release: config?.release || '1.0.0',
      debug: config?.debug || false
    };

    try {
      // Initialize GA4 if enabled
      if (FeatureManager.isGA4Enabled() && this.config.ga4Id) {
        GA4Service.initialize(this.config.ga4Id);
        console.log('📊 GA4 initialized');
      }

      // Initialize Sentry if enabled
      if (FeatureManager.isSentryEnabled() && this.config.sentryDsn) {
        SentryService.initialize(this.config.sentryDsn, {
          environment: this.config.environment,
          release: this.config.release,
          debug: this.config.debug
        });
        console.log('🔍 Sentry initialized');
      }

      this.isInitialized = true;
      console.log('✅ Analytics manager initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing analytics:', error);
    }
  }

  /**
   * Track event across all analytics services
   */
  static trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot track event');
      return;
    }

    try {
      // Track in GA4
      if (FeatureManager.isGA4Enabled()) {
        GA4Service.trackEvent(event.name, event.parameters || {});
      }

      // Track in Sentry if it's an error-level event
      if (FeatureManager.isSentryEnabled() && event.level && ['fatal', 'error', 'warning'].includes(event.level)) {
        SentryService.captureMessage(event.name, event.level, event.parameters);
      }
    } catch (error) {
      console.error('❌ Error tracking event:', error);
    }
  }

  /**
   * Track screen view
   */
  static trackScreen(screenName: string, parameters?: Record<string, any>): void {
    this.trackEvent({
      name: 'screen_view',
      parameters: {
        screen_name: screenName,
        screen_class: screenName,
        ...parameters
      }
    });
  }

  /**
   * Track user engagement
   */
  static trackEngagement(engagementTime: number): void {
    this.trackEvent({
      name: 'user_engagement',
      parameters: {
        engagement_time_msec: engagementTime
      }
    });
  }

  /**
   * Track error
   */
  static trackError(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot track error');
      return;
    }

    try {
      // Track in GA4
      if (FeatureManager.isGA4Enabled()) {
        GA4Service.trackError(error, context);
      }

      // Track in Sentry
      if (FeatureManager.isSentryEnabled()) {
        SentryService.captureException(error, context);
      }
    } catch (trackingError) {
      console.error('❌ Error tracking error:', trackingError);
    }
  }

  /**
   * Track performance
   */
  static trackPerformance(action: string, duration: number, parameters?: Record<string, any>): void {
    this.trackEvent({
      name: 'performance',
      parameters: {
        action,
        duration,
        ...parameters
      }
    });
  }

  /**
   * Set user across all analytics services
   */
  static setUser(userId: string, userData?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot set user');
      return;
    }

    try {
      // Set user in GA4
      if (FeatureManager.isGA4Enabled()) {
        GA4Service.setUserId(userId);
        if (userData) {
          Object.entries(userData).forEach(([key, value]) => {
            GA4Service.setUserProperty(key, String(value));
          });
        }
      }

      // Set user in Sentry
      if (FeatureManager.isSentryEnabled()) {
        SentryService.setUser({
          id: userId,
          ...userData
        });
      }
    } catch (error) {
      console.error('❌ Error setting user:', error);
    }
  }

  /**
   * Add breadcrumb
   */
  static addBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot add breadcrumb');
      return;
    }

    try {
      // Add breadcrumb in Sentry
      if (FeatureManager.isSentryEnabled()) {
        SentryService.addBreadcrumb(message, category, data);
      }
    } catch (error) {
      console.error('❌ Error adding breadcrumb:', error);
    }
  }

  /**
   * Start performance monitoring
   */
  static startTransaction(name: string, operation: string): string {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot start transaction');
      return '';
    }

    try {
      // Start transaction in Sentry
      if (FeatureManager.isSentryEnabled()) {
        return SentryService.startTransaction(name, operation);
      }
    } catch (error) {
      console.error('❌ Error starting transaction:', error);
    }

    return '';
  }

  /**
   * Finish performance monitoring
   */
  static finishTransaction(transactionId: string, status: 'ok' | 'cancelled' | 'unknown_error' | 'aborted' = 'ok'): void {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot finish transaction');
      return;
    }

    try {
      // Finish transaction in Sentry
      if (FeatureManager.isSentryEnabled()) {
        SentryService.finishTransaction(transactionId, status);
      }
    } catch (error) {
      console.error('❌ Error finishing transaction:', error);
    }
  }

  /**
   * Set tag across all analytics services
   */
  static setTag(key: string, value: string): void {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot set tag');
      return;
    }

    try {
      // Set tag in Sentry
      if (FeatureManager.isSentryEnabled()) {
        SentryService.setTag(key, value);
      }
    } catch (error) {
      console.error('❌ Error setting tag:', error);
    }
  }

  /**
   * Set extra context
   */
  static setExtra(key: string, value: any): void {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot set extra');
      return;
    }

    try {
      // Set extra in Sentry
      if (FeatureManager.isSentryEnabled()) {
        SentryService.setExtra(key, value);
      }
    } catch (error) {
      console.error('❌ Error setting extra:', error);
    }
  }

  /**
   * Flush all analytics data
   */
  static async flush(timeout?: number): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot flush');
      return false;
    }

    try {
      const promises: Promise<boolean>[] = [];

      // Flush Sentry
      if (FeatureManager.isSentryEnabled()) {
        promises.push(SentryService.flush(timeout));
      }

      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('❌ Error flushing analytics:', error);
      return false;
    }
  }

  /**
   * Close all analytics services
   */
  static close(): void {
    if (!this.isInitialized) {
      console.warn('📊 Analytics not initialized, cannot close');
      return;
    }

    try {
      // Close Sentry
      if (FeatureManager.isSentryEnabled()) {
        SentryService.close();
      }

      this.isInitialized = false;
      console.log('📊 Analytics manager closed');
    } catch (error) {
      console.error('❌ Error closing analytics:', error);
    }
  }

  /**
   * Check if analytics is initialized
   */
  static isAnalyticsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get analytics configuration
   */
  static getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Get analytics status
   */
  static getStatus(): Record<string, boolean> {
    return {
      initialized: this.isInitialized,
      ga4Enabled: FeatureManager.isGA4Enabled(),
      ga4Initialized: GA4Service.isGA4Initialized(),
      sentryEnabled: FeatureManager.isSentryEnabled(),
      sentryInitialized: SentryService.isSentryInitialized()
    };
  }

  /**
   * Reset analytics manager (for testing)
   */
  static reset(): void {
    this.isInitialized = false;
    this.config = {};
    GA4Service.reset();
    SentryService.reset();
    console.log('📊 Analytics manager reset');
  }
}
