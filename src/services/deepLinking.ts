import APP_CONFIG from '../config/appConfig';

export interface DeepLinkConfig {
  scheme: string;
  prefixes: string[];
  config: {
    screens: Record<string, any>;
  };
}

export interface DeepLinkHandler {
  (url: string, data?: Record<string, any>): void;
}

class DeepLinkingService {
  private handlers: Map<string, DeepLinkHandler> = new Map();
  private isInitialized = false;

  getLinkingConfig(): DeepLinkConfig {
    const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
    const appLinksDomains = APP_CONFIG.links?.appLinksDomains || [];
    const associatedDomains = APP_CONFIG.links?.associatedDomains || [];

    // Create prefixes array
    const prefixes = [
      `${scheme}://`,
      ...appLinksDomains.map(domain => `https://${domain}`),
      ...associatedDomains.map(domain => `https://${domain}`),
    ];

    return {
      scheme,
      prefixes,
      config: {
        screens: {
          // Main app screens
          '(tabs)': {
            screens: {
              index: 'home',
              search: 'search',
              cart: 'cart',
              profile: 'profile',
            },
          },
          // Product screens
          product: {
            path: 'product/:id',
            parse: {
              id: (id: string) => id,
            },
          },
          // Category screens
          category: {
            path: 'category/:id',
            parse: {
              id: (id: string) => id,
            },
          },
          // Search results
          'search-results': {
            path: 'search/:query',
            parse: {
              query: (query: string) => decodeURIComponent(query),
            },
          },
          // Order tracking
          'order-tracking': {
            path: 'order/:orderId',
            parse: {
              orderId: (orderId: string) => orderId,
            },
          },
          // Notifications
          notifications: 'notifications',
          // VIP offers
          'vip-offers': 'vip-offers',
          // Legal pages
          legal: {
            screens: {
              privacy: 'privacy',
              terms: 'terms',
              support: 'support',
            },
          },
        },
      },
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Register default handlers
      this.registerDefaultHandlers();

      this.isInitialized = true;
      console.log('Deep linking service initialized');
    } catch (error) {
      console.error('Failed to initialize deep linking service:', error);
    }
  }

  private registerDefaultHandlers(): void {
    // Product deep link handler
    this.registerHandler('product', (url, data) => {
      console.log('Product deep link:', url, data);
      // Navigate to product screen
      // This would typically use navigation.navigate('product', { id: data?.id })
    });

    // Category deep link handler
    this.registerHandler('category', (url, data) => {
      console.log('Category deep link:', url, data);
      // Navigate to category screen
    });

    // Search deep link handler
    this.registerHandler('search', (url, data) => {
      console.log('Search deep link:', url, data);
      // Navigate to search results
    });

    // Order tracking deep link handler
    this.registerHandler('order', (url, data) => {
      console.log('Order tracking deep link:', url, data);
      // Navigate to order tracking
    });

    // Legal pages deep link handlers
    this.registerHandler('privacy', (url, data) => {
      console.log('Privacy policy deep link:', url, data);
      // Navigate to privacy policy
    });

    this.registerHandler('terms', (url, data) => {
      console.log('Terms of service deep link:', url, data);
      // Navigate to terms of service
    });

    this.registerHandler('support', (url, data) => {
      console.log('Support deep link:', url, data);
      // Navigate to support page
    });
  }

  registerHandler(type: string, handler: DeepLinkHandler): void {
    this.handlers.set(type, handler);
  }

  handleDeepLink(url: string): void {
    try {
      console.log('Handling deep link:', url);

      // Parse the URL to determine the type and extract data
      const parsed = this.parseDeepLink(url);
      if (!parsed) {
        console.warn('Could not parse deep link:', url);
        return;
      }

      const { type, data } = parsed;
      const handler = this.handlers.get(type);

      if (handler) {
        handler(url, data);
      } else {
        console.warn('No handler registered for deep link type:', type);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  private parseDeepLink(url: string): { type: string; data?: Record<string, any> } | null {
    try {
      const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
      
      // Handle scheme-based URLs
      if (url.startsWith(`${scheme}://`)) {
        const path = url.replace(`${scheme}://`, '');
        return this.parsePath(path);
      }

      // Handle HTTPS URLs (App Links / Associated Domains)
      if (url.startsWith('https://')) {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        return this.parsePath(path);
      }

      return null;
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return null;
    }
  }

  private parsePath(path: string): { type: string; data?: Record<string, any> } | null {
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return { type: 'home' };
    }

    const [type, ...params] = segments;

    switch (type) {
      case 'product':
        return {
          type: 'product',
          data: { id: params[0] },
        };
      case 'category':
        return {
          type: 'category',
          data: { id: params[0] },
        };
      case 'search':
        return {
          type: 'search',
          data: { query: params[0] },
        };
      case 'order':
        return {
          type: 'order',
          data: { orderId: params[0] },
        };
      case 'privacy':
        return { type: 'privacy' };
      case 'terms':
        return { type: 'terms' };
      case 'support':
        return { type: 'support' };
      default:
        return { type };
    }
  }

  // Generate deep link URLs
  generateProductLink(productId: string): string {
    const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
    return `${scheme}://product/${productId}`;
  }

  generateCategoryLink(categoryId: string): string {
    const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
    return `${scheme}://category/${categoryId}`;
  }

  generateSearchLink(query: string): string {
    const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
    return `${scheme}://search/${encodeURIComponent(query)}`;
  }

  generateOrderLink(orderId: string): string {
    const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
    return `${scheme}://order/${orderId}`;
  }

  generatePrivacyLink(): string {
    const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
    return `${scheme}://privacy`;
  }

  generateTermsLink(): string {
    const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
    return `${scheme}://terms`;
  }

  generateSupportLink(): string {
    const scheme = APP_CONFIG.identifiers?.scheme || 'fashionsaga';
    return `${scheme}://support`;
  }

  // Check if deep linking is enabled
  isEnabled(): boolean {
    return this.isInitialized && !!APP_CONFIG.identifiers?.scheme;
  }

  // Get supported domains for App Links
  getAppLinksDomains(): string[] {
    return APP_CONFIG.links?.appLinksDomains || [];
  }

  // Get supported domains for Associated Domains
  getAssociatedDomains(): string[] {
    return APP_CONFIG.links?.associatedDomains || [];
  }
}

export const deepLinking = new DeepLinkingService();

export default deepLinking;
