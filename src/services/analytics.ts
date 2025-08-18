import APP_CONFIG from '../config/appConfig';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private isInitialized = false;
  private userId?: string;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize GA4 if enabled
      if (APP_CONFIG.analytics?.enableGA4 && APP_CONFIG.analytics?.ga4Id) {
        await this.initializeGA4();
      }

      // Initialize Sentry if enabled
      if (APP_CONFIG.analytics?.enableSentry && APP_CONFIG.analytics?.sentryDsn) {
        await this.initializeSentry();
      }

      // Initialize Facebook Analytics if enabled
      if (APP_CONFIG.analytics?.facebookAppId) {
        await this.initializeFacebook();
      }

      // Initialize Segment if enabled
      if (APP_CONFIG.analytics?.segmentKey) {
        await this.initializeSegment();
      }

      // Initialize Mixpanel if enabled
      if (APP_CONFIG.analytics?.mixpanelKey) {
        await this.initializeMixpanel();
      }

      this.isInitialized = true;
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private async initializeGA4(): Promise<void> {
    try {
      // Note: GA4 for React Native typically requires expo-firebase-analytics
      // This is a placeholder for when the package is added
      console.log('GA4 initialized with ID:', APP_CONFIG.analytics?.ga4Id);
    } catch (error) {
      console.error('Failed to initialize GA4:', error);
    }
  }

  private async initializeSentry(): Promise<void> {
    try {
      // Note: Sentry requires @sentry/react-native
      // This is a placeholder for when the package is added
      console.log('Sentry initialized with DSN:', APP_CONFIG.analytics?.sentryDsn);
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  private async initializeFacebook(): Promise<void> {
    try {
      // Note: Facebook Analytics requires react-native-fbsdk-next
      // This is a placeholder for when the package is added
      console.log('Facebook Analytics initialized with App ID:', APP_CONFIG.analytics?.facebookAppId);
    } catch (error) {
      console.error('Failed to initialize Facebook Analytics:', error);
    }
  }

  private async initializeSegment(): Promise<void> {
    try {
      // Note: Segment requires @segment/analytics-react-native
      // This is a placeholder for when the package is added
      console.log('Segment initialized with key:', APP_CONFIG.analytics?.segmentKey);
    } catch (error) {
      console.error('Failed to initialize Segment:', error);
    }
  }

  private async initializeMixpanel(): Promise<void> {
    try {
      // Note: Mixpanel requires react-native-mixpanel
      // This is a placeholder for when the package is added
      console.log('Mixpanel initialized with key:', APP_CONFIG.analytics?.mixpanelKey);
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
    }
  }

  track(event: AnalyticsEvent): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, event not tracked:', event);
      return;
    }

    try {
      // Track with GA4
      if (APP_CONFIG.analytics?.enableGA4) {
        this.trackGA4(event);
      }

      // Track with Facebook
      if (APP_CONFIG.analytics?.facebookAppId) {
        this.trackFacebook(event);
      }

      // Track with Segment
      if (APP_CONFIG.analytics?.segmentKey) {
        this.trackSegment(event);
      }

      // Track with Mixpanel
      if (APP_CONFIG.analytics?.mixpanelKey) {
        this.trackMixpanel(event);
      }

      console.log('Event tracked:', event);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  private trackGA4(event: AnalyticsEvent): void {
    // Placeholder for GA4 tracking
    console.log('GA4 track:', event);
  }

  private trackFacebook(event: AnalyticsEvent): void {
    // Placeholder for Facebook tracking
    console.log('Facebook track:', event);
  }

  private trackSegment(event: AnalyticsEvent): void {
    // Placeholder for Segment tracking
    console.log('Segment track:', event);
  }

  private trackMixpanel(event: AnalyticsEvent): void {
    // Placeholder for Mixpanel tracking
    console.log('Mixpanel track:', event);
  }

  identify(user: AnalyticsUser): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, user not identified');
      return;
    }

    this.userId = user.id;

    try {
      // Identify with GA4
      if (APP_CONFIG.analytics?.enableGA4) {
        this.identifyGA4(user);
      }

      // Identify with Facebook
      if (APP_CONFIG.analytics?.facebookAppId) {
        this.identifyFacebook(user);
      }

      // Identify with Segment
      if (APP_CONFIG.analytics?.segmentKey) {
        this.identifySegment(user);
      }

      // Identify with Mixpanel
      if (APP_CONFIG.analytics?.mixpanelKey) {
        this.identifyMixpanel(user);
      }

      console.log('User identified:', user);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  private identifyGA4(user: AnalyticsUser): void {
    // Placeholder for GA4 user identification
    console.log('GA4 identify:', user);
  }

  private identifyFacebook(user: AnalyticsUser): void {
    // Placeholder for Facebook user identification
    console.log('Facebook identify:', user);
  }

  private identifySegment(user: AnalyticsUser): void {
    // Placeholder for Segment user identification
    console.log('Segment identify:', user);
  }

  private identifyMixpanel(user: AnalyticsUser): void {
    // Placeholder for Mixpanel user identification
    console.log('Mixpanel identify:', user);
  }

  // Convenience methods for common events
  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.track({
      name: 'Screen View',
      properties: {
        screen_name: screenName,
        ...properties,
      },
    });
  }

  trackProductView(productId: string, productName: string, properties?: Record<string, any>): void {
    this.track({
      name: 'Product View',
      properties: {
        product_id: productId,
        product_name: productName,
        ...properties,
      },
    });
  }

  trackAddToCart(productId: string, productName: string, quantity: number, price: number, properties?: Record<string, any>): void {
    this.track({
      name: 'Add to Cart',
      properties: {
        product_id: productId,
        product_name: productName,
        quantity,
        price,
        ...properties,
      },
    });
  }

  trackPurchase(orderId: string, total: number, currency: string = 'USD', properties?: Record<string, any>): void {
    this.track({
      name: 'Purchase',
      properties: {
        order_id: orderId,
        total,
        currency,
        ...properties,
      },
    });
  }
}

export const analytics = new AnalyticsService();

export default analytics;
