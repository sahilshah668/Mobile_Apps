import { FeatureManager } from '../featureManager';
import { APP_CONFIG } from '../../config/appConfig';

export interface GA4Event {
  name: string;
  parameters?: Record<string, any>;
}

export interface GA4UserProperty {
  name: string;
  value: string;
}

export interface PurchaseData {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{
    itemId: string;
    itemName: string;
    price: number;
    quantity: number;
  }>;
}

export class GA4Service {
  private static isInitialized = false;
  private static ga4Id: string | null = null;

  /**
   * Initialize Google Analytics 4
   */
  static initialize(ga4Id?: string): void {
    // Check if analytics is enabled
    if (!FeatureManager.isAnalyticsEnabled()) {
      console.log('📊 Analytics not enabled in app config');
      return;
    }

    // Use provided ga4Id or get from config
    const configGa4Id = ga4Id || APP_CONFIG.appRequest?.analytics?.ga4Id;
    
    if (!configGa4Id) {
      console.log('📊 No GA4 ID provided');
      return;
    }

    this.ga4Id = configGa4Id;
    this.isInitialized = true;

    // In a real implementation, you would initialize the GA4 SDK here
    // For now, we'll simulate the initialization
    console.log('📊 Google Analytics 4 initialized with ID:', configGa4Id);
  }

  /**
   * Track a custom event
   */
  static trackEvent(eventName: string, parameters: Record<string, any> = {}): void {
    if (!this.isInitialized) {
      console.warn('📊 GA4 not initialized, cannot track event:', eventName);
      return;
    }

    const event: GA4Event = {
      name: eventName,
      parameters: {
        ...parameters,
        timestamp: Date.now(),
        app_name: APP_CONFIG.store.branding.appName,
      }
    };

    // In a real implementation, you would send this to GA4
    console.log('📊 GA4 Event:', event);
  }

  /**
   * Track screen view
   */
  static trackScreen(screenName: string, parameters: Record<string, any> = {}): void {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenName,
      ...parameters
    });
  }

  /**
   * Track user engagement
   */
  static trackEngagement(engagementTime: number): void {
    this.trackEvent('user_engagement', {
      engagement_time_msec: engagementTime
    });
  }

  /**
   * Track purchase event
   */
  static trackPurchase(purchaseData: PurchaseData): void {
    this.trackEvent('purchase', {
      transaction_id: purchaseData.transactionId,
      value: purchaseData.value,
      currency: purchaseData.currency,
      items: purchaseData.items.map(item => ({
        item_id: item.itemId,
        item_name: item.itemName,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  /**
   * Track add to cart event
   */
  static trackAddToCart(itemId: string, itemName: string, price: number, quantity: number = 1): void {
    this.trackEvent('add_to_cart', {
      items: [{
        item_id: itemId,
        item_name: itemName,
        price: price,
        quantity: quantity
      }]
    });
  }

  /**
   * Track remove from cart event
   */
  static trackRemoveFromCart(itemId: string, itemName: string, price: number, quantity: number = 1): void {
    this.trackEvent('remove_from_cart', {
      items: [{
        item_id: itemId,
        item_name: itemName,
        price: price,
        quantity: quantity
      }]
    });
  }

  /**
   * Track view item event
   */
  static trackViewItem(itemId: string, itemName: string, price: number, category?: string): void {
    this.trackEvent('view_item', {
      items: [{
        item_id: itemId,
        item_name: itemName,
        price: price,
        item_category: category
      }]
    });
  }

  /**
   * Track search event
   */
  static trackSearch(searchTerm: string, resultsCount?: number): void {
    this.trackEvent('search', {
      search_term: searchTerm,
      number_of_results: resultsCount
    });
  }

  /**
   * Track user sign up event
   */
  static trackSignUp(method: string): void {
    this.trackEvent('sign_up', {
      method: method
    });
  }

  /**
   * Track user login event
   */
  static trackLogin(method: string): void {
    this.trackEvent('login', {
      method: method
    });
  }

  /**
   * Track user logout event
   */
  static trackLogout(): void {
    this.trackEvent('logout');
  }

  /**
   * Set user properties
   */
  static setUserProperty(name: string, value: string): void {
    if (!this.isInitialized) {
      console.warn('📊 GA4 not initialized, cannot set user property');
      return;
    }

    // In a real implementation, you would set user properties in GA4
    console.log('📊 GA4 User Property:', { name, value });
  }

  /**
   * Set user ID
   */
  static setUserId(userId: string): void {
    if (!this.isInitialized) {
      console.warn('📊 GA4 not initialized, cannot set user ID');
      return;
    }

    // In a real implementation, you would set user ID in GA4
    console.log('📊 GA4 User ID set:', userId);
  }

  /**
   * Track app open event
   */
  static trackAppOpen(): void {
    this.trackEvent('app_open');
  }

  /**
   * Track app close event
   */
  static trackAppClose(): void {
    this.trackEvent('app_close');
  }

  /**
   * Track error event
   */
  static trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent('app_error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    });
  }

  /**
   * Track performance event
   */
  static trackPerformance(action: string, duration: number, parameters: Record<string, any> = {}): void {
    this.trackEvent('performance', {
      action: action,
      duration: duration,
      ...parameters
    });
  }

  /**
   * Check if GA4 is initialized
   */
  static isGA4Initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get GA4 ID
   */
  static getGA4Id(): string | null {
    return this.ga4Id;
  }

  /**
   * Reset GA4 service (for testing)
   */
  static reset(): void {
    this.isInitialized = false;
    this.ga4Id = null;
    console.log('📊 GA4 service reset');
  }
}
